// 로컬 스토리지 기반 채팅 히스토리 관리

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string; // 첫 메시지 요약
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'agentmarket_chats';
const MAX_CONVERSATIONS = 50; // 에이전트당 최대 대화

function getAll(): Record<string, Conversation[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, Conversation[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 용량 초과 시 오래된 대화 삭제
    const keys = Object.keys(data);
    for (const key of keys) {
      if (data[key].length > 10) {
        data[key] = data[key].slice(-10);
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* give up */ }
  }
}

/** 에이전트별 대화 목록 가져오기 */
export function getConversations(agentId: string): Conversation[] {
  const all = getAll();
  return (all[agentId] || []).sort((a, b) => b.updatedAt - a.updatedAt);
}

/** 특정 대화 가져오기 */
export function getConversation(agentId: string, convId: string): Conversation | undefined {
  return getConversations(agentId).find(c => c.id === convId);
}

/** 새 대화 생성 */
export function createConversation(agentId: string): Conversation {
  const conv: Conversation = {
    id: crypto.randomUUID(),
    agentId,
    title: '새 대화',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = getAll();
  if (!all[agentId]) all[agentId] = [];
  all[agentId].unshift(conv);
  // 최대 개수 제한
  if (all[agentId].length > MAX_CONVERSATIONS) {
    all[agentId] = all[agentId].slice(0, MAX_CONVERSATIONS);
  }
  saveAll(all);
  return conv;
}

/** 대화에 메시지 추가 */
export function addMessage(agentId: string, convId: string, message: ChatMessage) {
  const all = getAll();
  const convs = all[agentId] || [];
  const conv = convs.find(c => c.id === convId);
  if (!conv) return;

  conv.messages.push(message);
  conv.updatedAt = Date.now();

  // 첫 유저 메시지를 제목으로
  if (conv.title === '새 대화' && message.role === 'user') {
    conv.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }

  saveAll(all);
}

/** 대화 삭제 */
export function deleteConversation(agentId: string, convId: string) {
  const all = getAll();
  if (all[agentId]) {
    all[agentId] = all[agentId].filter(c => c.id !== convId);
    saveAll(all);
  }
}

/** 에이전트 전체 대화 삭제 */
export function clearConversations(agentId: string) {
  const all = getAll();
  delete all[agentId];
  saveAll(all);
}
