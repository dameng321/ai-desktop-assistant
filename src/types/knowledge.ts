export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  documents: Document[];
  stats: KnowledgeBaseStats;
}

export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  createdAt: number;
  error?: string;
}

export interface KnowledgeBaseStats {
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}

export interface RetrievedChunk {
  content: string;
  score: number;
  metadata: {
    documentId: string;
    filename: string;
    page?: number;
  };
}