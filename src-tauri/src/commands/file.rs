use crate::models::FileItem;
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[command]
pub async fn list_files(path: String) -> Result<Vec<FileItem>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("无法读取目录: {}", e))?;

    let mut files = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取条目失败: {}", e))?;
        let path = entry.path();
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("读取元数据失败: {}", e))?;

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        files.push(FileItem {
            name: entry.file_name().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified,
        });
    }

    Ok(files)
}

#[command]
pub async fn create_folder(path: String, name: String) -> Result<String, String> {
    let full_path = PathBuf::from(&path).join(&name);

    fs::create_dir(&full_path)
        .map_err(|e| format!("创建文件夹失败: {}", e))?;

    Ok(full_path.to_string_lossy().to_string())
}

#[command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let path = PathBuf::from(&path);

    if path.is_dir() {
        fs::remove_dir_all(&path)
            .map_err(|e| format!("删除文件夹失败: {}", e))?;
    } else {
        fs::remove_file(&path)
            .map_err(|e| format!("删除文件失败: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn move_file(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to)
        .map_err(|e| format!("移动文件失败: {}", e))
}

#[command]
pub async fn copy_file(from: String, to: String) -> Result<(), String> {
    fs::copy(&from, &to)
        .map_err(|e| format!("复制文件失败: {}", e))?;
    Ok(())
}

#[command]
pub async fn rename_file(path: String, new_name: String) -> Result<(), String> {
    let old_path = PathBuf::from(&path);
    let new_path = old_path.parent()
        .ok_or("无效路径")?
        .join(&new_name);

    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("重命名失败: {}", e))
}

#[command]
pub async fn search_files(query: String, path: String, recursive: bool) -> Result<Vec<FileItem>, String> {
    let mut results = Vec::new();
    let path = PathBuf::from(&path);

    fn search_dir(dir: &PathBuf, query: &str, results: &mut Vec<FileItem>, recursive: bool) -> Result<(), String> {
        let entries = fs::read_dir(dir)
            .map_err(|e| format!("读取目录失败: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if name.to_lowercase().contains(&query.to_lowercase()) {
                if let Ok(metadata) = fs::metadata(&path) {
                    let modified = metadata
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);

                    results.push(FileItem {
                        name,
                        path: path.to_string_lossy().to_string(),
                        is_dir: metadata.is_dir(),
                        size: metadata.len(),
                        modified,
                    });
                }
            }

            if recursive && path.is_dir() {
                search_dir(&path, query, results, recursive)?;
            }
        }

        Ok(())
    }

    search_dir(&path, &query, &mut results, recursive)?;

    Ok(results)
}