import { cn } from '@/lib';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  
  if (!path) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
        <span>请选择一个路径开始浏览</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
      
      {parts.map((part, index) => {
        const partPath = '/' + parts.slice(0, index + 1).join('/');
        return (
          <div key={partPath} className="flex items-center">
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => onNavigate(partPath)}
              className="px-2 py-1 rounded hover:bg-accent text-sm truncate max-w-[150px]"
              title={part}
            >
              {part}
            </button>
          </div>
        );
      })}
    </div>
  );
}