use rusqlite::{Connection, Result as SqliteResult};
use std::sync::Mutex;
use tauri::Manager;

pub struct KnowledgeDatabase {
    conn: Mutex<Connection>,
}

impl KnowledgeDatabase {
    pub fn new(app_handle: &tauri::AppHandle) -> SqliteResult<Self> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data dir");
        
        std::fs::create_dir_all(&app_data_dir).ok();
        
        let db_path = app_data_dir.join("knowledge.db");
        let conn = Connection::open(db_path)?;
        
        let db = Self {
            conn: Mutex::new(conn),
        };
        
        db.initialize()?;
        Ok(db)
    }
    
    fn initialize(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS knowledge_bases (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                kb_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                status TEXT NOT NULL,
                error TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS text_chunks (
                id TEXT PRIMARY KEY,
                doc_id TEXT NOT NULL,
                kb_id TEXT NOT NULL,
                content TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                embedding BLOB,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE,
                FOREIGN KEY (kb_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_documents_kb_id ON documents(kb_id);
            CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON text_chunks(doc_id);
            CREATE INDEX IF NOT EXISTS idx_chunks_kb_id ON text_chunks(kb_id);
            "#,
        )?;
        
        // 迁移：添加缺失的列
        let columns: Vec<(String, String)> = conn
            .prepare("SELECT name, type FROM pragma_table_info('text_chunks')")?
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
            .collect::<SqliteResult<Vec<_>>>()?;
        
        let has_embedding = columns.iter().any(|(name, _)| name == "embedding");
        if !has_embedding {
            conn.execute("ALTER TABLE text_chunks ADD COLUMN embedding BLOB", [])?;
        }
        
        Ok(())
    }
    
    pub fn create_knowledge_base(
        &self,
        id: &str,
        name: &str,
        description: Option<&str>,
    ) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp() as u64;
        
        conn.execute(
            "INSERT INTO knowledge_bases (id, name, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![id, name, description, now, now],
        )?;
        
        Ok(())
    }
    
    pub fn list_knowledge_bases(&self) -> SqliteResult<Vec<crate::models::knowledge::KnowledgeBase>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            r#"
            SELECT kb.id, kb.name, kb.description, kb.created_at, kb.updated_at,
                   COUNT(DISTINCT d.id) as document_count,
                   COUNT(c.id) as chunk_count
            FROM knowledge_bases kb
            LEFT JOIN documents d ON kb.id = d.kb_id
            LEFT JOIN text_chunks c ON kb.id = c.kb_id
            GROUP BY kb.id
            ORDER BY kb.updated_at DESC
            "#,
        )?;
        
        let kbs = stmt.query_map([], |row| {
            Ok(crate::models::knowledge::KnowledgeBase {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                document_count: row.get::<_, i64>(5)? as usize,
                chunk_count: row.get::<_, i64>(6)? as usize,
            })
        })?.collect::<SqliteResult<Vec<_>>>();
        
        Ok(kbs?)
    }
    
    pub fn delete_knowledge_base(&self, id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute("DELETE FROM knowledge_bases WHERE id = ?1", [id])?;
        
        Ok(())
    }
    
    pub fn add_document(
        &self,
        id: &str,
        kb_id: &str,
        filename: &str,
        file_type: &str,
        file_size: u64,
        file_path: &str,
    ) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp() as u64;
        
        conn.execute(
            "INSERT INTO documents (id, kb_id, filename, file_type, file_size, file_path, status, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'processing', ?7)",
            rusqlite::params![id, kb_id, filename, file_type, file_size, file_path, now],
        )?;
        
        conn.execute(
            "UPDATE knowledge_bases SET updated_at = ?1 WHERE id = ?2",
            rusqlite::params![now, kb_id],
        )?;
        
        Ok(())
    }
    
    pub fn update_document_status(&self, id: &str, status: &str, error: Option<&str>) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute(
            "UPDATE documents SET status = ?1, error = ?2 WHERE id = ?3",
            rusqlite::params![status, error, id],
        )?;
        
        Ok(())
    }
    
    pub fn list_documents(&self, kb_id: &str) -> SqliteResult<Vec<crate::models::knowledge::Document>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, kb_id, filename, file_type, file_size, file_path, status, error, created_at FROM documents WHERE kb_id = ?1 ORDER BY created_at DESC"
        )?;
        
        let docs = stmt.query_map([kb_id], |row| {
            Ok(crate::models::knowledge::Document {
                id: row.get(0)?,
                kb_id: row.get(1)?,
                filename: row.get(2)?,
                file_type: row.get(3)?,
                file_size: row.get::<_, i64>(4)? as u64,
                file_path: row.get(5)?,
                status: row.get(6)?,
                error: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?.collect::<SqliteResult<Vec<_>>>();
        
        Ok(docs?)
    }
    
    pub fn list_documents_by_id(&self, doc_id: &str) -> SqliteResult<Vec<crate::models::knowledge::Document>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, kb_id, filename, file_type, file_size, file_path, status, error, created_at FROM documents WHERE id = ?1"
        )?;
        
        let docs = stmt.query_map([doc_id], |row| {
            Ok(crate::models::knowledge::Document {
                id: row.get(0)?,
                kb_id: row.get(1)?,
                filename: row.get(2)?,
                file_type: row.get(3)?,
                file_size: row.get::<_, i64>(4)? as u64,
                file_path: row.get(5)?,
                status: row.get(6)?,
                error: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?.collect::<SqliteResult<Vec<_>>>();
        
        Ok(docs?)
    }
    
    pub fn delete_document(&self, id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute("DELETE FROM documents WHERE id = ?1", [id])?;
        
        Ok(())
    }
    
    pub fn add_chunk(
        &self,
        id: &str,
        doc_id: &str,
        kb_id: &str,
        content: &str,
        chunk_index: usize,
    ) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp() as u64;
        
        conn.execute(
            "INSERT INTO text_chunks (id, doc_id, kb_id, content, chunk_index, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![id, doc_id, kb_id, content, chunk_index as i64, now],
        )?;
        
        Ok(())
    }
    
    pub fn update_chunk_embedding(&self, id: &str, embedding: &[f32]) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        let embedding_bytes: Vec<u8> = embedding
            .iter()
            .flat_map(|f| f.to_le_bytes())
            .collect();
        
        conn.execute(
            "UPDATE text_chunks SET embedding = ?1 WHERE id = ?2",
            rusqlite::params![embedding_bytes, id],
        )?;
        
        Ok(())
    }
    
    pub fn get_chunks_without_embedding(&self, kb_id: &str) -> SqliteResult<Vec<(String, String)>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, content FROM text_chunks WHERE kb_id = ?1 AND embedding IS NULL"
        )?;
        
        let chunks = stmt.query_map([kb_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?.collect::<SqliteResult<Vec<_>>>();
        
        Ok(chunks?)
    }
    
    pub fn search_chunks_semantic(
        &self,
        kb_id: &str,
        query_embedding: &[f32],
        limit: usize,
    ) -> SqliteResult<Vec<(crate::models::knowledge::RetrievedChunk, f32)>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            r#"
            SELECT c.id, c.content, c.embedding, d.filename, c.doc_id, c.chunk_index
            FROM text_chunks c
            JOIN documents d ON c.doc_id = d.id
            WHERE c.kb_id = ?1 AND c.embedding IS NOT NULL
            "#
        )?;
        
        let chunks = stmt.query_map([kb_id], |row| {
            let id: String = row.get(0)?;
            let content: String = row.get(1)?;
            let embedding_bytes: Vec<u8> = row.get(2)?;
            let filename: String = row.get(3)?;
            let doc_id: String = row.get(4)?;
            let chunk_index: i64 = row.get(5)?;
            
            let embedding: Vec<f32> = embedding_bytes
                .chunks_exact(4)
                .map(|b| f32::from_le_bytes([b[0], b[1], b[2], b[3]]))
                .collect();
            
            let score = cosine_similarity(query_embedding, &embedding);
            
            Ok((
                crate::models::knowledge::RetrievedChunk {
                    content,
                    filename,
                    document_id: doc_id,
                    chunk_index: chunk_index as usize,
                    score,
                },
                score,
            ))
        })?.collect::<SqliteResult<Vec<_>>>()?;
        
        let mut results: Vec<_> = chunks.into_iter().collect();
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(limit);
        
        Ok(results)
    }
    
    pub fn search_chunks(&self, kb_id: &str, query: &str, limit: usize) -> SqliteResult<Vec<crate::models::knowledge::RetrievedChunk>> {
        let conn = self.conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            r#"
            SELECT c.content, d.filename, c.doc_id, c.chunk_index
            FROM text_chunks c
            JOIN documents d ON c.doc_id = d.id
            WHERE c.kb_id = ?1 AND c.content LIKE ?2
            ORDER BY c.chunk_index
            LIMIT ?3
            "#,
        )?;
        
        let search_pattern = format!("%{}%", query);
        
        let chunks = stmt.query_map(rusqlite::params![kb_id, search_pattern, limit as i64], |row| {
            Ok(crate::models::knowledge::RetrievedChunk {
                content: row.get(0)?,
                filename: row.get(1)?,
                document_id: row.get(2)?,
                chunk_index: row.get::<_, i64>(3)? as usize,
                score: 1.0,
            })
        })?.collect::<SqliteResult<Vec<_>>>();
        
        Ok(chunks?)
    }
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    
    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let mag_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let mag_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    
    if mag_a == 0.0 || mag_b == 0.0 {
        return 0.0;
    }
    
    dot / (mag_a * mag_b)
}