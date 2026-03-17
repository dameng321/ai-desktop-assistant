import type { Conversation } from '@/types';

export function exportToMarkdown(conversation: Conversation): string {
  const lines: string[] = [];
  
  lines.push(`# ${conversation.title}`);
  lines.push('');
  lines.push(`> 导出时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  for (const message of conversation.messages) {
    if (message.role === 'user') {
      lines.push('### 👤 用户');
      lines.push('');
      lines.push(message.content);
      lines.push('');
    } else if (message.role === 'assistant') {
      lines.push('### 🤖 助手');
      lines.push('');
      lines.push(message.content);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  
  return lines.join('\n');
}

export function exportToText(conversation: Conversation): string {
  const lines: string[] = [];
  
  lines.push(`对话: ${conversation.title}`);
  lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('');
  lines.push('='.repeat(50));
  lines.push('');
  
  for (const message of conversation.messages) {
    const role = message.role === 'user' ? '用户' : '助手';
    lines.push(`【${role}】`);
    lines.push(message.content);
    lines.push('');
    lines.push('-'.repeat(50));
    lines.push('');
  }
  
  return lines.join('\n');
}

export function getExportFileName(conversation: Conversation, format: 'md' | 'txt'): string {
  const safeTitle = conversation.title.replace(/[<>:"/\\|?*]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `${safeTitle}_${date}.${format}`;
}