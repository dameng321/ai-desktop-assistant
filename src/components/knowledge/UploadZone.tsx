import { useState, useCallback, useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '@/components/ui';

interface UploadZoneProps {
  onUpload: (files: string[]) => Promise<void>;
  accept?: string[];
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function UploadZone({
  onUpload,
  accept = ['pdf', 'docx', 'doc', 'txt', 'md'],
  multiple = true,
  disabled = false,
  className = '',
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const items = Array.from(e.dataTransfer.items);
    const filePaths: string[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry?.();
        if (entry?.isFile) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (accept.includes(ext)) {
              const path = (file as File & { path?: string }).path;
              if (path) {
                filePaths.push(path);
              }
            }
          }
        }
      }
    }

    if (filePaths.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(filePaths);
      } finally {
        setIsUploading(false);
      }
    }
  }, [disabled, accept, onUpload]);

  const handleButtonClick = useCallback(async () => {
    if (disabled || isUploading) return;

    setIsUploading(true);
    try {
      const selected = await open({
        multiple,
        filters: [
          {
            name: 'Documents',
            extensions: accept,
          },
        ],
      });

      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        await onUpload(files);
      }
    } finally {
      setIsUploading(false);
    }
  }, [disabled, isUploading, multiple, accept, onUpload]);

  const acceptText = accept.map(ext => ext.toUpperCase()).join(', ');

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onClick={handleButtonClick}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">
            {isUploading ? '⏳' : isDragging ? '📥' : '📤'}
          </div>
          <div>
            <p className="font-medium">
              {isUploading ? '处理中...' : isDragging ? '释放以上传' : '拖拽文件到此处'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              支持 {acceptText} 格式
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">或</span>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              选择文件
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}