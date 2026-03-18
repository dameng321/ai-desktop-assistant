use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct EmbeddingRequest {
    model: String,
    input: String,
}

#[derive(Debug, Deserialize)]
struct EmbeddingResponse {
    data: Vec<EmbeddingData>,
}

#[derive(Debug, Deserialize)]
struct EmbeddingData {
    embedding: Vec<f32>,
}

pub async fn get_embedding(
    base_url: &str,
    api_key: &str,
    text: &str,
    model: &str,
) -> Result<Vec<f32>, String> {
    let client = reqwest::Client::new();
    
    let url = format!("{}/embeddings", base_url.trim_end_matches('/'));
    
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    headers.insert("Authorization", format!("Bearer {}", api_key).parse().unwrap());
    
    let request = EmbeddingRequest {
        model: model.to_string(),
        input: text.to_string(),
    };
    
    let response = client
        .post(&url)
        .headers(headers)
        .json(&request)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "未知错误".to_string());
        return Err(format!("API 错误: {}", error_text));
    }
    
    let result: EmbeddingResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;
    
    result
        .data
        .first()
        .map(|d| d.embedding.clone())
        .ok_or_else(|| "未返回 embedding".to_string())
}