'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiGet } from '@/lib/api';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ChevronLeft, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    receiverId: string;
  };
  unread: number;
}

interface ExtendedMessage extends Message {
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

export function MessagesPage({ partnerId }: { partnerId?: string }) {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(partnerId || null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    if (activeConversation && currentUser) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiGet<Conversation[]>('/api/messages');
      setConversations(data);
      if (!activeConversation && data.length > 0 && !partnerId) {
        setActiveConversation(data[0].partnerId);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [activeConversation, partnerId]);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const data = await apiGet<ExtendedMessage[]>(`/api/messages?partnerId=${id}`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeConversation) return;
    try {
      await api.messages.send({
        content: newMessage,
        receiverId: activeConversation,
      });
      setNewMessage('');
      fetchMessages(activeConversation);
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activePartner = conversations.find((c) => c.partnerId === activeConversation);

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('messages.noMessages', lang)}</h3>
        <p className="text-muted-foreground text-sm text-center mb-4">{t('messages.noMessages.desc', lang)}</p>
        <Button onClick={() => router.push('/login')}>{t('nav.login', lang)}</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Conversation list */}
      <div className={cn('w-full md:w-80 border-r flex-shrink-0', activeConversation ? 'hidden md:block' : 'block')}>
        <div className="p-4 border-b">
          <h2 className="font-semibold">{t('messages.title', lang)}</h2>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-7rem)]">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('messages.noMessages.desc', lang)}</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partnerId ?? conv.partnerName + conv.lastMessage.createdAt}
                className={cn(
                  'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b text-left',
                  activeConversation === conv.partnerId ? 'bg-emerald-50' : ''
                )}
                onClick={() => setActiveConversation(conv.partnerId)}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-emerald-700">
                    {conv.partnerName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{conv.partnerName}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.senderId === currentUser.id ? `${t('messages.you', lang)}: ` : ''}
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-emerald-700 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={cn('flex-1 flex flex-col', !activeConversation ? 'hidden md:flex' : 'flex')}>
        {activeConversation && activePartner ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setActiveConversation(null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar name={activePartner.partnerName} />
              <div>
                <p className="font-medium text-sm">{activePartner.partnerName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-12rem)]">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id ?? `${msg.senderId}-${msg.createdAt}`} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] px-3 py-2 rounded-xl text-sm',
                        isMine
                          ? 'bg-emerald-700 text-white rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className={cn('text-[10px] mt-1', isMine ? 'text-emerald-200' : 'text-muted-foreground')}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('messages.placeholder', lang)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t('messages.select', lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn('w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center', className)}>
      <span className="text-xs font-medium text-emerald-700">{name.charAt(0)}</span>
    </div>
  );
}
