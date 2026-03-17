import { useState, useCallback } from 'react';
import { fileService, type FileItem } from '@/services/api';

interface UseFileManagerOptions {
  initialPath?: string;
}

export function useFileManager(options?: UseFileManagerOptions) {
  const [currentPath, setCurrentPath] = useState(options?.initialPath || '');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);

  // 列出文件
  const listFiles = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await fileService.listFiles(path);
      // 排序：文件夹优先，然后按名称排序
      items.sort((a, b) => {
        if (a.is_dir !== b.is_dir) {
          return a.is_dir ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      setFiles(items);
      setCurrentPath(path);
      setSelectedFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法读取目录';
      setError(message);
      // 如果 Tauri 不可用，使用模拟数据
      if (message.includes('not registered')) {
        setFiles(getMockFiles(path));
        setCurrentPath(path);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 进入文件夹
  const enterFolder = useCallback(async (folder: FileItem) => {
    if (!folder.is_dir) return;
    await listFiles(folder.path);
  }, [listFiles]);

  // 返回上级
  const goUp = useCallback(async () => {
    if (!currentPath) return;
    const parts = currentPath.replace(/\\/g, '/').split('/');
    parts.pop();
    const parentPath = parts.join('/') || '/';
    await listFiles(parentPath);
  }, [currentPath, listFiles]);

  // 创建文件夹
  const createFolder = useCallback(async (name: string) => {
    if (!currentPath || !name.trim()) return;
    
    try {
      await fileService.createFolder(currentPath, name.trim());
      await listFiles(currentPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建文件夹失败');
      return false;
    }
  }, [currentPath, listFiles]);

  // 删除文件
  const deleteFile = useCallback(async (file: FileItem) => {
    try {
      await fileService.deleteFile(file.path);
      await listFiles(currentPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      return false;
    }
  }, [currentPath, listFiles]);

  // 重命名
  const renameFile = useCallback(async (file: FileItem, newName: string) => {
    try {
      await fileService.renameFile(file.path, newName);
      await listFiles(currentPath);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名失败');
      return false;
    }
  }, [currentPath, listFiles]);

  // 搜索文件
  const searchFiles = useCallback(async (query: string) => {
    if (!query.trim() || !currentPath) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await fileService.searchFiles(query, currentPath, true);
      setSearchResults(results);
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    // 状态
    currentPath,
    files: searchQuery ? searchResults : files,
    selectedFile,
    isLoading,
    error,
    searchQuery,
    isSearching: !!searchQuery,
    
    // 操作
    listFiles,
    enterFolder,
    goUp,
    createFolder,
    deleteFile,
    renameFile,
    searchFiles,
    setSearchQuery,
    setSelectedFile,
    clearError,
    clearSearch,
  };
}

// 模拟数据（用于浏览器开发环境）
function getMockFiles(path: string): FileItem[] {
  return [
    { name: '..', path: path + '/..', is_dir: true, size: 0, modified: Date.now() },
    { name: 'Documents', path: path + '/Documents', is_dir: true, size: 0, modified: Date.now() },
    { name: 'Downloads', path: path + '/Downloads', is_dir: true, size: 0, modified: Date.now() },
    { name: 'Pictures', path: path + '/Pictures', is_dir: true, size: 0, modified: Date.now() },
    { name: 'readme.txt', path: path + '/readme.txt', is_dir: false, size: 1024, modified: Date.now() },
    { name: 'config.json', path: path + '/config.json', is_dir: false, size: 512, modified: Date.now() },
  ];
}