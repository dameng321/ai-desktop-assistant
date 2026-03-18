import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { useKnowledge } from '@/hooks';
import { knowledgeService } from '@/services/api/knowledge';
import type { KnowledgeBase } from '@/types';

interface KnowledgeBaseListProps {
  onSelect?: (kb: KnowledgeBase) => void;
}

export function KnowledgeBaseList({ onSelect }: KnowledgeBaseListProps) {
  const {
    activeKnowledgeBaseId,
    setActiveKnowledgeBase,
  } = useKnowledge();

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadKnowledgeBases = async () => {
    setIsLoading(true);
    try {
      const kbs = await knowledgeService.listKnowledgeBases();
      setKnowledgeBases(kbs);
    } catch (err) {
      console.error('加载知识库失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    
    try {
      const kb = await knowledgeService.createKnowledgeBase(newName, newDescription || undefined);
      setKnowledgeBases(prev => [kb, ...prev]);
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
    } catch (err) {
      console.error('创建知识库失败:', err);
    }
  };

  const handleSelect = (kb: KnowledgeBase) => {
    setActiveKnowledgeBase(kb.id);
    onSelect?.(kb);
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeService.deleteKnowledgeBase(id);
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
    } catch (err) {
      console.error('删除知识库失败:', err);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">知识库</h2>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          disabled={showCreate}
        >
          新建
        </Button>
      </div>

      {showCreate && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="知识库名称"
              className="w-full"
            />
            <Input
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="描述（可选）"
              className="w-full"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                创建
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setNewName('');
                  setNewDescription('');
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            加载中...
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="text-4xl mb-2">📚</div>
            <p>暂无知识库</p>
            <p className="text-sm mt-1">点击"新建"创建知识库</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {knowledgeBases.map(kb => (
              <div
                key={kb.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  activeKnowledgeBaseId === kb.id ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleSelect(kb)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{kb.name}</h3>
                    {kb.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {kb.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteConfirmId(kb.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>📄 {kb.documentCount} 文档</span>
                  <span>📝 {kb.chunkCount} 片段</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-muted-foreground mb-4">
              确定要删除此知识库吗？此操作不可撤销，所有文档将被删除。
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