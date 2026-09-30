import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


const DEFAULT_MODEL = 'meta-llama/llama-3.2-1b-instruct:free';

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export default function AIChatModal({ visible, onClose, userName }: AIChatModalProps) {
  const displayName = userName ? userName.split(' ')[0] : 'there';

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${displayName}! 👋 I'm your Morengo business assistant. How can I help you manage or grow your store, services, or upcoming events today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Update initial message if userName changes/loads
  useEffect(() => {
    if (userName && messages.length === 1) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello ${displayName}! 👋 I'm your Morengo business assistant. How can I help you manage or grow your store, services, or upcoming events today?`,
        },
      ]);
    }
  }, [userName]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage = { id: Date.now().toString(), role: 'user', content: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = messages.concat(userMessage).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Tailored business advisor system message
      const systemPrompt = `You are Morengo AI, a practical, encouraging, and sharp business advisor. You assist users who create stores, offer services (like artisans, tutors, repair workers), or host events. Help them with marketing, pricing, customer communication, event scheduling, and business management. Always address the user by their name, ${displayName}. Keep advice concise, actionable, and structured.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://expo.dev',
          'X-Title': 'Morengo Business Assistant',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...apiMessages,
          ],
        }),
      });

      const data = await response.json();

      if (data?.choices?.[0]?.message?.content) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0].message.content,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error(data?.error?.message || 'Invalid response from OpenRouter');
      }
    } catch (error) {
      console.error('OpenRouter Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry ${displayName}, I encountered an issue connecting to the network. Please check your key or try again.`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          item.isError && styles.errorBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <SafeAreaView style={styles.innerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.headerTitle}>Morengo Assistant</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Chat List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.chatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#94A3B8" />
                <Text style={styles.loadingText}>Analyzing business context...</Text>
              </View>
            )}

            {/* Input Bar */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about store promo, pricing, events..."
                placeholderTextColor="#64748B"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                <Ionicons name="send" size={18} color={input.trim() ? '#F8FAFC' : '#475569'} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justify: 'flex-end',
  },
  container: {
    height: '100%',
    backgroundColor: '#0c1220',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#334155',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#451A1A',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#F8FAFC',
  },
  assistantText: {
    color: '#CBD5E1',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1E293B',
  },
});