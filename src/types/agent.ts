export interface Agent {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  category: AgentCategory;
  icon: string;
  color: string;
  gradient: string;
  tags: string[];
  pricing: AgentPricing;
  stats: AgentStats;
  status: 'active' | 'coming_soon' | 'beta';
  featured: boolean;
  systemPrompt?: string;
  model?: string;
  greeting?: string;
  suggestedPrompts?: string[];
  ctaLink?: string;  // 커스텀 CTA 링크 (예: /create)
  ctaText?: string;  // 커스텀 CTA 텍스트 (예: "지금 만들기 →")
}

export type AgentCategory =
  | 'chat'
  | 'business'
  | 'creative'
  | 'productivity'
  | 'education'
  | 'lifestyle';

export interface AgentPricing {
  type: 'free' | 'freemium' | 'paid' | 'pay-per-use';
  freeMessages?: number;
  monthlyPrice?: number;
  perUsePrice?: number;
  pricePerTask?: number;  // 건당 가격 (예: ₩500)
}

export interface AgentStats {
  totalChats: number;
  rating: number;
  reviews: number;
  monthlyUsers: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  agentId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// English category labels — used as fallback; i18n translations are in messages/*.json
export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  chat: '💬 Chat',
  business: '💼 Business',
  creative: '🎨 Creative',
  productivity: '⚡ Productivity',
  education: '📚 Education',
  lifestyle: '🌟 Lifestyle',
};
