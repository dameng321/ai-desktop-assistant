import { useState } from 'react';
import { KnowledgeBaseList, DocumentList } from '@/components/knowledge';
import type { KnowledgeBase } from '@/types';

export function KnowledgePage() {
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);

  const handleSelectKB = (kb: KnowledgeBase) => {
    setSelectedKB(kb);
  };

  const handleBack = () => {
    setSelectedKB(null);
  };

  if (selectedKB) {
    return <DocumentList knowledgeBase={selectedKB} onBack={handleBack} />;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <KnowledgeBaseList onSelect={handleSelectKB} />
      </div>
    </div>
  );
}