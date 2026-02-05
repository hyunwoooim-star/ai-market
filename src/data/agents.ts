import { Agent } from '@/types/agent';

export const AGENTS: Agent[] = [
  // ═══════════════ 킬러피처: 결과물 납품 에이전트 (4개) ═══════════════
  {
    id: 'website-creator',
    name: 'Website Creator',
    nameKo: '웹사이트 AI',
    description: 'Create a stunning landing page in 30 seconds. Free hosting included.',
    descriptionKo: '30초만에 프리미엄 랜딩페이지 완성. 무료 호스팅까지 제공.',
    category: 'business',
    icon: '🌐',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    tags: ['웹사이트', '랜딩페이지', '소상공인', '무료호스팅'],
    pricing: { type: 'freemium', freeMessages: 3, monthlyPrice: 9900 },
    stats: { totalChats: 1247, rating: 4.9, reviews: 89, monthlyUsers: 523 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 🌐 어떤 비즈니스의 웹사이트를 만들어 드릴까요? 업종과 특징을 알려주세요!',
    suggestedPrompts: ['카페 웹사이트 만들어줘', '네일샵 홈페이지 필요해', '헬스장 랜딩페이지 만들어줘'],
    ctaLink: '/create',
    ctaText: '무료로 만들기 →',
  },
  {
    id: 'blog-master',
    name: 'Blog Master',
    nameKo: '블로그 AI',
    description: 'AI blog writer for small business. Naver-optimized, SEO-ready. Get your blog post delivered.',
    descriptionKo: '네이버 블로그 글 1편 납품. C-Rank·DIA 최적화 자동 반영. 결과물 다운로드 가능.',
    category: 'business',
    icon: '✍️',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['블로그', '네이버', 'SEO', '콘텐츠'],
    pricing: { type: 'pay-per-use', pricePerTask: 500 },
    stats: { totalChats: 8932, rating: 4.9, reviews: 567, monthlyUsers: 2341 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! ✍️ 어떤 업종의 블로그 글이 필요하신가요? 주제와 키워드를 알려주세요!',
    suggestedPrompts: ['카페 블로그 글 써줘', '맛집 리뷰 포스팅 필요해', '네이버 SEO 최적화 글 써줘'],
  },
  {
    id: 'product-page-writer',
    name: 'Product Page Writer',
    nameKo: '상세페이지 AI',
    description: 'AI product description writer. Get e-commerce ready copy delivered.',
    descriptionKo: '스마트스토어·쿠팡 상세페이지 카피 납품. 전환율 높이는 상품 설명.',
    category: 'business',
    icon: '🛍️',
    color: '#F97316',
    gradient: 'from-orange-500 to-red-600',
    tags: ['상세페이지', '스마트스토어', '쿠팡', '이커머스'],
    pricing: { type: 'pay-per-use', pricePerTask: 1000 },
    stats: { totalChats: 2145, rating: 4.8, reviews: 156, monthlyUsers: 876 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 🛍️ 어떤 상품의 상세페이지가 필요하신가요? 상품 정보를 알려주세요!',
    suggestedPrompts: ['화장품 상세페이지 써줘', '의류 상품 설명 필요해', '식품 스마트스토어 상세페이지'],
  },
  {
    id: 'menu-creator',
    name: 'Menu Creator',
    nameKo: '메뉴판 AI',
    description: 'Create beautiful digital menus for restaurants and cafes. Perfect for delivery apps.',
    descriptionKo: '식당·카페 디지털 메뉴판 제작. 배민·요기요 등록용 이미지 즉시 생성.',
    category: 'business',
    icon: '📋',
    color: '#EAB308',
    gradient: 'from-yellow-500 to-amber-600',
    tags: ['메뉴판', '식당', '카페', '배달앱'],
    pricing: { type: 'pay-per-use', pricePerTask: 500 },
    stats: { totalChats: 1523, rating: 4.7, reviews: 98, monthlyUsers: 654 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 📋 어떤 메뉴판을 만들어 드릴까요? 업종과 메뉴 정보를 알려주세요!',
    suggestedPrompts: ['카페 메뉴판 만들어줘', '식당 가격표 필요해', '배민용 메뉴 이미지 만들어줘'],
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}

export function getFeaturedAgents(): Agent[] {
  return AGENTS.filter(a => a.featured);
}

export function getAgentsByCategory(category: string): Agent[] {
  if (category === 'all') return AGENTS;
  return AGENTS.filter(a => a.category === category);
}

export function getActiveAgents(): Agent[] {
  return AGENTS.filter(a => a.status !== 'coming_soon');
}

export function getRelatedAgents(agentId: string, limit = 3): Agent[] {
  const agent = getAgent(agentId);
  if (!agent) return [];
  return AGENTS
    .filter(a => a.id !== agentId && a.category === agent.category && a.status !== 'coming_soon')
    .sort((a, b) => b.stats.totalChats - a.stats.totalChats)
    .slice(0, limit);
}
