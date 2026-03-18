import { useState, useCallback } from 'react';
import { useKnowledgeStore } from '@/stores';
import type { KnowledgeBase, Document } from '@/types';
import { generateId } from '@/lib';

export function useKnowledge() {
  const {
    knowledgeBases,
    activeKnowledgeBaseId,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    setActiveKnowledgeBase,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useKnowledgeStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKnowledgeBase = knowledgeBases.find(kb => kb.id === activeKnowledgeBaseId);

  const createKB = useCallback((name: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    if (!name.trim()) {
      setError('知识库名称不能为空');
      return null;
    }
    
    const exists = knowledgeBases.some(kb => kb.name === name.trim());
    if (exists) {
      setError('知识库名称已存在');
      return null;
    }
    
    const id = createKnowledgeBase(name.trim(), description?.trim());
    return id;
  }, [knowledgeBases, createKnowledgeBase]);

  const updateKB = useCallback((id: string, updates: Partial<Pick<KnowledgeBase, 'name' | 'description'>>) => {
    setError(null);
    
    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        setError('知识库名称不能为空');
        return false;
      }
      
      const exists = knowledgeBases.some(kb => kb.id !== id && kb.name === updates.name!.trim());
      if (exists) {
        setError('知识库名称已存在');
        return false;
      }
    }
    
    updateKnowledgeBase(id, updates);
    return true;
  }, [knowledgeBases, updateKnowledgeBase]);

  const deleteKB = useCallback((id: string) => {
    setError(null);
    deleteKnowledgeBase(id);
  }, [deleteKnowledgeBase]);

  const addDoc = useCallback((kbId: string, file: { name: string; size: number; type: string }) => {
    setError(null);
    
    const doc: Document = {
      id: generateId(),
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    addDocument(kbId, doc);
    return doc;
  }, [addDocument]);

  const updateDoc = useCallback((kbId: string, docId: string, updates: Partial<Document>) => {
    updateDocument(kbId, docId, updates);
  }, [updateDocument]);

  const deleteDoc = useCallback((kbId: string, docId: string) => {
    deleteDocument(kbId, docId);
  }, [deleteDocument]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    const type = (fileType || '').toLowerCase();
    if (type === 'pdf') return '📄';
    if (type === 'docx' || type === 'doc') return '📝';
    if (type === 'txt' || type === 'md') return '📃';
    if (type === 'xlsx' || type === 'xls') return '📊';
    if (type === 'pptx' || type === 'ppt') return '📽️';
    return '📁';
  };

  return {
    knowledgeBases,
    activeKnowledgeBase,
    activeKnowledgeBaseId,
    isLoading,
    error,
    
    createKnowledgeBase: createKB,
    updateKnowledgeBase: updateKB,
    deleteKnowledgeBase: deleteKB,
    setActiveKnowledgeBase,
    
    addDocument: addDoc,
    updateDocument: updateDoc,
    deleteDocument: deleteDoc,
    
    clearError,
    formatFileSize,
    getFileIcon,
  };
}