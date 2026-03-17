import { invoke } from '@tauri-apps/api/core';

export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: number;
}

export interface AppInfo {
  name: string;
  path: string;
}

export interface SystemInfo {
  os: string;
  version: string;
  hostname: string;
  cpu: string;
  memory: number;
}

// 文件操作
export const fileService = {
  async listFiles(path: string): Promise<FileItem[]> {
    return invoke<FileItem[]>('list_files', { path });
  },

  async createFolder(path: string, name: string): Promise<string> {
    return invoke<string>('create_folder', { path, name });
  },

  async deleteFile(path: string): Promise<void> {
    return invoke('delete_file', { path });
  },

  async moveFile(from: string, to: string): Promise<void> {
    return invoke('move_file', { from, to });
  },

  async copyFile(from: string, to: string): Promise<void> {
    return invoke('copy_file', { from, to });
  },

  async renameFile(path: string, newName: string): Promise<void> {
    return invoke('rename_file', { path, newName });
  },

  async searchFiles(query: string, path: string, recursive: boolean = true): Promise<FileItem[]> {
    return invoke<FileItem[]>('search_files', { query, path, recursive });
  },
};

// 应用操作
export const appService = {
  async listApps(): Promise<AppInfo[]> {
    return invoke<AppInfo[]>('list_apps');
  },

  async openApp(appPath: string): Promise<void> {
    return invoke('open_app', { appPath });
  },

  async openUrl(url: string): Promise<void> {
    return invoke('open_url', { url });
  },
};

// 系统操作
export const systemService = {
  async getSystemInfo(): Promise<SystemInfo> {
    return invoke<SystemInfo>('get_system_info');
  },

  async openPath(path: string): Promise<void> {
    return invoke('open_path', { path });
  },
};