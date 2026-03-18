mod commands;
mod models;
mod services;

use commands::*;
use services::KnowledgeDatabase;
use std::sync::Arc;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent, State,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 初始化知识库数据库
            let db = KnowledgeDatabase::new(app.handle())
                .expect("Failed to initialize knowledge database");
            app.manage(Arc::new(db));

            // 注册全局快捷键 (Ctrl+Shift+A)
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyA);
            
            let global_shortcut = app.global_shortcut();
            let app_handle = app.handle().clone();
            match global_shortcut.on_shortcut(shortcut, move |_app, _shortcut, _event| {
                if let Some(window) = app_handle.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }) {
                Ok(_) => log::info!("全局快捷键 Ctrl+Shift+A 注册成功"),
                Err(e) => log::warn!("全局快捷键注册失败: {}，可能已被其他程序占用", e),
            }

            // 创建托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

            // 创建系统托盘
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // 监听窗口关闭事件，最小化到托盘
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        // 阻止关闭，改为隐藏窗口
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
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
            get_user_paths,
            open_path,
            test_api_connection,
            chat_stream,
            chat_cancel,
            fetch_models,
            // 应用操作
            list_apps,
            open_app,
            close_app,
            list_running_processes,
            open_url,
            // 知识库操作
            create_knowledge_base,
            list_knowledge_bases,
            delete_knowledge_base,
            add_document,
            list_documents,
            process_document,
            delete_document,
            search_knowledge,
            generate_embeddings,
            search_semantic,
        ])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}