import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { KnowledgeBase, Document } from '@/types';
import { generateId } from '@/lib';

interface KnowledgeState {
  knowledgeBases: KnowledgeBase[];
  activeKnowledgeBaseId: string | null;
  
  createKnowledgeBase: (name: string, description?: string) => string;
  updateKnowledgeBase: (id: string, updates: Partial<Pick<KnowledgeBase, 'name' | 'description'>>) => void;
  deleteKnowledgeBase: (id: string) => void;
  setActiveKnowledgeBase: (id: string | null) => void;
  
  addDocument: (kbId: string, document: Document) => void;
  updateDocument: (kbId: string, docId: string, updates: Partial<Document>) => void;
  deleteDocument: (kbId: string, docId: string) => void;
  
  clearAll: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set) => ({
      knowledgeBases: [],
      activeKnowledgeBaseId: null,
      
      createKnowledgeBase: (name, description) => {
        const id = generateId();
        const now = Date.now();
        
        const kb: KnowledgeBase = {
          id,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          documents: [],
          stats: {
            documentCount: 0,
            chunkCount: 0,
            totalSize: 0,
          },
        };
        
        set(state => ({
          knowledgeBases: [...state.knowledgeBases, kb],
          activeKnowledgeBaseId: id,
        }));
        
        return id;
      },
      
      updateKnowledgeBase: (id, updates) => {
        set(state => ({
          knowledgeBases: state.knowledgeBases.map(kb =>
            kb.id === id
              ? { ...kb, ...updates, updatedAt: Date.now() }
              : kb
          ),
        }));
      },
      
      deleteKnowledgeBase: (id) => {
        set(state => {
          const knowledgeBases = state.knowledgeBases.filter(kb => kb.id !== id);
          const activeKnowledgeBaseId = state.activeKnowledgeBaseId === id
            ? knowledgeBases[0]?.id || null
            : state.activeKnowledgeBaseId;
          
          return { knowledgeBases, activeKnowledgeBaseId };
        });
      },
      
      setActiveKnowledgeBase: (id) => {
        set({ activeKnowledgeBaseId: id });
      },
      
      addDocument: (kbId, document) => {
        set(state => ({
          knowledgeBases: state.knowledgeBases.map(kb => {
            if (kb.id !== kbId) return kb;
            
            const documents = [...kb.documents, document];
            const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
            
            return {
              ...kb,
              documents,
              updatedAt: Date.now(),
              stats: {
                documentCount: documents.length,
                chunkCount: kb.stats.chunkCount,
                totalSize,
              },
            };
          }),
        }));
      },
      
      updateDocument: (kbId, docId, updates) => {
        set(state => ({
          knowledgeBases: state.knowledgeBases.map(kb => {
            if (kb.id !== kbId) return kb;
            
            return {
              ...kb,
              documents: kb.documents.map(doc =>
                doc.id === docId ? { ...doc, ...updates } : doc
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
      
      deleteDocument: (kbId, docId) => {
        set(state => ({
          knowledgeBases: state.knowledgeBases.map(kb => {
            if (kb.id !== kbId) return kb;
            
            const documents = kb.documents.filter(doc => doc.id !== docId);
            const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
            
            return {
              ...kb,
              documents,
              updatedAt: Date.now(),
              stats: {
                documentCount: documents.length,
                chunkCount: kb.stats.chunkCount,
                totalSize,
              },
            };
          }),
        }));
      },
      
      clearAll: () => {
        set({
          knowledgeBases: [],
          activeKnowledgeBaseId: null,
        });
      },
    }),
    {
      name: 'knowledge-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        knowledgeBases: state.knowledgeBases,
        activeKnowledgeBaseId: state.activeKnowledgeBaseId,
      }),
    }
  )
);