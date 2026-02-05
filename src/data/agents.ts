import { Agent } from '@/types/agent';

export const AGENTS: Agent[] = [
  // ═══════════════ 킬러피처: 결과물 납품 에이전트 ═══════════════
  {
    id: 'website-creator',
    name: 'Website Creator',
    nameKo: '웹사이트크리에이터',
    description: 'Create a stunning landing page in 30 seconds. Free hosting included.',
    descriptionKo: '30초만에 프리미엄 랜딩페이지 완성. 무료 호스팅까지 제공.',
    category: 'business',
    icon: '🌐',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    tags: ['website', 'landing page', 'small business', 'free hosting', '30 seconds'],
    pricing: { type: 'freemium', freeMessages: 3, monthlyPrice: 9900 },
    stats: { totalChats: 1247, rating: 4.9, reviews: 89, monthlyUsers: 523 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 🌐 어떤 비즈니스의 웹사이트를 만들어 드릴까요? 업종과 특징을 알려주세요!',
    suggestedPrompts: ['카페 웹사이트 만들어줘', '네일샵 홈페이지 필요해', '헬스장 랜딩페이지 만들어줘'],
    ctaLink: '/create',
    ctaText: '지금 만들기 →',
  },
  {
    id: 'blog-master',
    name: 'Blog Master',
    nameKo: '블로그마스터',
    description: 'AI blog writer for small business. Naver-optimized, SEO-ready. Get your blog post delivered.',
    descriptionKo: '네이버 블로그 글 1편 납품. C-Rank·DIA 최적화 자동 반영. 결과물 다운로드 가능.',
    category: 'business',
    icon: '✍️',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['blog', 'Naver', 'SEO', 'content delivery', 'small business'],
    pricing: { type: 'pay-per-use', pricePerTask: 500 },
    stats: { totalChats: 8932, rating: 4.9, reviews: 567, monthlyUsers: 2341 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! ✍️ 어떤 업종의 블로그 글이 필요하신가요? 주제와 키워드를 알려주세요!',
    suggestedPrompts: ['카페 블로그 글 써줘', '맛집 리뷰 포스팅 필요해', '네이버 SEO 최적화 글 써줘'],
  },
  {
    id: 'ad-copywriter',
    name: 'Ad Copywriter',
    nameKo: '광고카피AI',
    description: 'AI ad copy generator. Get 10 variations of ad copy delivered instantly.',
    descriptionKo: '네이버·카카오 검색광고 카피 10개 즉시 납품. CTR 높이는 문구 자동 생성.',
    category: 'creative',
    icon: '💡',
    color: '#EAB308',
    gradient: 'from-yellow-500 to-amber-600',
    tags: ['ad copy', 'Naver ads', 'Kakao ads', 'CTR', 'instant delivery'],
    pricing: { type: 'pay-per-use', pricePerTask: 500 },
    stats: { totalChats: 3456, rating: 4.7, reviews: 189, monthlyUsers: 1234 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 💡 어떤 제품/서비스의 광고 카피가 필요하신가요?',
    suggestedPrompts: ['카페 오픈 광고 문구', '네이버 검색광고 카피 만들어줘', '할인 이벤트 SNS 문구'],
  },
  {
    id: 'product-page-writer',
    name: 'Product Page Writer',
    nameKo: '상세페이지작성AI',
    description: 'AI product description writer. Get e-commerce ready copy delivered.',
    descriptionKo: '스마트스토어·쿠팡 상세페이지 카피 납품. 전환율 높이는 상품 설명.',
    category: 'business',
    icon: '🛍️',
    color: '#F97316',
    gradient: 'from-orange-500 to-red-600',
    tags: ['product page', 'Smartstore', 'Coupang', 'e-commerce', 'conversion'],
    pricing: { type: 'pay-per-use', pricePerTask: 1000 },
    stats: { totalChats: 2145, rating: 4.8, reviews: 156, monthlyUsers: 876 },
    status: 'active',
    featured: true,
    model: 'gpt-4o',
    greeting: '안녕하세요! 🛍️ 어떤 상품의 상세페이지가 필요하신가요? 상품 정보를 알려주세요!',
    suggestedPrompts: ['화장품 상세페이지 써줘', '의류 상품 설명 필요해', '식품 스마트스토어 상세페이지'],
  },
  {
    id: 'sns-content-creator',
    name: 'SNS Content Creator',
    nameKo: 'SNS콘텐츠AI',
    description: 'AI Instagram/TikTok content creator. Get caption + hashtags delivered.',
    descriptionKo: '인스타그램·틱톡 캡션 + 해시태그 30개 즉시 납품. A/B 테스트 버전 포함.',
    category: 'creative',
    icon: '📱',
    color: '#EF4444',
    gradient: 'from-red-500 to-pink-600',
    tags: ['Instagram', 'TikTok', 'hashtags', 'captions', 'instant delivery'],
    pricing: { type: 'pay-per-use', pricePerTask: 300 },
    stats: { totalChats: 5432, rating: 4.6, reviews: 267, monthlyUsers: 1876 },
    status: 'active',
    featured: false,
    model: 'gpt-4o',
    greeting: '안녕하세요! 📱 인스타그램, 틱톡 중 어디에 올릴 콘텐츠인가요?',
    suggestedPrompts: ['카페 인스타 포스팅 써줘', '틱톡 릴스 스크립트 필요해', '해시태그 30개 추천해줘'],
  },
  {
    id: 'review-reply-bot',
    name: 'Review Reply Bot',
    nameKo: '리뷰답글AI',
    description: 'AI customer review response generator. Professional replies delivered instantly.',
    descriptionKo: '네이버·배민·쿠팡 고객 리뷰에 전문적인 답글 즉시 생성. 복사해서 붙여넣기만 하세요.',
    category: 'business',
    icon: '💬',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    tags: ['review reply', 'customer service', 'Naver', 'Baemin', 'instant'],
    pricing: { type: 'pay-per-use', pricePerTask: 100 },
    stats: { totalChats: 4321, rating: 4.8, reviews: 234, monthlyUsers: 1543 },
    status: 'active',
    featured: false,
    model: 'gpt-4o',
    greeting: '안녕하세요! 💬 답글 달아야 할 고객 리뷰를 붙여넣어 주세요!',
    suggestedPrompts: ['긍정 리뷰에 감사 답글', '불만 리뷰에 사과 답글', '별점 3점 리뷰 대응'],
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
