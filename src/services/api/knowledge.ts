import { invoke } from '@tauri-apps/api/core';
import type { KnowledgeBase, Document, RetrievedChunk } from '@/types';

export const knowledgeService = {
  async createKnowledgeBase(name: string, description?: string): Promise<KnowledgeBase> {
    return invoke<KnowledgeBase>('create_knowledge_base', { name, description });
  },

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return invoke<KnowledgeBase[]>('list_knowledge_bases');
  },

  async deleteKnowledgeBase(id: string): Promise<void> {
    return invoke('delete_knowledge_base', { id });
  },

  async addDocument(kbId: string, filePath: string): Promise<Document> {
    return invoke<Document>('add_document', { kbId, filePath });
  },

  async listDocuments(kbId: string): Promise<Document[]> {
    return invoke<Document[]>('list_documents', { kbId });
  },

  async processDocument(docId: string, filePath: string): Promise<void> {
    return invoke('process_document', { docId, filePath });
  },

  async deleteDocument(docId: string): Promise<void> {
    return invoke('delete_document', { docId });
  },

  async searchKnowledge(kbId: string, query: string, limit?: number): Promise<RetrievedChunk[]> {
    return invoke<RetrievedChunk[]>('search_knowledge', { kbId, query, limit });
  },

  async generateEmbeddings(
    kbId: string, 
    baseUrl: string, 
    apiKey: string, 
    model: string
  ): Promise<number> {
    return invoke<number>('generate_embeddings', { kbId, baseUrl, apiKey, model });
  },

  async searchSemantic(
    kbId: string,
    query: string,
    baseUrl: string,
    apiKey: string,
    model: string,
    limit?: number
  ): Promise<RetrievedChunk[]> {
    return invoke<RetrievedChunk[]>('search_semantic', { 
      kbId, query, baseUrl, apiKey, model, limit 
    });
  },
};