use crate::models::SystemInfo;
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