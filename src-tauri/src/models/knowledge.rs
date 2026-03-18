use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBase {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub document_count: usize,
    pub chunk_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub kb_id: String,
    pub filename: String,
    pub file_type: String,
    pub file_size: u64,
    pub file_path: String,
    pub status: String,
    pub created_at: u64,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextChunk {
    pub id: String,
    pub doc_id: String,
    pub kb_id: String,
    pub content: String,
    pub chunk_index: usize,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievedChunk {
    pub content: String,
    pub score: f32,
    pub document_id: String,
    pub filename: String,
    pub chunk_index: usize,
}