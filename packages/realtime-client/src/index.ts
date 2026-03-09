import type { MessageItem } from '@telegram-lite/types';

export interface RealtimeEventMap {
  new_message: { chatId: string; message: MessageItem };
  message_delivered: { chatId: string; messageId: string; userId: string };
  message_read: { chatId: string; messageId: string; userId: string };
  user_typing: { chatId: string; userId: string; isTyping: boolean };
  user_online: { userId: string };
  user_offline: { userId: string };
  chat_updated: { chatId: string };
}

type RealtimeHandler<T> = (payload: T) => void;

export class RealtimeClient {
  private readonly handlers: Record<string, Array<(payload: unknown) => void>> = {};

  on<K extends keyof RealtimeEventMap>(event: K, handler: RealtimeHandler<RealtimeEventMap[K]>): void {
    const key = String(event);
    const existing = this.handlers[key] ?? [];
    this.handlers[key] = [...existing, handler as (payload: unknown) => void];
  }

  emit<K extends keyof RealtimeEventMap>(event: K, payload: RealtimeEventMap[K]): void {
    for (const handler of this.handlers[String(event)] ?? []) {
      handler(payload);
    }
  }
}

