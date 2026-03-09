import { ApiClient } from '@telegram-lite/api-client';
import { RealtimeClient } from '@telegram-lite/realtime-client';
import type { ChatSummary, MessageItem, SearchUser, UserProfile } from '@telegram-lite/types';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://212.119.42.176:3001/api/v1';

export default function App(): JSX.Element {
  const api = useMemo(() => new ApiClient(API_URL), []);
  const realtime = useMemo(() => new RealtimeClient(), []);

  const [email, setEmail] = useState('demo1@example.com');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState('');
  const [me, setMe] = useState<UserProfile | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');

  async function bootstrap(accessToken: string): Promise<void> {
    const [profile, chatList] = await Promise.all([api.getMe(accessToken), api.listChats(accessToken)]);
    setMe(profile);
    setChats(chatList);
    if (chatList[0]) {
      setSelectedChatId(chatList[0].chatId);
      const history = await api.listMessages(accessToken, chatList[0].chatId);
      setMessages(history.items.reverse());
    }

    realtime.on('new_message', ({ chatId, message }) => {
      if (chatId === selectedChatId) {
        setMessages((prev) => [...prev, message]);
      }
    });
  }

  async function onLogin(): Promise<void> {
    setError('');
    try {
      const response = await api.login({ email, password });
      setToken(response.accessToken);
      await bootstrap(response.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onSearch(): Promise<void> {
    if (!token || !searchQuery.trim()) return;
    try {
      const found = await api.searchUsers(token, searchQuery);
      setSearchResults(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function openChat(chatId: string): Promise<void> {
    if (!token) return;
    setSelectedChatId(chatId);
    const history = await api.listMessages(token, chatId);
    setMessages(history.items.reverse());
  }

  async function sendText(): Promise<void> {
    if (!token || !selectedChatId || !messageText.trim()) return;
    const optimistic: MessageItem = {
      id: `mobile-opt-${Date.now()}`,
      chatId: selectedChatId,
      senderId: me?.id ?? 'me',
      type: 'text',
      text: messageText,
      clientMessageId: `mobile-client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');
    await api.sendMessage(token, {
      chatId: selectedChatId,
      text: optimistic.text ?? '',
      clientMessageId: optimistic.clientMessageId ?? `mobile-client-${Date.now()}`,
    });
  }

  async function sendImage(): Promise<void> {
    if (!token || !selectedChatId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Нет доступа к медиатеке');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (picked.canceled) return;

    const selected = picked.assets[0];
    if (!selected?.base64) {
      setError('Не удалось прочитать изображение');
      return;
    }

    const uploaded = await api.uploadImage(token, selected.base64, selected.fileName ?? 'mobile-image.jpg');
    await api.sendMessage(token, {
      chatId: selectedChatId,
      imageUrl: uploaded.url,
      type: 'image',
      clientMessageId: `mobile-image-${Date.now()}`,
    });

    const history = await api.listMessages(token, selectedChatId);
    setMessages(history.items.reverse());
  }

  async function createDirect(targetUserId: string): Promise<void> {
    if (!token) return;
    await api.createDirectChat(token, targetUserId);
    const chatList = await api.listChats(token);
    setChats(chatList);
  }

  const isAuth = token.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
        <Text style={{ color: '#e2e8f0', fontSize: 22, fontWeight: '700' }}>Telegram Lite Mobile</Text>
        <Text style={{ color: '#94a3b8' }}>Этап 9: auth, chats, chat, profile/search, image picker.</Text>

        {!!error && <Text style={{ color: '#ef4444' }}>{error}</Text>}

        {!isAuth ? (
          <View style={{ gap: 8 }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              placeholder="email"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              secureTextEntry
              placeholder="password"
            />
            <Button title="Login" onPress={() => void onLogin()} />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={{ color: '#e2e8f0' }}>Вы вошли как {me?.displayName ?? me?.username}</Text>

            <View style={{ gap: 8 }}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
                placeholder="Поиск username"
              />
              <Button title="Найти" onPress={() => void onSearch()} />
              {searchResults.map((user) => (
                <TouchableOpacity key={user.id} onPress={() => void createDirect(user.id)}>
                  <Text style={{ color: '#7dd3fc' }}>
                    {user.username} ({user.displayName})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Чаты</Text>
              {chats.map((chat) => (
                <TouchableOpacity key={chat.chatId} onPress={() => void openChat(chat.chatId)}>
                  <Text style={{ color: selectedChatId === chat.chatId ? '#22d3ee' : '#cbd5e1' }}>
                    {chat.participants
                      .filter((participant) => participant.id !== me?.id)
                      .map((participant) => participant.username)
                      .join(', ') || 'Self'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Сообщения</Text>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Text style={{ color: '#e2e8f0' }}>{item.text ?? '[image message]'}</Text>
                )}
                style={{ maxHeight: 260 }}
              />
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
                placeholder="Введите сообщение"
              />
              <Button title="Отправить текст" onPress={() => void sendText()} />
              <Button title="Отправить изображение" onPress={() => void sendImage()} />
            </View>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

