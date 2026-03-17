import { useState } from 'react';
import { cn } from '@/lib';
import type { FileItem } from '@/services/api';

interface FileListProps {
  files: FileItem[];
  selectedFile: FileItem | null;
  onSelect: (file: FileItem) => void;
  onOpen: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem, newName: string) => void;
}

export function FileList({
  files,
  selectedFile,
  onSelect,
  onOpen,
  onDelete,
  onRename,
}: FileListProps) {
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (file: FileItem) => {
    if (newName.trim() && newName !== file.name) {
      onRename(file, newName.trim());
    }
    setRenamingFile(null);
    setNewName('');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        此文件夹为空
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-muted/50 backdrop-blur">
          <tr className="text-left text-sm text-muted-foreground">
            <th className="px-4 py-2 font-medium">名称</th>
            <th className="px-4 py-2 font-medium w-24">大小</th>
            <th className="px-4 py-2 font-medium w-32">修改日期</th>
            <th className="px-4 py-2 font-medium w-24">操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.path}
              onClick={() => onSelect(file)}
              onDoubleClick={() => file.is_dir && onOpen(file)}
              className={cn(
                "group cursor-pointer border-b border-border hover:bg-accent/50",
                selectedFile?.path === file.path && "bg-accent"
              )}
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {file.is_dir ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  
                  {renamingFile?.path === file.path ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onBlur={() => handleRename(file)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(file);
                        if (e.key === 'Escape') {
                          setRenamingFile(null);
                          setNewName('');
                        }
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="px-1 py-0.5 border rounded text-sm"
                    />
                  ) : (
                    <span className="truncate">{file.name}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-sm text-muted-foreground">
                {file.is_dir ? '-' : formatSize(file.size)}
              </td>
              <td className="px-4 py-2 text-sm text-muted-foreground">
                {formatDate(file.modified)}
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  {!file.is_dir && file.name !== '..' && (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setRenamingFile(file);
                          setNewName(file.name);
                        }}
                        className="p-1 rounded hover:bg-background/50"
                        title="重命名"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm('确定删除此文件？')) {
                            onDelete(file);
                          }
                        }}
                        className="p-1 rounded hover:bg-background/50 text-destructive"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}