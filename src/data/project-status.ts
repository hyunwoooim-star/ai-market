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
  lastUpdated: '2026-02-03T23:35:00+09:00',
};

export const keyStats = [
  { label: '라이브 에이전트', value: '18', emoji: '🤖' },
  { label: 'D-Day', value: 'D-15', emoji: '⏰' },
  { label: '비전 문서', value: '3개', emoji: '📄' },
  { label: '병렬 작업', value: '3', emoji: '⚡' },
];

export const tracks: Track[] = [
  {
    id: 'research',
    name: '리서치 & 비전',
    emoji: '🔬',
    color: 'from-violet-500 to-purple-600',
    description: 'AI 에이전트 경제 리서치, 비전 문서, KYA 프로토콜',
    tasks: [
      { name: 'AI 에이전트 경제 딥리서치 (7개 영역)', done: true },
      { name: '비전 문서 v1 + 경쟁사 분석', done: true },
      { name: '한국 크립토/AI 규제 리서치', done: true },
      { name: 'x402 + Google UCP/A2A + Visa TAP 리서치', done: true },
      { name: '비전 문서 v2 — "AI들의 도시" 테시스', done: true },
      { name: 'KYA 5-Layer 프로토콜 설계', done: true },
      { name: 'x402 연동 가이드', done: false, current: true },
      { name: '비즈니스 모델 수치화 (TAM/SAM/SOM)', done: false },
    ],
  },
  {
    id: 'product',
    name: 'AI 경제 코어',
    emoji: '🚀',
    color: 'from-blue-500 to-indigo-600',
    description: 'Agent Registry, KYA 인증, x402 결제, A2A 거래',
    tasks: [
      { name: '솔라나 Phantom 지갑 연동', done: true },
      { name: 'Agent Registry API v1', done: true },
      { name: '채팅 UX (인사+추천질문+AI라벨)', done: true },
      { name: '보안 패치 (Rate limit+HSTS+모니터링)', done: true },
      { name: 'Agent Registry API v2 (지갑 서명 인증)', done: false, current: true },
      { name: 'x402 결제 연동 (devnet)', done: false, current: true },
      { name: 'Service Catalog API', done: false },
      { name: 'Agent-to-Agent 거래 게이트웨이', done: false },
      { name: '평판 시스템', done: false },
      { name: '인간 오너 대시보드', done: false },
    ],
  },
  {
    id: 'marketing',
    name: '마케팅 & 피칭',
    emoji: '📣',
    color: 'from-orange-500 to-red-500',
    description: '몰트북, X, Hashed 피칭, 데모 영상',
    tasks: [
      { name: '몰트북 연동 완료', done: true },
      { name: '트위터 계정 설정', done: false },
      { name: '라이브 시연 영상 제작', done: false },
      { name: 'Hashed 피칭 자료', done: false },
      { name: '마케팅 푸시 (몰트북+X)', done: false },
    ],
  },
  {
    id: 'infra',
    name: 'MVP & 인프라',
    emoji: '🏗️',
    color: 'from-emerald-500 to-teal-600',
    description: '기존 MVP, 배포, 인증, 대시보드',
    tasks: [
      { name: '다크/라이트 모드 + 가시성', done: true },
      { name: '카카오 로그인 연동', done: true },
      { name: 'SEO + 성능/보안', done: true },
      { name: '프로젝트 대시보드 (/dashboard)', done: true },
      { name: '텔레그램 봇 안정화', done: true },
      { name: 'Tailscale 원격 접속', done: true },
      { name: '토스페이먼츠 실연동', done: false },
    ],
  },
];

export const milestones: Milestone[] = [
  { date: '02/02', title: '프로젝트 시작 + MVP v0.1', done: true, emoji: '🎬' },
  { date: '02/03', title: 'MVP v0.2 + 카카오 + 보안 + 대시보드', done: true, emoji: '🔥' },
  { date: '02/03', title: '솔라나 지갑 + KYA 설계 + 비전 v2', done: true, emoji: '💎' },
  { date: '02/04', title: 'Agent Registry v2 + x402 PoC', done: false, emoji: '🔧' },
  { date: '02/06', title: '첫 AI-to-AI 거래 시연', done: false, emoji: '💸' },
  { date: '02/10', title: '평판 시스템 + 오너 대시보드', done: false, emoji: '📊' },
  { date: '02/14', title: '라이브 데모 영상 제작', done: false, emoji: '🎥' },
  { date: '02/18', title: 'Hashed Vibe Labs 지원서 제출', done: false, emoji: '🎯' },
];

export const recentActivity: ActivityItem[] = [
  { time: '23:35', text: 'KYA 5-Layer 프로토콜 설계 완료', type: 'milestone' },
  { time: '23:30', text: 'AI 경제 비전 v2 — "AI들의 도시" 테시스', type: 'milestone' },
  { time: '23:25', text: '몰트북 보안 사고 분석 (Wiz 보고서)', type: 'info' },
  { time: '23:15', text: '보안 대규모 패치 (Rate limit + HSTS + 모니터링)', type: 'feat' },
  { time: '23:05', text: '프로젝트 대시보드 /dashboard 배포', type: 'feat' },
  { time: '23:00', text: '솔라나 Phantom 지갑 연동 + 배포', type: 'feat' },
  { time: '22:40', text: '채팅 UX (인사 메시지 + 추천 질문 + AI 라벨)', type: 'feat' },
  { time: '22:00', text: '카카오 로그인 성공 + 다크모드 전면 개선', type: 'feat' },
  { time: '12:00', text: 'MVP v0.2 — 9개 항목 완료', type: 'milestone' },
];
