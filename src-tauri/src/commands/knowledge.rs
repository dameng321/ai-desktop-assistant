use crate::models::knowledge::KnowledgeBase;
use crate::services::{KnowledgeDatabase, embedding};
use tauri::{command, State};
use std::path::PathBuf;
use std::fs;
use std::sync::Arc;
use regex::Regex;

#[command]
pub async fn create_knowledge_base(
    db: State<'_, Arc<KnowledgeDatabase>>,
    name: String,
    description: Option<String>,
) -> Result<KnowledgeBase, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp() as u64;
    
    db.create_knowledge_base(&id, &name, description.as_deref())
        .map_err(|e| format!("创建知识库失败: {}", e))?;
    
    Ok(KnowledgeBase {
        id,
        name,
        description,
        created_at: now,
        updated_at: now,
        document_count: 0,
        chunk_count: 0,
    })
}

#[command]
pub async fn list_knowledge_bases(
    db: State<'_, Arc<KnowledgeDatabase>>,
) -> Result<Vec<KnowledgeBase>, String> {
    db.list_knowledge_bases()
        .map_err(|e| format!("获取知识库列表失败: {}", e))
}

#[command]
pub async fn delete_knowledge_base(
    db: State<'_, Arc<KnowledgeDatabase>>,
    id: String,
) -> Result<(), String> {
    db.delete_knowledge_base(&id)
        .map_err(|e| format!("删除知识库失败: {}", e))
}

#[command]
pub async fn add_document(
    db: State<'_, Arc<KnowledgeDatabase>>,
    kb_id: String,
    file_path: String,
) -> Result<crate::models::knowledge::Document, String> {
    let path = PathBuf::from(&file_path);
    
    if !path.exists() {
        return Err(format!("文件不存在: {}", file_path));
    }
    
    let filename = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    
    let file_type = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("获取文件信息失败: {}", e))?;
    
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp() as u64;
    
    db.add_document(&id, &kb_id, &filename, &file_type, metadata.len(), &file_path)
        .map_err(|e| format!("添加文档失败: {}", e))?;
    
    Ok(crate::models::knowledge::Document {
        id: id.clone(),
        kb_id,
        filename,
        file_type,
        file_size: metadata.len(),
        file_path,
        status: "processing".to_string(),
        error: None,
        created_at: now,
    })
}

#[command]
pub async fn list_documents(
    db: State<'_, Arc<KnowledgeDatabase>>,
    kb_id: String,
) -> Result<Vec<crate::models::knowledge::Document>, String> {
    db.list_documents(&kb_id)
        .map_err(|e| format!("获取文档列表失败: {}", e))
}

#[command]
pub async fn process_document(
    db: State<'_, Arc<KnowledgeDatabase>>,
    doc_id: String,
    file_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(&file_path);
    
    if !path.exists() {
        db.update_document_status(&doc_id, "error", Some(&format!("文件不存在: {}", file_path)))
            .ok();
        return Err(format!("文件不存在: {}", file_path));
    }
    
    let extension = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    
    let text_result = match extension.as_str() {
        "pdf" => parse_pdf(&path),
        "docx" => parse_docx(&path),
        "txt" | "md" => parse_text(&path),
        _ => {
            let err = format!("不支持的文件类型: {}", extension);
            db.update_document_status(&doc_id, "error", Some(&err)).ok();
            return Err(err);
        }
    };
    
    let text = match text_result {
        Ok(t) => t,
        Err(e) => {
            db.update_document_status(&doc_id, "error", Some(&e)).ok();
            return Err(e);
        }
    };
    
    let chunks = split_text(&text, 500, 100);
    
    // 获取 kb_id
    let docs = db.list_documents_by_id(&doc_id)
        .map_err(|e| format!("获取文档失败: {}", e))?;
    
    let doc = docs.first().ok_or("文档不存在")?;
    
    for (idx, chunk) in chunks.iter().enumerate() {
        let chunk_id = uuid::Uuid::new_v4().to_string();
        db.add_chunk(&chunk_id, &doc_id, &doc.kb_id, chunk, idx)
            .map_err(|e| format!("添加片段失败: {}", e))?;
    }
    
    db.update_document_status(&doc_id, "ready", None)
        .map_err(|e| format!("更新文档状态失败: {}", e))?;
    
    Ok(())
}

#[command]
pub async fn delete_document(
    db: State<'_, Arc<KnowledgeDatabase>>,
    doc_id: String,
) -> Result<(), String> {
    db.delete_document(&doc_id)
        .map_err(|e| format!("删除文档失败: {}", e))
}

#[command]
pub async fn search_knowledge(
    db: State<'_, Arc<KnowledgeDatabase>>,
    kb_id: String,
    query: String,
    limit: Option<usize>,
) -> Result<Vec<crate::models::knowledge::RetrievedChunk>, String> {
    db.search_chunks(&kb_id, &query, limit.unwrap_or(5))
        .map_err(|e| format!("搜索失败: {}", e))
}

fn parse_pdf(path: &PathBuf) -> Result<String, String> {
    let bytes = fs::read(path)
        .map_err(|e| format!("读取 PDF 失败: {}", e))?;
    
    let text = pdf_extract::extract_text_from_mem(&bytes)
        .map_err(|e| format!("解析 PDF 失败: {}", e))?;
    
    Ok(clean_text(&text))
}

fn parse_docx(path: &PathBuf) -> Result<String, String> {
    let bytes = fs::read(path)
        .map_err(|e| format!("读取 DOCX 失败: {}", e))?;
    
    let doc = docx_rs::read_docx(&bytes)
        .map_err(|e| format!("解析 DOCX 失败: {}", e))?;
    
    let mut text = String::new();
    for child in doc.document.children {
        if let docx_rs::DocumentChild::Paragraph(para) = child {
            for p_child in para.children {
                match p_child {
                    docx_rs::ParagraphChild::Run(run) => {
                        for r_child in run.children {
                            if let docx_rs::RunChild::Text(t) = r_child {
                                text.push_str(&t.text);
                            }
                        }
                    }
                    _ => {}
                }
            }
            text.push('\n');
        }
    }
    
    Ok(clean_text(&text))
}

fn parse_text(path: &PathBuf) -> Result<String, String> {
    let text = fs::read_to_string(path)
        .map_err(|e| format!("读取文本文件失败: {}", e))?;
    
    Ok(clean_text(&text))
}

fn clean_text(text: &str) -> String {
    let re = Regex::new(r"\s+").unwrap();
    re.replace_all(text.trim(), " ").to_string()
}

fn split_text(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
    if text.is_empty() {
        return vec![];
    }
    
    let chars: Vec<char> = text.chars().collect();
    let mut chunks = Vec::new();
    let mut start = 0;
    
    while start < chars.len() {
        let end = (start + chunk_size).min(chars.len());
        let chunk: String = chars[start..end].iter().collect();
        
        if !chunk.trim().is_empty() {
            chunks.push(chunk.trim().to_string());
        }
        
        start += chunk_size - overlap;
        if start >= chars.len() - overlap && end < chars.len() {
            break;
        }
    }
    
    chunks
}

#[command]
pub async fn generate_embeddings(
    db: State<'_, Arc<KnowledgeDatabase>>,
    kb_id: String,
    base_url: String,
    api_key: String,
    model: String,
) -> Result<usize, String> {
    let chunks = db.get_chunks_without_embedding(&kb_id)
        .map_err(|e| format!("获取片段失败: {}", e))?;
    
    let mut count = 0;
    
    for (chunk_id, content) in chunks {
        match embedding::get_embedding(&base_url, &api_key, &content, &model).await {
            Ok(embedding) => {
                db.update_chunk_embedding(&chunk_id, &embedding)
                    .map_err(|e| format!("更新向量失败: {}", e))?;
                count += 1;
            }
            Err(e) => {
                log::warn!("生成向量失败 ({}): {}", chunk_id, e);
            }
        }
    }
    
    Ok(count)
}

#[command]
pub async fn search_semantic(
    db: State<'_, Arc<KnowledgeDatabase>>,
    kb_id: String,
    query: String,
    base_url: String,
    api_key: String,
    model: String,
    limit: Option<usize>,
) -> Result<Vec<crate::models::knowledge::RetrievedChunk>, String> {
    let query_embedding = embedding::get_embedding(&base_url, &api_key, &query, &model).await?;
    
    let results = db.search_chunks_semantic(&kb_id, &query_embedding, limit.unwrap_or(5))
        .map_err(|e| format!("搜索失败: {}", e))?;
    
    Ok(results.into_iter().map(|(chunk, _)| chunk).collect())
}