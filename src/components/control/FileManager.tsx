import { useState } from 'react';
import { useFileManager } from '@/hooks';
import { Breadcrumb } from './Breadcrumb';
import { FileList } from './FileList';
import { Button, Input } from '@/components/ui';
import { systemService } from '@/services/api';

export function FileManager() {
  const {
    currentPath,
    files,
    selectedFile,
    isLoading,
    error,
    searchQuery,
    listFiles,
    enterFolder,
    goUp,
    createFolder,
    deleteFile,
    renameFile,
    setSearchQuery,
    setSelectedFile,
    clearError,
    clearSearch,
  } = useFileManager();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const success = await createFolder(newFolderName);
    if (success) {
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleOpenPath = async () => {
    try {
      await systemService.openPath(currentPath);
    } catch (err) {
      console.error('打开路径失败:', err);
    }
  };

  // 快捷路径
  const quickPaths = [
    { name: '桌面', path: '' },
    { name: '文档', path: '' },
    { name: '下载', path: '' },
    { name: '图片', path: '' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={goUp}
          disabled={!currentPath || isLoading}
        >
          上级
        </Button>

        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索文件..."
            className="h-8"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewFolder(true)}
          disabled={!currentPath || isLoading}
        >
          新建文件夹
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenPath}
          disabled={!currentPath}
        >
          在资源管理器中打开
        </Button>
      </div>

      {/* 新建文件夹对话框 */}
      {showNewFolder && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <Input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            placeholder="文件夹名称"
            className="h-8 w-48"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setShowNewFolder(false);
                setNewFolderName('');
              }
            }}
          />
          <Button size="sm" onClick={handleCreateFolder}>创建</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName('');
            }}
          >
            取消
          </Button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center justify-between px-3 py-2 bg-destructive/10 text-destructive text-sm">
          <span>{error}</span>
          <button onClick={clearError} className="hover:opacity-80">✕</button>
        </div>
      )}

      {/* 快捷路径 */}
      {!currentPath && (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">快捷访问</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickPaths.map(p => (
              <button
                key={p.name}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent text-left"
              >
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">输入路径浏览</h3>
            <div className="flex gap-2">
              <Input
                placeholder="例如: C:\Users 或 /home/user"
                className="flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    listFiles((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button onClick={() => {
                const input = document.querySelector('input[placeholder*="C:"]') as HTMLInputElement;
                if (input?.value) {
                  listFiles(input.value);
                }
              }}>
                浏览
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 面包屑 */}
      {currentPath && (
        <Breadcrumb
          path={currentPath}
          onNavigate={listFiles}
        />
      )}

      {/* 文件列表 */}
      {currentPath && (
        <FileList
          files={files}
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
          onOpen={enterFolder}
          onDelete={deleteFile}
          onRename={renameFile}
        />
      )}

      {/* 状态栏 */}
      {currentPath && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border text-sm text-muted-foreground">
          <span>{files.length} 个项目</span>
          {isLoading && <span>加载中...</span>}
        </div>
      )}
    </div>
  );
}