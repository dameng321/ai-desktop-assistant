import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputBar } from '@/components/chat/InputBar';

describe('InputBar', () => {
  const mockOnSend = vi.fn();
  const mockOnStop = vi.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
    mockOnStop.mockClear();
  });

  it('应该渲染输入框和发送按钮', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
    expect(screen.getByText('发送')).toBeInTheDocument();
  });

  it('输入内容后点击发送应该调用 onSend', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '测试消息' } });
    
    const sendButton = screen.getByText('发送');
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('测试消息');
  });

  it('按 Enter 键应该发送消息', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '测试消息' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSend).toHaveBeenCalledWith('测试消息');
  });

  it('Shift + Enter 不应该发送消息', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '测试消息' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('发送后应该清空输入框', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('输入消息...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '测试消息' } });
    fireEvent.click(screen.getByText('发送'));
    
    expect(input.value).toBe('');
  });

  it('加载中应显示停止按钮', () => {
    render(<InputBar onSend={mockOnSend} onStop={mockOnStop} isLoading />);
    
    expect(screen.getByText('停止')).toBeInTheDocument();
    expect(screen.queryByText('发送')).not.toBeInTheDocument();
  });

  it('点击停止按钮应该调用 onStop', () => {
    render(<InputBar onSend={mockOnSend} onStop={mockOnStop} isLoading />);
    
    fireEvent.click(screen.getByText('停止'));
    
    expect(mockOnStop).toHaveBeenCalled();
  });

  it('空消息不应发送', () => {
    render(<InputBar onSend={mockOnSend} />);
    
    const sendButton = screen.getByText('发送');
    fireEvent.click(sendButton);
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('禁用状态下不应允许输入', () => {
    render(<InputBar onSend={mockOnSend} disabled />);
    
    const input = screen.getByPlaceholderText('输入消息...');
    expect(input).toBeDisabled();
  });
});