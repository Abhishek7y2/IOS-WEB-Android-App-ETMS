import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { sendAiStreamPromptApi, getProjectsApi, createProjectApi, AiChatMessage, ChatProjectItem } from '../services/chatbotApi';
import { Bot, Send, Sparkles, User, HelpCircle, Trash2, Briefcase, Plus, X } from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';

export const ChatbotScreen = ({ navigation }: any) => {
  const { mode, colors, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Workspace Assistant. Ask me anything about your tasks, company policies, or leave applications!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Project Collection state
  const [projects, setProjects] = useState<ChatProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const list = await getProjectsApi();
    setProjects(list);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Validation Error', 'Please enter a project collection name.');
      return;
    }
    setCreatingProject(true);
    try {
      const created = await createProjectApi(newProjectName.trim());
      setProjects((prev) => [created, ...prev]);
      setNewProjectName('');
      setProjectModalOpen(false);
      Alert.alert('Success', `Project collection "${created.name}" created!`);
    } catch {
      Alert.alert('Error', 'Failed to create project collection.');
    } finally {
      setCreatingProject(false);
    }
  };

  const suggestedPrompts = [
    'Summarize my pending tasks',
    'How do I apply for leave?',
    'What are the workplace policies?',
    'Check my attendance history',
  ];

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist you now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendPrompt = async (promptText?: string) => {
    const text = (promptText || input).trim();
    if (!text || loading) return;

    if (!promptText) setInput('');

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: AiChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setLoading(true);

    try {
      await sendAiStreamPromptApi(text, (chunk: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + chunk } : m))
        );
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId && !m.content
            ? { ...m, content: 'Unable to connect to AI engine. Please check backend connection.' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMessageBubble = ({ item }: { item: AiChatMessage }) => {
    const isAi = item.role === 'assistant';
    return (
      <View style={[styles.msgRow, isAi ? styles.msgAi : styles.msgUser]}>
        <View style={styles.bubbleHeader}>
          {isAi ? <Bot color={colors.accent} size={16} style={{ marginRight: 6 }} /> : <User color="#ffffff" size={16} style={{ marginRight: 6 }} />}
          <Text style={[styles.senderName, isAi ? { color: colors.accent } : styles.textUser]}>{isAi ? 'AI Assistant' : 'You'}</Text>
        </View>
        <View style={[styles.bubble, isAi ? [styles.bubbleAi, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }] : [styles.bubbleUser, { backgroundColor: colors.accent }]]}>
          <Text style={[styles.msgContent, isAi ? [styles.msgContentAi, { color: colors.textPrimary }] : styles.msgContentUser]}>
            {item.content || (isAi ? 'Connecting to AI stream...' : '')}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="AI Assistant"
        navigation={navigation}
      />

      {/* Project Collections Bar */}
      <View style={[styles.projectsBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.borderColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[
              styles.projectChip,
              { backgroundColor: colors.bg, borderColor: colors.borderColor },
              selectedProjectId === null && { borderColor: colors.accent, backgroundColor: mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)' }
            ]}
            onPress={() => setSelectedProjectId(null)}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: selectedProjectId === null ? colors.accent : colors.textSecondary }}>All Chats</Text>
          </TouchableOpacity>

          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.projectChip,
                { backgroundColor: colors.bg, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' },
                selectedProjectId === p.id && { borderColor: '#c084fc', backgroundColor: mode === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(192, 132, 252, 0.12)' }
              ]}
              onPress={() => setSelectedProjectId(p.id)}
            >
              <Briefcase color={selectedProjectId === p.id ? '#c084fc' : colors.textSecondary} size={12} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedProjectId === p.id ? '#c084fc' : colors.textSecondary }}>{p.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.newFolderBtn, { backgroundColor: colors.accent }]}
            onPress={() => setProjectModalOpen(true)}
          >
            <Plus color="#ffffff" size={14} style={{ marginRight: 4 }} />
            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>New Folder</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            messages.length <= 2 ? (
              <View style={[styles.suggestedContainer, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                <Text style={[styles.suggestedTitle, { color: colors.accent }]}>Suggested Prompts</Text>
                <View style={styles.promptsRow}>
                  {suggestedPrompts.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.promptChip, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}
                      onPress={() => handleSendPrompt(prompt)}
                      activeOpacity={0.8}
                    >
                      <HelpCircle color={colors.accent} size={14} style={{ marginRight: 6 }} />
                      <Text style={[styles.promptText, { color: colors.textPrimary }]}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.typingText, { color: colors.accent }]}>Receiving live SSE tokens...</Text>
          </View>
        )}

        {/* Composer */}
        <View style={[styles.composer, { backgroundColor: colors.cardBg, borderTopColor: colors.borderColor }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
            placeholder="Ask AI Assistant anything..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.accent }, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSendPrompt()}
            disabled={!input.trim() || loading}
          >
            <Send color="#ffffff" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Project Folder Creation Modal */}
      <Modal visible={projectModalOpen} transparent animationType="fade" onRequestClose={() => setProjectModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: colors.cardBg, borderRadius: 20, borderWidth: 1, borderColor: colors.borderColor, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>New Project Collection</Text>
              <TouchableOpacity onPress={() => setProjectModalOpen(false)}>
                <X color={colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Organize your AI chat threads into dedicated project folders.
            </Text>
            <TextInput
              style={{ backgroundColor: colors.bg, borderRadius: 12, borderWidth: 1, borderColor: colors.borderColor, paddingHorizontal: 16, paddingVertical: 12, color: colors.textPrimary, fontSize: 15, marginBottom: 20 }}
              placeholder="e.g. Q3 Marketing, Bug Fixes"
              placeholderTextColor={colors.textSecondary}
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.bg }}
                onPress={() => setProjectModalOpen(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.accent, opacity: creatingProject ? 0.6 : 1 }}
                onPress={handleCreateProject}
                disabled={creatingProject}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>{creatingProject ? 'Creating...' : 'Create Folder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  clearBtn: {
    padding: 8,
  },
  projectsBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  projectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  newFolderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  msgRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgAi: {
    alignSelf: 'flex-start',
  },
  msgUser: {
    alignSelf: 'flex-end',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
  },
  textUser: {
    color: '#6366f1',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAi: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    borderTopRightRadius: 4,
  },
  msgContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgContentAi: {
  },
  msgContentUser: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestedContainer: {
    marginTop: 10,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  promptsRow: {
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  promptText: {
    fontSize: 13,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

