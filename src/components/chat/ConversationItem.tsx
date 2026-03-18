import { useState, useRef, useEffect } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { cn } from '@/lib';
import { exportToMarkdown, exportToText, getExportFileName } from '@/lib/export';
import { ConfirmDialog } from '@/components/ui';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleBlur = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const handleExport = async (format: 'md' | 'txt') => {
    setShowExportMenu(false);
    
    const content = format === 'md' 
      ? exportToMarkdown(conversation) 
      : exportToText(conversation);
    const defaultName = getExportFileName(conversation, format);
    
    try {
      const filePath = await save({
        defaultPath: defaultName,
        filters: [{
          name: format === 'md' ? 'Markdown' : '文本文件',
          extensions: [format],
        }],
      });
      
      if (filePath) {
        await writeTextFile(filePath, content);
      }
    } catch {
      // 如果 Tauri 不可用，使用浏览器下载
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      )}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          className="flex-1 px-1 py-0.5 text-sm bg-background border rounded"
        />
      ) : (
        <span className="flex-1 text-sm truncate">{conversation.title}</span>
      )}

      {/* 操作按钮 */}
      {!isEditing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 导出按钮 */}
          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              className={cn(
                "p-1 rounded hover:bg-background/20",
                isActive && "hover:bg-primary-foreground/20"
              )}
              title="导出"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {showExportMenu && (
              <div 
                className="absolute left-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-24"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => handleExport('md')}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent rounded-t-md"
                >
                  导出为 Markdown
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent rounded-b-md"
                >
                  导出为文本
                </button>
              </div>
            )}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsEditing(true);
              setEditTitle(conversation.title);
            }}
            className={cn(
              "p-1 rounded hover:bg-background/20",
              isActive && "hover:bg-primary-foreground/20"
            )}
            title="重命名"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className={cn(
              "p-1 rounded hover:bg-background/20",
              isActive && "hover:bg-primary-foreground/20"
            )}
            title="删除"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除对话"
        message="确定删除此对话？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}