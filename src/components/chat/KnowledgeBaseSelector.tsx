import { useState, useEffect } from 'react';
import { useKnowledgeStore } from '@/stores';
import { knowledgeService } from '@/services/api/knowledge';
import type { KnowledgeBase } from '@/types';

export function KnowledgeBaseSelector() {
  const { activeKnowledgeBaseId, setActiveKnowledgeBase } = useKnowledgeStore();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadKnowledgeBases = async () => {
      try {
        const kbs = await knowledgeService.listKnowledgeBases();
        setKnowledgeBases(kbs.filter(kb => kb.chunkCount > 0));
      } catch (err) {
        console.error('加载知识库列表失败:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKnowledgeBases();
  }, []);

  if (isLoading || knowledgeBases.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">知识库:</span>
        <select
          value={activeKnowledgeBaseId || ''}
          onChange={e => setActiveKnowledgeBase(e.target.value || null)}
          className="text-xs bg-background border border-border rounded px-2 py-1"
        >
          <option value="">不使用知识库</option>
          {knowledgeBases.map(kb => (
            <option key={kb.id} value={kb.id}>
              {kb.name} ({kb.chunkCount} 片段)
            </option>
          ))}
        </select>
        {activeKnowledgeBaseId && (
          <span className="text-xs text-muted-foreground">
            AI 将参考知识库内容回答
          </span>
        )}
      </div>
    </div>
  );
}