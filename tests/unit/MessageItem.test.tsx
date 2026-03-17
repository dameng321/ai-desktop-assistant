import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageItem } from '@/components/chat/MessageItem';
import type { Message } from '@/types';

describe('MessageItem', () => {
  const mockUserMessage: Message = {
    id: '1',
    role: 'user',
    content: '你好',
    timestamp: Date.now(),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: '你好！有什么可以帮助你的吗？',
    timestamp: Date.now(),
  };

  it('应该正确渲染用户消息', () => {
    render(<MessageItem message={mockUserMessage} />);
    
    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('应该正确渲染助手消息', () => {
    render(<MessageItem message={mockAssistantMessage} />);
    
    expect(screen.getByText('你好！有什么可以帮助你的吗？')).toBeInTheDocument();
  });

  it('流式输出时应显示光标动画', () => {
    const { container } = render(<MessageItem message={mockAssistantMessage} isStreaming />);
    
    // 检查是否有动画光标
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).toBeInTheDocument();
  });

  it('非流式输出时不应显示光标动画', () => {
    const { container } = render(<MessageItem message={mockAssistantMessage} />);
    
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).not.toBeInTheDocument();
  });
});