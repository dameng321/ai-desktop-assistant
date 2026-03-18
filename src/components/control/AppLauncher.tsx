import { useState, useEffect, useCallback } from 'react';
import { Button, Input, useToast } from '@/components/ui';
import { appService, type AppInfo, type ProcessInfo } from '@/services/api';

type Tab = 'apps' | 'processes';

export function AppLauncher() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('apps');
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const appList = await appService.listApps();
      setApps(appList);
    } catch (err) {
      console.error('加载应用列表失败:', err);
      showToast('加载应用列表失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadProcesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const processList = await appService.listRunningProcesses();
      setProcesses(processList);
    } catch (err) {
      console.error('加载进程列表失败:', err);
      showToast('加载进程列表失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'apps') {
      loadApps();
    } else {
      loadProcesses();
    }
  }, [activeTab, loadApps, loadProcesses]);

  const handleOpenApp = async (app: AppInfo) => {
    try {
      await appService.openApp(app.path);
      showToast(`已启动: ${app.name}`, 'success');
    } catch (err) {
      console.error('启动应用失败:', err);
      showToast('启动应用失败', 'error');
    }
  };

  const handleCloseProcess = async (process: ProcessInfo) => {
    try {
      await appService.closeApp(process.processName);
      showToast(`已关闭: ${process.name}`, 'success');
      loadProcesses();
    } catch (err) {
      console.error('关闭进程失败:', err);
      showToast('关闭进程失败', 'error');
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProcesses = processes.filter(process => 
    process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.processName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">应用管理</h2>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeTab === 'apps' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            已安装应用
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeTab === 'processes' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            运行中进程
          </button>
        </div>

        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'apps' ? '搜索应用...' : '搜索进程...'}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            加载中...
          </div>
        ) : activeTab === 'apps' ? (
          filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="text-4xl mb-2">📱</div>
              <p>{searchQuery ? '未找到匹配的应用' : '暂无应用'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-4">
              {filteredApps.map((app, index) => (
                <button
                  key={`${app.path}-${index}`}
                  onClick={() => handleOpenApp(app)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
                  title={app.path}
                >
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl mb-1">
                    📦
                  </div>
                  <span className="text-xs text-center truncate w-full">{app.name}</span>
                </button>
              ))}
            </div>
          )
        ) : filteredProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="text-4xl mb-2">⚙️</div>
            <p>{searchQuery ? '未找到匹配的进程' : '暂无运行中进程'}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProcesses.map((process, index) => (
              <div
                key={`${process.pid}-${index}`}
                className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{process.name}</p>
                  <p className="text-xs text-muted-foreground">PID: {process.pid}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseProcess(process)}
                >
                  关闭
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {activeTab === 'apps' 
              ? `共 ${filteredApps.length} 个应用` 
              : `共 ${filteredProcesses.length} 个进程`}
          </span>
          <Button variant="outline" size="sm" onClick={activeTab === 'apps' ? loadApps : loadProcesses}>
            刷新
          </Button>
        </div>
      </div>
    </div>
  );
}