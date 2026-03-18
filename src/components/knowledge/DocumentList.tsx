import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { useKnowledge } from '@/hooks';
import { useSettingsStore } from '@/stores';
import { knowledgeService } from '@/services/api/knowledge';
import { UploadZone } from './UploadZone';
import type { Document, KnowledgeBase } from '@/types';

interface DocumentListProps {
  knowledgeBase: KnowledgeBase;
  onBack?: () => void;
}

export function DocumentList({ knowledgeBase, onBack }: DocumentListProps) {
  const { getFileIcon, formatFileSize } = useKnowledge();
  const { settings } = useSettingsStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeProvider = settings.model?.providers.find(
    p => p.id === settings.model?.activeProviderId
  );

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await knowledgeService.listDocuments(knowledgeBase.id);
      setDocuments(docs);
    } catch (err) {
      console.error('加载文档失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [knowledgeBase.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = useCallback(async (filePaths: string[]) => {
    if (filePaths.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress('');
    
    try {
      for (const filePath of filePaths) {
        try {
          const filename = filePath.split(/[/\\]/).pop() || 'unknown';
          setUploadProgress(`正在添加: ${filename}`);
          
          const doc = await knowledgeService.addDocument(knowledgeBase.id, filePath);
          setDocuments(prev => [doc, ...prev]);
          
          setUploadProgress(`正在解析: ${filename}`);
          
          try {
            await knowledgeService.processDocument(doc.id, filePath);
            setDocuments(prev => prev.map(d => 
              d.id === doc.id ? { ...d, status: 'ready' } : d
            ));
          } catch (parseErr) {
            setDocuments(prev => prev.map(d => 
              d.id === doc.id ? { 
                ...d, 
                status: 'error', 
                error: parseErr instanceof Error ? parseErr.message : '解析失败' 
              } : d
            ));
          }
        } catch (err) {
          console.error('处理文件失败:', err);
        }
      }
      
      setUploadProgress('');
    } catch (err) {
      console.error('上传失败:', err);
    } finally {
      setIsUploading(false);
    }
  }, [knowledgeBase.id]);

  const handleDelete = async (docId: string) => {
    try {
      await knowledgeService.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('删除文档失败:', err);
    }
    setDeleteConfirmId(null);
  };

  const handleGenerateEmbeddings = async () => {
    if (!activeProvider?.apiKey || !activeProvider?.baseUrl) {
      alert('请先在设置中配置 API Key');
      return;
    }
    
    setIsGeneratingEmbeddings(true);
    setUploadProgress('正在生成向量...');
    
    try {
      const count = await knowledgeService.generateEmbeddings(
        knowledgeBase.id,
        activeProvider.baseUrl,
        activeProvider.apiKey,
        settings.model?.embeddingModel || 'text-embedding-3-small'
      );
      setUploadProgress(`已生成 ${count} 个向量`);
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err) {
      console.error('生成向量失败:', err);
      setUploadProgress('生成向量失败');
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">待处理</span>;
      case 'processing':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">处理中</span>;
      case 'ready':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">就绪</span>;
      case 'error':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">错误</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              className="p-1 hover:bg-muted rounded"
              onClick={onBack}
              title="返回"
            >
              ←
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold">{knowledgeBase.name}</h2>
            {knowledgeBase.description && (
              <p className="text-sm text-muted-foreground">{knowledgeBase.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateEmbeddings} 
            disabled={isGeneratingEmbeddings || documents.filter(d => d.status === 'ready').length === 0}
          >
            {isGeneratingEmbeddings ? '生成中...' : '生成向量'}
          </Button>
        </div>
      </div>

      {uploadProgress && (
        <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-b border-border">
          {uploadProgress}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            加载中...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-4">
            <UploadZone onUpload={handleUpload} disabled={isUploading} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getFileIcon(doc.fileType || '')}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.filename}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize || 0)}</span>
                        <span>{(doc.fileType || 'unknown').toUpperCase()}</span>
                        <span>{new Date((doc.createdAt || 0) * 1000).toLocaleDateString()}</span>
                      </div>
                      {doc.error && (
                        <p className="text-sm text-destructive mt-1">{doc.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusBadge(doc.status)}
                    <button
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {documents.length} 个文档</span>
          <span>就绪: {documents.filter(d => d.status === 'ready').length}</span>
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-muted-foreground mb-4">
              确定要删除此文档吗？此操作不可撤销。
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}