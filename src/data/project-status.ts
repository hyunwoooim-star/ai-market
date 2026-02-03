// 프로젝트 상태 데이터 — Clo가 작업하면서 업데이트
// 마지막 업데이트: 2026-02-03 23:00 KST

export interface Task {
  name: string;
  done: boolean;
  current?: boolean; // 현재 진행 중
}

export interface Track {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind gradient
  description: string;
  tasks: Task[];
}

export interface Milestone {
  date: string;
  title: string;
  done: boolean;
  emoji: string;
}

export interface ActivityItem {
  time: string;
  text: string;
  type: 'feat' | 'fix' | 'info' | 'milestone';
}

export const projectMeta = {
  name: '에이전트마켓',
  tagline: 'AI 에이전트 경제 생태계',
  startDate: '2026-02-02',
  dDay: '2026-02-18', // Hashed Vibe Labs
  hackathonDeadline: '2026-02-12', // Solana Agent Hackathon
  liveUrl: 'https://agentmarket.kr',
  github: 'https://github.com/hyunwoooim-star/ai-market',
  lastUpdated: '2026-02-03T23:00:00+09:00',
};

export const keyStats = [
  { label: '라이브 에이전트', value: '18', emoji: '🤖' },
  { label: '커밋 수', value: '25+', emoji: '📦' },
  { label: '기술 스택', value: '7', emoji: '⚙️' },
  { label: '투자 자본', value: '₩500만', emoji: '💰' },
];

export const tracks: Track[] = [
  {
    id: 'research',
    name: '리서치 & 비전',
    emoji: '🔬',
    color: 'from-violet-500 to-purple-600',
    description: 'AI 에이전트 경제 리서치, 비전 문서, 아키텍처 설계',
    tasks: [
      { name: 'AI 에이전트 경제 딥리서치', done: true },
      { name: '리서치 결과 분석 + 비전 문서 v1', done: true },
      { name: '경쟁사 심층 분석 (Fetch.ai, Virtuals, 몰트북 등)', done: true },
      { name: '한국 크립토 규제 리서치', done: true },
      { name: '기술 아키텍처 설계 (솔라나+USDC+에이전트)', done: false, current: true },
      { name: '비즈니스 모델 수치화 (TAM/SAM/SOM)', done: false },
      { name: '비전 문서 v2 (피드백 반영)', done: false },
    ],
  },
  {
    id: 'product',
    name: '프로덕트 강화',
    emoji: '🚀',
    color: 'from-blue-500 to-indigo-600',
    description: '솔라나 지갑, 에이전트 등록, 답변 퀄리티, 크리에이터 대시보드',
    tasks: [
      { name: '솔라나 Phantom 지갑 연동', done: true },
      { name: '에이전트 등록 API 스캐폴딩', done: true },
      { name: '에이전트 답변 퀄리티 개선', done: false, current: true },
      { name: 'USDC 결제 시스템 PoC', done: false },
      { name: '크리에이터 대시보드 UI', done: false },
      { name: '에이전트 마켓 검색/필터', done: false },
    ],
  },
  {
    id: 'marketing',
    name: '마케팅 & 네트워킹',
    emoji: '📣',
    color: 'from-orange-500 to-red-500',
    description: '몰트북, X(트위터), 해커톤, 커뮤니티',
    tasks: [
      { name: '몰트북 가입 + 첫 포스트', done: false, current: true },
      { name: '몰트북 주기적 활동 (네트워킹)', done: false },
      { name: 'X(@agentmarket_kr) 첫 홍보', done: false },
      { name: '해커톤 프로젝트 등록 (Colosseum)', done: false },
      { name: '커뮤니티 마케팅 (에타/블라인드)', done: false },
    ],
  },
  {
    id: 'infra',
    name: 'MVP & 인프라',
    emoji: '🏗️',
    color: 'from-emerald-500 to-teal-600',
    description: '기존 MVP 유지보수, 배포, 인증, 결제',
    tasks: [
      { name: '다크/라이트 모드 + 가시성 개선', done: true },
      { name: '카카오 로그인 연동', done: true },
      { name: 'SEO + 성능/보안 최적화', done: true },
      { name: '토스페이먼츠 결제 UI', done: true },
      { name: '텔레그램 봇 안정화 (워치독)', done: true },
      { name: 'Tailscale 원격 접속', done: true },
      { name: '토스페이먼츠 실연동', done: false },
      { name: '빌드 에러 모니터링', done: false },
    ],
  },
];

export const milestones: Milestone[] = [
  { date: '02/02', title: '프로젝트 시작 + MVP v0.1', done: true, emoji: '🎬' },
  { date: '02/03', title: 'MVP v0.2 + 카카오 로그인 + AI 비전', done: true, emoji: '🔥' },
  { date: '02/03', title: '솔라나 지갑 연동 완료', done: true, emoji: '💎' },
  { date: '02/04', title: '비전 문서 v2 + 아키텍처 설계', done: false, emoji: '📐' },
  { date: '02/05', title: 'USDC 결제 + 에이전트 등록 시스템', done: false, emoji: '💸' },
  { date: '02/08', title: '크리에이터 대시보드 + 마케팅 시작', done: false, emoji: '📊' },
  { date: '02/12', title: '솔라나 해커톤 마감', done: false, emoji: '⏰' },
  { date: '02/15', title: '트랙션 데이터 수집 완료', done: false, emoji: '📈' },
  { date: '02/18', title: 'Hashed Vibe Labs 지원서 제출', done: false, emoji: '🎯' },
];

export const recentActivity: ActivityItem[] = [
  { time: '23:00', text: '솔라나 Phantom 지갑 연동 + 배포', type: 'feat' },
  { time: '22:40', text: 'AI 에이전트 경제 딥리서치 7개 영역 완료', type: 'milestone' },
  { time: '22:33', text: 'AI 문명 비전 전환 — 에이전트 경제 생태계', type: 'milestone' },
  { time: '22:00', text: '카카오 로그인 성공 (Custom OAuth)', type: 'feat' },
  { time: '21:30', text: '다크/라이트 모드 가시성 전면 개선', type: 'fix' },
  { time: '12:00', text: 'MVP v0.2 — 9개 항목 완료 (폰트, SEO, 결제 등)', type: 'milestone' },
  { time: '07:30', text: '에이전트 404/502 버그 수정, 18개 전체 정상', type: 'fix' },
];
