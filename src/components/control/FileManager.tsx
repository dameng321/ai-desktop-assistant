import { useState, useEffect } from 'react';
import { useFileManager } from '@/hooks';
import { Breadcrumb } from './Breadcrumb';
import { FileList } from './FileList';
import { Button, Input, useToast } from '@/components/ui';
import { systemService, type UserPaths } from '@/services/api';

export function FileManager() {
  const { showToast } = useToast();
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
  } = useFileManager();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [userPaths, setUserPaths] = useState<UserPaths | null>(null);

  useEffect(() => {
    systemService.getUserPaths()
      .then(setUserPaths)
      .catch(err => console.error('获取用户路径失败:', err));
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const success = await createFolder(newFolderName);
    if (success) {
      showToast(`文件夹 "${newFolderName}" 创建成功`, 'success');
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleOpenPath = async () => {
    try {
      await systemService.openPath(currentPath);
      showToast('已在资源管理器中打开', 'success');
    } catch (err) {
      console.error('打开路径失败:', err);
      showToast('打开路径失败', 'error');
    }
  };

  const quickPaths = userPaths ? [
    { name: '桌面', path: userPaths.desktop, icon: '🖥️' },
    { name: '文档', path: userPaths.documents, icon: '📄' },
    { name: '下载', path: userPaths.downloads, icon: '📥' },
    { name: '图片', path: userPaths.pictures, icon: '🖼️' },
  ] : [];

  const handleDeleteFile = async (file: { name: string; is_dir: boolean; path: string }) => {
    const success = await deleteFile(file as any);
    if (success) {
      showToast(`${file.is_dir ? '文件夹' : '文件'} "${file.name}" 已删除`, 'success');
    }
  };

  const handleRenameFile = async (file: { name: string; path: string }, newName: string) => {
    const success = await renameFile(file as any, newName);
    if (success) {
      showToast(`已重命名为 "${newName}"`, 'success');
    }
  };

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
                onClick={() => listFiles(p.path)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent text-left transition-colors"
              >
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <span className="font-medium">{p.name}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-32">{p.path}</p>
                </div>
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
          onDelete={handleDeleteFile}
          onRename={handleRenameFile}
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