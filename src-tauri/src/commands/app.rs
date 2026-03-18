use crate::models::AppInfo;
use std::process::Command;
use tauri::command;

#[command]
pub async fn list_apps() -> Result<Vec<AppInfo>, String> {
    let mut apps = Vec::new();

    #[cfg(target_os = "windows")]
    {
        // 扫描开始菜单
        if let Some(start_menu) = dirs::data_local_dir() {
            let start_menu_path = start_menu.join("Microsoft/Windows/Start Menu/Programs");
            if start_menu_path.exists() {
                scan_shortcuts(&start_menu_path, &mut apps);
            }
        }

        // 扫描公共开始菜单
        let public_start_menu = PathBuf::from("C:/ProgramData/Microsoft/Windows/Start Menu/Programs");
        if public_start_menu.exists() {
            scan_shortcuts(&public_start_menu, &mut apps);
        }
    }

    Ok(apps)
}

#[cfg(target_os = "windows")]
use std::path::PathBuf;

#[cfg(target_os = "windows")]
fn scan_shortcuts(dir: &PathBuf, apps: &mut Vec<AppInfo>) {
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                scan_shortcuts(&path, apps);
            } else if path.extension().map(|e| e == "lnk").unwrap_or(false) {
                let name = path
                    .file_stem()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                
                apps.push(AppInfo {
                    name,
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
    }
}

#[command]
pub async fn open_app(app_path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &app_path])
            .spawn()
            .map_err(|e| format!("启动应用失败: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&app_path)
            .spawn()
            .map_err(|e| format!("启动应用失败: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&app_path)
            .spawn()
            .map_err(|e| format!("启动应用失败: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn close_app(process_name: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("taskkill")
            .args(["/IM", &process_name, "/F"])
            .output()
            .map_err(|e| format!("关闭应用失败: {}", e))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("关闭应用失败: {}", stderr));
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("pkill")
            .arg(&process_name)
            .output()
            .map_err(|e| format!("关闭应用失败: {}", e))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("关闭应用失败: {}", stderr));
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("pkill")
            .arg(&process_name)
            .output()
            .map_err(|e| format!("关闭应用失败: {}", e))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("关闭应用失败: {}", stderr));
        }
    }

    Ok(())
}

#[command]
pub async fn list_running_processes() -> Result<Vec<crate::models::ProcessInfo>, String> {
    let mut processes = Vec::new();

    #[cfg(target_os = "windows")]
    {
        let output = Command::new("tasklist")
            .args(["/FO", "CSV", "/NH"])
            .output()
            .map_err(|e| format!("获取进程列表失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let parts: Vec<&str> = line.split("\",\"").collect();
            if parts.len() >= 2 {
                let name = parts[0].trim_matches('"').to_string();
                let pid = parts[1].trim_matches('"').parse::<u32>().unwrap_or(0);
                
                if !name.is_empty() && pid > 0 {
                    processes.push(crate::models::ProcessInfo {
                        name: name.clone(),
                        pid,
                        process_name: name,
                    });
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("ps")
            .args(["-e", "-o", "pid=,comm="])
            .output()
            .map_err(|e| format!("获取进程列表失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let parts: Vec<&str> = line.trim().splitn(2, ' ').collect();
            if parts.len() == 2 {
                if let Ok(pid) = parts[0].parse::<u32>() {
                    let name = parts[1].to_string();
                    let process_name = name.rsplit('/').next().unwrap_or(&name).to_string();
                    processes.push(crate::models::ProcessInfo {
                        name: name.clone(),
                        pid,
                        process_name,
                    });
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("ps")
            .args(["-e", "-o", "pid=,comm="])
            .output()
            .map_err(|e| format!("获取进程列表失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let parts: Vec<&str> = line.trim().splitn(2, ' ').collect();
            if parts.len() == 2 {
                if let Ok(pid) = parts[0].parse::<u32>() {
                    let name = parts[1].to_string();
                    processes.push(crate::models::ProcessInfo {
                        name: name.clone(),
                        pid,
                        process_name: name,
                    });
                }
            }
        }
    }

    // 按名称排序
    processes.sort_by(|a, b| a.name.cmp(&b.name));
    
    Ok(processes)
}

#[command]
pub async fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", &url])
            .spawn()
            .map_err(|e| format!("打开URL失败: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("打开URL失败: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("打开URL失败: {}", e))?;
    }

    Ok(())
}