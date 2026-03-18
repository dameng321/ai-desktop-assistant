use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeBase {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
    #[serde(rename = "documentCount")]
    pub document_count: usize,
    #[serde(rename = "chunkCount")]
    pub chunk_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: String,
    #[serde(rename = "kbId")]
    pub kb_id: String,
    pub filename: String,
    #[serde(rename = "fileType")]
    pub file_type: String,
    #[serde(rename = "fileSize")]
    pub file_size: u64,
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TextChunk {
    pub id: String,
    #[serde(rename = "docId")]
    pub doc_id: String,
    #[serde(rename = "kbId")]
    pub kb_id: String,
    pub content: String,
    #[serde(rename = "chunkIndex")]
    pub chunk_index: usize,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RetrievedChunk {
    pub content: String,
    pub score: f32,
    #[serde(rename = "documentId")]
    pub document_id: String,
    pub filename: String,
    #[serde(rename = "chunkIndex")]
    pub chunk_index: usize,
}