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

#[derive(Debug, Deserialize)]
struct ErrorResponse {
    error: Option<ErrorDetail>,
    message: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ErrorDetail {
    message: Option<String>,
}

pub async fn get_embedding(
    base_url: &str,
    api_key: &str,
    text: &str,
    model: &str,
) -> Result<Vec<f32>, String> {
    let client = reqwest::Client::new();
    
    let base = base_url.trim_end_matches('/');
    let url = format!("{}/embeddings", base);
    
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
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;
    
    let status = response.status();
    
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "未知错误".to_string());
        
        if status.as_u16() == 404 {
            return Err(format!(
                "Embeddings API 不支持或端点不存在。\n\
                当前请求: {}\n\
                请确保:\n\
                1. 使用 OpenAI 兼容的 API (如 OpenAI, DeepSeek, Moonshot)\n\
                2. baseUrl 格式正确 (如 https://api.openai.com/v1)\n\
                3. 模型名称正确 (如 text-embedding-3-small)\n\
                原始错误: {}",
                url, error_text
            ));
        }
        
        if let Ok(err) = serde_json::from_str::<ErrorResponse>(&error_text) {
            let msg = err.error.and_then(|e| e.message)
                .or(err.message)
                .unwrap_or_else(|| error_text.clone());
            return Err(format!("API 错误: {}", msg));
        }
        
        return Err(format!("API 错误 ({}): {}", status, error_text));
    }
    
    let result: EmbeddingResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;
    
    result
        .data
        .first()
        .map(|d| d.embedding.clone())
        .ok_or_else(|| "未返回 embedding 数据".to_string())
}