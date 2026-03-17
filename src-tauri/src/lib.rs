mod commands;
mod models;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 文件操作
            list_files,
            create_folder,
            delete_file,
            move_file,
            copy_file,
            rename_file,
            search_files,
            // 系统操作
            get_system_info,
            open_path,
            // 应用操作
            list_apps,
            open_app,
            open_url,
        ])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}