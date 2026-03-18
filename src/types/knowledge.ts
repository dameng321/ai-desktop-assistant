export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  documentCount: number;
  chunkCount: number;
}

export interface Document {
  id: string;
  kbId?: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  filePath?: string;
  status: string;
  createdAt?: number;
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
  documentId: string;
  filename: string;
  chunkIndex: number;
}