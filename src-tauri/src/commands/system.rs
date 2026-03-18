use crate::models::{SystemInfo, UserPaths};
use std::env;
use tauri::{command, Emitter};
use serde::{Deserialize, Serialize};
use futures_util::StreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
    stream: bool,
}

#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Debug, Deserialize)]
struct ChatChoice {
    delta: Option<ChatDelta>,
    message: Option<ChatMessage>,
}

#[derive(Debug, Deserialize)]
struct ChatDelta {
    content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIModelsResponse {
    data: Vec<OpenAIModel>,
}

#[derive(Debug, Deserialize)]
struct OpenAIModel {
    id: String,
}

#[derive(Debug, Deserialize)]
struct OllamaModelsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Deserialize)]
struct OllamaModel {
    name: String,
}

#[derive(Debug, Deserialize)]
struct GoogleModelsResponse {
    models: Vec<GoogleModel>,
}

#[derive(Debug, Deserialize)]
struct GoogleModel {
    name: String,
}

#[command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    let os = env::consts::OS.to_string();
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let version = sys_info::os_release().unwrap_or_else(|_| "unknown".to_string());
    let memory = sys_info::mem_info()
        .map(|m| m.total * 1024) // 转换为字节
        .unwrap_or(0);

    let cpu = sys_info::cpu_speed()
        .map(|s| format!("{} MHz", s))
        .unwrap_or_else(|_| "unknown".to_string());

    Ok(SystemInfo {
        os,
        version,
        hostname,
        cpu,
        memory,
    })
}

#[command]
pub async fn open_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("打开路径失败: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("打开路径失败: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("打开路径失败: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn get_user_paths() -> Result<UserPaths, String> {
    let home = dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| String::new());

    let desktop = dirs::desktop_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| home.clone());

    let documents = dirs::document_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| home.clone());

    let downloads = dirs::download_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| home.clone());

    let pictures = dirs::picture_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| home.clone());

    Ok(UserPaths {
        home,
        desktop,
        documents,
        downloads,
        pictures,
    })
}

#[command]
pub async fn test_api_connection(
    base_url: String,
    api_key: String,
    provider_id: String,
) -> Result<bool, String> {
    let client = reqwest::Client::new();
    
    let (url, mut headers) = match provider_id.as_str() {
        "google" => {
            (
                format!("{}/models?key={}", base_url.trim_end_matches('/'), api_key),
                reqwest::header::HeaderMap::new(),
            )
        }
        "anthropic" => {
            let mut h = reqwest::header::HeaderMap::new();
            h.insert("x-api-key", api_key.parse().unwrap());
            h.insert("anthropic-version", "2023-06-01".parse().unwrap());
            (
                format!("{}/models", base_url.trim_end_matches('/')),
                h,
            )
        }
        "ollama" => {
            (
                format!("{}/tags", base_url.trim_end_matches('/')),
                reqwest::header::HeaderMap::new(),
            )
        }
        _ => {
            let mut h = reqwest::header::HeaderMap::new();
            h.insert("Authorization", format!("Bearer {}", api_key).parse().unwrap());
            (
                format!("{}/models", base_url.trim_end_matches('/')),
                h,
            )
        }
    };
    
    headers.insert("Content-Type", "application/json".parse().unwrap());
    
    let response = client
        .get(&url)
        .headers(headers)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("连接失败: {}", e))?;
    
    if response.status().is_success() {
        Ok(true)
    } else {
        Err(format!("API 返回错误: {}", response.status()))
    }
}

#[command]
pub async fn chat_stream(
    app: tauri::AppHandle,
    base_url: String,
    api_key: String,
    provider_id: String,
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
    request_id: String,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    
    if provider_id != "ollama" && !api_key.is_empty() {
        headers.insert("Authorization", format!("Bearer {}", api_key).parse().unwrap());
    }
    
    let request = ChatRequest {
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
    };
    
    let response = client
        .post(&url)
        .headers(headers)
        .json(&request)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "未知错误".to_string());
        return Err(format!("API 错误: {}", error_text));
    }
    
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();
    
    while let Some(chunk_result) = stream.next().await {
        let chunk = match chunk_result {
            Ok(c) => c,
            Err(e) => {
                let _ = app.emit(&format!("chat-error-{}", request_id), e.to_string());
                break;
            }
        };
        
        let text = String::from_utf8_lossy(&chunk);
        buffer.push_str(&text);
        
        while let Some(newline_pos) = buffer.find('\n') {
            let line = buffer[..newline_pos].to_string();
            buffer = buffer[newline_pos + 1..].to_string();
            
            let line = line.trim();
            if line.is_empty() || line == "data: [DONE]" {
                continue;
            }
            
            if line.starts_with("data: ") {
                let json_str = &line[6..];
                if let Ok(data) = serde_json::from_str::<ChatResponse>(json_str) {
                    if let Some(choice) = data.choices.first() {
                        if let Some(delta) = &choice.delta {
                            if let Some(content) = &delta.content {
                                let _ = app.emit(&format!("chat-chunk-{}", request_id), content);
                            }
                        }
                    }
                }
            }
        }
    }
    
    let _ = app.emit(&format!("chat-done-{}", request_id), ());
    Ok(())
}

#[command]
pub async fn chat_cancel(_request_id: String) -> Result<(), String> {
    // TODO: 实现取消功能
    Ok(())
}

#[command]
pub async fn fetch_models(
    base_url: String,
    api_key: String,
    provider_id: String,
) -> Result<Vec<ModelInfo>, String> {
    let client = reqwest::Client::new();
    
    let (url, mut headers) = match provider_id.as_str() {
        "google" => {
            (
                format!("{}/models?key={}", base_url.trim_end_matches('/'), api_key),
                reqwest::header::HeaderMap::new(),
            )
        }
        "anthropic" => {
            return Err("Anthropic 不支持通过 API 获取模型列表".to_string());
        }
        "ollama" => {
            (
                format!("{}/tags", base_url.trim_end_matches('/')),
                reqwest::header::HeaderMap::new(),
            )
        }
        _ => {
            let mut h = reqwest::header::HeaderMap::new();
            if !api_key.is_empty() {
                h.insert("Authorization", format!("Bearer {}", api_key).parse().unwrap());
            }
            (
                format!("{}/models", base_url.trim_end_matches('/')),
                h,
            )
        }
    };
    
    headers.insert("Content-Type", "application/json".parse().unwrap());
    
    let response = client
        .get(&url)
        .headers(headers)
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API 返回错误: {}", response.status()));
    }
    
    let models = match provider_id.as_str() {
        "google" => {
            let data: GoogleModelsResponse = response
                .json()
                .await
                .map_err(|e| format!("解析响应失败: {}", e))?;
            data.models
                .into_iter()
                .filter(|m| m.name.starts_with("models/"))
                .map(|m| ModelInfo {
                    id: m.name.trim_start_matches("models/").to_string(),
                    name: m.name.trim_start_matches("models/").to_string(),
                })
                .collect()
        }
        "ollama" => {
            let data: OllamaModelsResponse = response
                .json()
                .await
                .map_err(|e| format!("解析响应失败: {}", e))?;
            data.models
                .into_iter()
                .map(|m| ModelInfo {
                    id: m.name.clone(),
                    name: m.name,
                })
                .collect()
        }
        _ => {
            let data: OpenAIModelsResponse = response
                .json()
                .await
                .map_err(|e| format!("解析响应失败: {}", e))?;
            data.data
                .into_iter()
                .map(|m| ModelInfo {
                    id: m.id.clone(),
                    name: m.id,
                })
                .collect()
        }
    };
    
    Ok(models)
}