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