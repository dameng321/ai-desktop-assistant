use crate::models::{SystemInfo, UserPaths};
use std::env;
use tauri::command;

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