# 🏗️ AI 에이전트 마켓플레이스 — 기술 설계 문서

> **프로젝트:** ai-market | **버전:** v0.1 | **최종 수정:** 2026-02-03
> **팀:** Han(파운더) + Clo(AI 에이전트) | **타겟:** 한국 시장

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [Supabase DB 스키마](#2-supabase-db-스키마)
3. [페이지 구조 (App Router)](#3-페이지-구조-app-router)
4. [API 라우트 설계](#4-api-라우트-설계)
5. [컴포넌트 구조](#5-컴포넌트-구조)
6. [타입 시스템](#6-타입-시스템)
7. [3일 빌드 타임라인](#7-3일-빌드-타임라인)
8. [환경 변수](#8-환경-변수)

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ 웹 (Next)│  │ 카카오톡  │  │ (미래)    │  │ (미래)       │  │
│  │ React 19 │  │ 채널 API  │  │ 디스코드  │  │ 슬랙         │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬───────┘  │
│       │              │              │              │          │
└───────┼──────────────┼──────────────┼──────────────┼──────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 (Vercel)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App Router (RSC + Client Components)                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  API Routes (Route Handlers)                         │   │
│  │  ├─ /api/chat      → Gemini 스트리밍 대화            │   │
│  │  ├─ /api/agents    → 에이전트 CRUD                   │   │
│  │  ├─ /api/kakao     → 카카오 웹훅 수신               │   │
│  │  └─ /api/payments  → 토스페이먼츠 (Phase 2)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
              ▼                       ▼
┌──────────────────────┐   ┌──────────────────────┐
│   Supabase           │   │   Google Gemini API   │
│  ├─ Auth (소셜)      │   │  ├─ gemini-2.0-flash  │
│  ├─ PostgreSQL       │   │  └─ 스트리밍 응답     │
│  ├─ Realtime (채팅)  │   └──────────────────────┘
│  ├─ Storage (파일)   │
│  └─ Edge Functions   │
└──────────────────────┘
```

### 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| **에이전트 중심** | 모든 것은 `agent`를 중심으로 돌아감. 에이전트가 1급 시민 |
| **채널 불가지론** | 같은 에이전트가 웹, 카카오, 디스코드 어디서든 동작 |
| **스트리밍 우선** | 채팅은 항상 스트리밍. UX가 생명 |
| **무료→유료 퍼널** | 무료 체험 → 구독 전환. 결제 벽은 최대한 늦게 |
| **Clo 운영 가능** | DB, 에이전트 설정을 Clo가 직접 관리할 수 있는 구조 |

---

## 2. Supabase DB 스키마

### 2.1 ERD 관계도

```
profiles ──1:N──▶ conversations ──1:N──▶ messages
    │                   │
    │                   │
    ├──1:N──▶ subscriptions ──N:1──▶ plans
    │
    └──1:N──▶ payments

agents ──N:1──▶ agent_categories
   │
   ├──1:N──▶ conversations
   ├──1:N──▶ agent_prompts
   └──1:N──▶ agent_stats (일별 집계)
```

### 2.2 테이블 정의

#### `profiles` — 사용자 프로필 (Supabase Auth 연동)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  provider TEXT,                          -- 'kakao', 'google', 'github'
  kakao_id TEXT UNIQUE,                   -- 카카오 연동 시
  
  -- 사용량 추적 (무료 티어 관리)
  free_messages_used INT DEFAULT 0,
  free_messages_reset_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}',            -- 유연한 확장용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_kakao_id ON profiles(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX idx_profiles_email ON profiles(email);
```

#### `agent_categories` — 에이전트 카테고리

```sql
CREATE TABLE agent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- '연애/소통', '콘텐츠/마케팅'
  slug TEXT UNIQUE NOT NULL,              -- 'dating', 'content'
  icon TEXT,                              -- 이모지 or 아이콘명
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `agents` — AI 에이전트

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES agent_categories(id),
  
  -- 기본 정보
  name TEXT NOT NULL,                     -- '연애 상담사 루나'
  slug TEXT UNIQUE NOT NULL,              -- 'luna-dating'
  tagline TEXT,                           -- 한줄 소개
  description TEXT,                       -- 상세 설명 (마크다운)
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- AI 설정
  system_prompt TEXT NOT NULL,            -- 시스템 프롬프트
  model TEXT DEFAULT 'gemini-2.0-flash',  -- 사용 모델
  temperature FLOAT DEFAULT 0.7,
  max_tokens INT DEFAULT 2048,
  
  -- 기능 설정
  capabilities JSONB DEFAULT '[]',        -- ['web_search', 'image_gen']
  welcome_message TEXT,                   -- 첫 인사 메시지
  suggested_prompts JSONB DEFAULT '[]',   -- 추천 질문 목록
  
  -- 비즈니스 설정
  pricing_type TEXT DEFAULT 'free',       -- 'free', 'freemium', 'paid'
  free_message_limit INT DEFAULT 20,      -- 무료 메시지 수/일
  
  -- 상태
  status TEXT DEFAULT 'draft',            -- 'draft', 'active', 'inactive'
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  
  -- 통계 (비정규화, 성능용)
  total_conversations INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  avg_rating FLOAT DEFAULT 0,
  
  -- 카카오 연동
  kakao_channel_id TEXT,                  -- 카카오 채널 연결 시
  
  -- 메타
  tags JSONB DEFAULT '[]',               -- 검색용 태그
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_category ON agents(category_id);
CREATE INDEX idx_agents_status ON agents(status) WHERE status = 'active';
CREATE INDEX idx_agents_featured ON agents(is_featured, sort_order) WHERE status = 'active';
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
```

#### `agent_prompts` — 에이전트 프롬프트 버전 관리

```sql
CREATE TABLE agent_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  version INT NOT NULL,
  system_prompt TEXT NOT NULL,
  change_note TEXT,                       -- '톤 조정: 더 친근하게'
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, version)
);
```

#### `conversations` — 대화 세션

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- 채널 정보
  channel TEXT DEFAULT 'web',             -- 'web', 'kakao', 'discord'
  channel_conversation_id TEXT,           -- 외부 채널의 대화 ID
  
  title TEXT,                             -- 자동 생성 or 사용자 지정
  
  -- 컨텍스트 (최근 N개 메시지 캐시)
  context_summary TEXT,                   -- 긴 대화의 요약
  
  -- 상태
  status TEXT DEFAULT 'active',           -- 'active', 'archived'
  message_count INT DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_conversations_channel ON conversations(channel, channel_conversation_id) 
  WHERE channel_conversation_id IS NOT NULL;
```

#### `messages` — 메시지

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL,                     -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  
  -- 메타데이터
  tokens_used INT,                        -- 토큰 사용량
  model_used TEXT,                        -- 실제 사용된 모델
  latency_ms INT,                         -- 응답 시간
  
  -- 피드백
  rating INT CHECK (rating BETWEEN 1 AND 5),
  
  metadata JSONB DEFAULT '{}',            -- 추가 데이터 (이미지 URL 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (대화별 메시지 조회 최적화)
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- 파티셔닝 고려사항: 메시지가 100만 건 넘으면 월별 파티셔닝 도입
```

#### `plans` — 구독 플랜

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- '무료', '프로', '비즈니스'
  slug TEXT UNIQUE NOT NULL,
  
  -- 제한
  daily_message_limit INT,               -- NULL = 무제한
  monthly_message_limit INT,
  available_agents JSONB DEFAULT '[]',   -- 빈 배열 = 전체 접근
  
  -- 가격 (토스페이먼츠 연동용)
  price_monthly INT DEFAULT 0,           -- 원 단위
  price_yearly INT DEFAULT 0,
  
  -- 기능
  features JSONB DEFAULT '[]',           -- ['priority_response', 'no_ads']
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subscriptions` — 구독

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  
  status TEXT DEFAULT 'active',           -- 'active', 'cancelled', 'expired', 'past_due'
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  
  -- 토스페이먼츠
  toss_billing_key TEXT,                  -- 자동결제용 빌링키
  toss_customer_key TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id) WHERE status = 'active';
```

#### `payments` — 결제 내역

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- 토스페이먼츠
  toss_payment_key TEXT UNIQUE,
  toss_order_id TEXT UNIQUE,
  
  amount INT NOT NULL,                    -- 원 단위
  currency TEXT DEFAULT 'KRW',
  status TEXT DEFAULT 'pending',          -- 'pending', 'paid', 'failed', 'refunded'
  
  payment_method TEXT,                    -- 'card', 'transfer'
  receipt_url TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
```

#### `agent_stats` — 일별 에이전트 통계

```sql
CREATE TABLE agent_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  conversations_count INT DEFAULT 0,
  messages_count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  avg_rating FLOAT,
  avg_latency_ms INT,
  
  UNIQUE(agent_id, date)
);

CREATE INDEX idx_agent_stats_date ON agent_stats(agent_id, date DESC);
```

### 2.3 RLS (Row Level Security) 정책

```sql
-- ============================================
-- profiles
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 자기 프로필만 조회/수정
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 신규 가입 시 자동 생성 (트리거 사용)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- agents (공개 읽기, 관리자만 쓰기)
-- ============================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 활성 에이전트는 누구나 조회 가능
CREATE POLICY "agents_select_active" ON agents
  FOR SELECT USING (status = 'active');

-- 서비스 키로만 CRUD (Clo가 Edge Function/API에서 관리)
-- → 프론트에서 직접 에이전트 수정 불가

-- ============================================
-- agent_categories (공개 읽기)
-- ============================================
ALTER TABLE agent_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON agent_categories
  FOR SELECT USING (true);

-- ============================================
-- conversations
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 자기 대화만 접근
CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- messages
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 자기 대화의 메시지만 접근 (서브쿼리)
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- subscriptions & payments
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.4 트리거 & 함수

```sql
-- 신규 유저 → 자동 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '사용자'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 메시지 추가 시 → 대화 & 에이전트 카운터 업데이트
CREATE OR REPLACE FUNCTION update_message_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- 대화 카운터
  UPDATE conversations SET 
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  -- 에이전트 카운터 (비정규화)
  UPDATE agents SET 
    total_messages = total_messages + 1
  WHERE id = (
    SELECT agent_id FROM conversations WHERE id = NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_message_counts();

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 3. 페이지 구조 (App Router)

### 3.1 디렉토리 트리

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (폰트, 메타, 프로바이더)
│   ├── page.tsx                      # 랜딩페이지 (/)
│   ├── globals.css                   # 글로벌 스타일
│   │
│   ├── (auth)/                       # Auth 그룹 (별도 레이아웃)
│   │   ├── layout.tsx                # 미니멀 Auth 레이아웃
│   │   ├── login/page.tsx            # /login
│   │   ├── signup/page.tsx           # /signup (리디렉션용)
│   │   └── callback/route.ts         # /callback (OAuth 콜백)
│   │
│   ├── (main)/                       # 메인 앱 그룹 (공통 Nav/Footer)
│   │   ├── layout.tsx                # Nav + Footer 레이아웃
│   │   ├── agents/
│   │   │   ├── page.tsx              # /agents — 에이전트 카탈로그
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # /agents/luna-dating — 에이전트 상세
│   │   │       └── chat/page.tsx     # /agents/luna-dating/chat — 채팅
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx              # /dashboard — 내 대화 목록
│   │       ├── conversations/
│   │       │   └── [id]/page.tsx     # /dashboard/conversations/[id]
│   │       ├── settings/page.tsx     # /dashboard/settings — 프로필 설정
│   │       └── billing/page.tsx      # /dashboard/billing — 결제 관리
│   │
│   ├── api/
│   │   ├── chat/route.ts             # POST — Gemini 스트리밍 대화
│   │   ├── agents/
│   │   │   ├── route.ts              # GET (목록) / POST (생성)
│   │   │   └── [id]/route.ts         # GET / PATCH / DELETE
│   │   ├── kakao/
│   │   │   └── webhook/route.ts      # POST — 카카오 웹훅 수신
│   │   └── payments/
│   │       ├── confirm/route.ts      # POST — 토스 결제 승인
│   │       └── webhook/route.ts      # POST — 토스 웹훅
│   │
│   ├── not-found.tsx                 # 404 페이지
│   └── error.tsx                     # 에러 바운더리
│
├── components/
│   ├── ui/                           # 기본 UI 컴포넌트
│   ├── agents/                       # 에이전트 관련
│   ├── chat/                         # 채팅 관련
│   ├── layout/                       # 레이아웃 관련
│   └── landing/                      # 랜딩페이지 전용
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 브라우저 클라이언트
│   │   ├── server.ts                 # 서버 클라이언트
│   │   └── admin.ts                  # 서비스 키 클라이언트 (서버 전용)
│   ├── gemini/
│   │   ├── client.ts                 # Gemini API 클라이언트
│   │   └── prompts.ts                # 프롬프트 유틸리티
│   ├── kakao/
│   │   └── client.ts                 # 카카오 API 클라이언트
│   └── utils.ts                      # 공통 유틸 (cn, formatDate 등)
│
├── hooks/
│   ├── use-chat.ts                   # 채팅 상태 관리
│   ├── use-user.ts                   # 사용자 세션
│   └── use-agents.ts                 # 에이전트 데이터
│
├── types/
│   ├── database.ts                   # Supabase 자동 생성 타입
│   ├── agent.ts                      # 에이전트 관련 타입
│   ├── chat.ts                       # 채팅 관련 타입
│   └── api.ts                        # API 응답 타입
│
└── constants/
    ├── agents.ts                     # 초기 에이전트 데이터
    └── site.ts                       # 사이트 메타데이터
```

### 3.2 각 페이지 상세

#### `/` — 랜딩페이지

| 섹션 | 설명 | 컴포넌트 |
|------|------|---------|
| Hero | 풀스크린. 그라데이션 + 파티클. CTA "지금 무료로 시작" | `<HeroSection>` |
| 에이전트 쇼케이스 | 3D 카드 캐러셀. 인기 에이전트 3-4개 | `<AgentShowcase>` |
| 작동 방식 | 3단계 설명 (고르기→대화→결과) | `<HowItWorks>` |
| 후기/소셜프루프 | 카카오 스타일 채팅 버블 형태 | `<Testimonials>` |
| 가격 | 무료/프로 비교 테이블 | `<PricingSection>` |
| CTA | 하단 CTA 반복 | `<BottomCTA>` |

**디자인 키워드:** 다크 모드 기본, 네온 그라데이션 (보라→파랑), 글래스모피즘

#### `/agents` — 에이전트 카탈로그

- 카테고리 필터 (탭 or 사이드바)
- 검색 (에이전트 이름/태그)
- 그리드 카드 레이아웃 (반응형 2-3-4열)
- SSR (SEO) + 클라이언트 필터링

#### `/agents/[slug]` — 에이전트 상세

- 에이전트 아바타 + 커버 이미지
- 설명, 기능, 추천 질문
- "대화 시작" CTA 버튼
- 리뷰/평점 섹션
- 관련 에이전트 추천
- SSR (동적 메타 태그 for SEO/공유)

#### `/agents/[slug]/chat` — 채팅 인터페이스

- 전체 화면 채팅 UI
- 메시지 스트리밍 (타이핑 효과)
- 마크다운 렌더링 (코드 블록, 리스트 등)
- 이미지 미리보기 (에이전트가 지원 시)
- 추천 질문 칩
- 채팅 내보내기 (복사)
- **인증 필수** (미인증 시 모달)

#### `/dashboard` — 사용자 대시보드

- 최근 대화 목록
- 에이전트별 그룹핑
- 사용량 표시 (무료 티어: 20/일)
- 즐겨찾기 에이전트

---

## 4. API 라우트 설계

### 4.1 `POST /api/chat` — AI 채팅 (핵심)

```typescript
// 요청
interface ChatRequest {
  agent_id: string;
  conversation_id?: string;     // 기존 대화 이어하기 (없으면 새 대화)
  message: string;
}

// 응답: ReadableStream (Server-Sent Events)
// event: token
// data: {"content": "안녕", "done": false}
// ...
// event: done
// data: {"message_id": "uuid", "tokens_used": 150, "done": true}
```

**처리 흐름:**

```
1. 인증 확인 (Supabase JWT)
2. 에이전트 존재 + 활성 확인
3. 무료 사용량 체크 (일일 한도)
4. conversation_id 없으면 → 새 대화 생성
5. 이전 메시지 N개 로드 (컨텍스트)
6. 사용자 메시지 DB 저장
7. Gemini API 호출 (스트리밍)
   - system_prompt + context + user_message
8. 스트리밍 응답을 클라이언트로 전달
9. 완료 후 AI 응답 DB 저장
10. 사용량 카운터 증가
```

### 4.2 `GET /api/agents` — 에이전트 목록

```typescript
// 쿼리 파라미터
interface AgentsQuery {
  category?: string;            // 카테고리 slug
  search?: string;              // 검색어
  featured?: boolean;           // 추천만
  limit?: number;               // 기본 20
  offset?: number;
}

// 응답
interface AgentsResponse {
  agents: Agent[];
  total: number;
  hasMore: boolean;
}
```

### 4.3 `POST /api/kakao/webhook` — 카카오 웹훅

```typescript
// 카카오 스킬 서버 규격
interface KakaoWebhookRequest {
  intent: { id: string; name: string };
  userRequest: {
    timezone: string;
    block: { id: string; name: string };
    utterance: string;           // 사용자 메시지
    user: {
      id: string;               // 카카오 유저 고유 ID
      type: string;
      properties: Record<string, string>;
    };
  };
  bot: { id: string; name: string };
}

// 응답 (카카오 스킬 규격)
interface KakaoWebhookResponse {
  version: "2.0";
  template: {
    outputs: Array<{
      simpleText?: { text: string };
      simpleImage?: { imageUrl: string; altText: string };
    }>;
    quickReplies?: Array<{
      label: string;
      action: "message";
      messageText: string;
    }>;
  };
}
```

**처리 흐름:**

```
1. 카카오 서명 검증
2. user.id로 프로필 조회/생성 (카카오 전용)
3. 기존 대화 조회/생성
4. Gemini 호출 (비스트리밍 — 카카오는 동기 응답 필요)
5. 5초 타임아웃 주의 (카카오 제한)
   - 긴 응답은 "잠시만요..." + 비동기 처리
6. 카카오 규격으로 응답 포맷팅
```

### 4.4 API 라우트 전체 맵

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `POST` | `/api/chat` | ✅ | AI 스트리밍 대화 |
| `GET` | `/api/agents` | ❌ | 에이전트 목록 (공개) |
| `GET` | `/api/agents/[id]` | ❌ | 에이전트 상세 (공개) |
| `POST` | `/api/agents` | 🔑 Admin | 에이전트 생성 |
| `PATCH` | `/api/agents/[id]` | 🔑 Admin | 에이전트 수정 |
| `DELETE` | `/api/agents/[id]` | 🔑 Admin | 에이전트 삭제 |
| `POST` | `/api/kakao/webhook` | 🔑 카카오 | 카카오 웹훅 |
| `POST` | `/api/payments/confirm` | ✅ | 토스 결제 승인 |
| `POST` | `/api/payments/webhook` | 🔑 토스 | 토스 웹훅 |

---

## 5. 컴포넌트 구조

### 5.1 UI 기본 컴포넌트 (`components/ui/`)

CVA(class-variance-authority) + Tailwind 기반. Shadcn 스타일이지만 직접 구현.

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| `Button` | `button.tsx` | variant: primary/secondary/ghost/danger, size: sm/md/lg |
| `Input` | `input.tsx` | 텍스트 입력, 검색용 |
| `Card` | `card.tsx` | 범용 카드 컨테이너 |
| `Badge` | `badge.tsx` | 태그, 상태 표시 |
| `Avatar` | `avatar.tsx` | 사용자/에이전트 프로필 이미지 |
| `Modal` | `modal.tsx` | 모달 (Framer Motion 애니메이션) |
| `Skeleton` | `skeleton.tsx` | 로딩 스켈레톤 |
| `Toast` | `toast.tsx` | 알림 토스트 |
| `Spinner` | `spinner.tsx` | 로딩 스피너 |
| `Tabs` | `tabs.tsx` | 탭 네비게이션 |
| `Dropdown` | `dropdown.tsx` | 드롭다운 메뉴 |

### 5.2 레이아웃 컴포넌트 (`components/layout/`)

| 컴포넌트 | 설명 |
|---------|------|
| `Navbar` | 상단 네비게이션. 로고 + 메뉴 + 로그인 버튼 |
| `Footer` | 하단. 링크, 소셜, 저작권 |
| `Sidebar` | 대시보드 사이드바 (모바일: 하단 탭) |
| `Container` | max-width 래퍼 |

### 5.3 에이전트 컴포넌트 (`components/agents/`)

| 컴포넌트 | 설명 |
|---------|------|
| `AgentCard` | 카탈로그 카드. 아바타 + 이름 + 태그라인 + 카테고리 배지 |
| `AgentGrid` | 에이전트 그리드 레이아웃 (반응형) |
| `AgentDetail` | 상세 페이지 본문 |
| `AgentStats` | 대화수, 평점 표시 |
| `CategoryFilter` | 카테고리 탭/칩 필터 |
| `SearchBar` | 에이전트 검색 |
| `AgentCardSkeleton` | 카드 로딩 상태 |

### 5.4 채팅 컴포넌트 (`components/chat/`)

| 컴포넌트 | 설명 |
|---------|------|
| `ChatContainer` | 채팅 전체 레이아웃 |
| `ChatHeader` | 에이전트 정보 + 뒤로가기 |
| `MessageList` | 메시지 목록 (가상 스크롤) |
| `MessageBubble` | 개별 메시지 (user/assistant 스타일 분리) |
| `ChatInput` | 입력창 + 전송 버튼 |
| `TypingIndicator` | AI 응답 중 표시 |
| `SuggestedPrompts` | 추천 질문 칩 목록 |
| `StreamingText` | 스트리밍 텍스트 렌더러 (타이핑 효과) |
| `MarkdownRenderer` | 마크다운 → React 렌더링 |
| `ChatLimit` | 무료 한도 도달 시 업그레이드 유도 |

### 5.5 랜딩페이지 컴포넌트 (`components/landing/`)

| 컴포넌트 | 설명 |
|---------|------|
| `HeroSection` | 히어로. 그라데이션 배경 + 타이핑 애니메이션 |
| `AgentShowcase` | 에이전트 카드 캐러셀 (Framer Motion) |
| `HowItWorks` | 3단계 설명 (스크롤 애니메이션) |
| `Testimonials` | 카톡 스타일 후기 (채팅 버블) |
| `PricingSection` | 가격 비교 테이블 |
| `BottomCTA` | 하단 전환 유도 |
| `ParticleBackground` | 배경 파티클 효과 |
| `GradientText` | 그라데이션 텍스트 |

---

## 6. 타입 시스템

### 6.1 핵심 타입 (`types/`)

```typescript
// types/database.ts — Supabase 자동 생성 + 커스텀 타입

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      agents: {
        Row: Agent;
        Insert: AgentInsert;
        Update: AgentUpdate;
      };
      // ... 각 테이블 동일 패턴
    };
  };
}

// types/agent.ts
export interface Agent {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  capabilities: string[];
  welcome_message: string | null;
  suggested_prompts: string[];
  pricing_type: 'free' | 'freemium' | 'paid';
  free_message_limit: number;
  status: 'draft' | 'active' | 'inactive';
  is_featured: boolean;
  sort_order: number;
  total_conversations: number;
  total_messages: number;
  avg_rating: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  category?: AgentCategory;
}

// types/chat.ts
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number | null;
  rating: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  channel: 'web' | 'kakao' | 'discord';
  title: string | null;
  status: 'active' | 'archived';
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  // 조인
  agent?: Agent;
  messages?: ChatMessage[];
}

// 스트리밍 이벤트
export interface ChatStreamEvent {
  type: 'token' | 'done' | 'error';
  content?: string;
  message_id?: string;
  tokens_used?: number;
  error?: string;
}

// types/api.ts
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
```

---

## 7. 3일 빌드 타임라인

> **전제:** Clo가 24시간 코딩 가능. Han은 디자인 리뷰 + 카카오/결제 설정.

### 📅 Day 1: 기반 + 핵심 (DB, Auth, 에이전트 표시)

| 시간 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| **0-2h** | Supabase 프로젝트 생성 + DB 마이그레이션 | 전체 스키마, RLS, 트리거 | - |
| **2-3h** | Supabase 클라이언트 설정 | `lib/supabase/client.ts`, `server.ts`, `admin.ts` | DB |
| **3-4h** | 타입 생성 + 상수 정의 | `types/`, `constants/` | DB |
| **4-6h** | Auth 구현 (카카오 + Google 소셜 로그인) | `(auth)/login`, 콜백, 미들웨어 | Supabase |
| **6-8h** | UI 기본 컴포넌트 구현 | Button, Card, Input, Badge, Avatar, Modal, Skeleton | - |
| **8-10h** | 레이아웃 (Navbar, Footer) + 루트 레이아웃 리팩터 | `(main)/layout.tsx` | UI 컴포넌트 |
| **10-13h** | 에이전트 시드 데이터 삽입 + API | 런칭 에이전트 2-3개 데이터 | DB |
| **13-16h** | 에이전트 카탈로그 페이지 | `/agents` — 그리드, 필터, 검색 | API, 컴포넌트 |
| **16-18h** | 에이전트 상세 페이지 | `/agents/[slug]` — SSR, 메타 태그 | 카탈로그 |
| **18-20h** | 랜딩페이지 Hero + AgentShowcase 섹션 | `/` 상단 | 컴포넌트 |

**Day 1 체크포인트:** ✅ DB 완성 ✅ Auth 동작 ✅ 에이전트 목록/상세 표시 ✅ 랜딩 1차

---

### 📅 Day 2: 채팅 엔진 + 완성도

| 시간 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| **0-3h** | Gemini API 연동 + 스트리밍 구현 | `lib/gemini/`, `/api/chat` | - |
| **3-6h** | 채팅 UI 전체 구현 | `ChatContainer`, `MessageBubble`, `ChatInput`, 스트리밍 | API |
| **6-8h** | 채팅 훅 + 상태 관리 | `use-chat.ts` — 메시지 목록, 전송, 스트리밍 | 채팅 UI |
| **8-10h** | 대화 기록 저장/불러오기 | Conversation CRUD, 이전 대화 이어하기 | DB |
| **10-12h** | 사용자 대시보드 | `/dashboard` — 대화 목록, 즐겨찾기 | Auth, 대화 |
| **12-14h** | 마크다운 렌더링 + 코드 하이라이팅 | `MarkdownRenderer` | 채팅 |
| **14-16h** | 랜딩페이지 나머지 섹션 | HowItWorks, Testimonials, Pricing, CTA | - |
| **16-18h** | 무료 사용량 체크 + 제한 UI | 일일 한도, 업그레이드 유도 모달 | Auth, 채팅 |
| **18-20h** | 반응형 + 모바일 최적화 | 전체 페이지 모바일 테스트 | 전체 |

**Day 2 체크포인트:** ✅ AI 채팅 완전 동작 ✅ 대화 저장/복원 ✅ 대시보드 ✅ 랜딩 완성

---

### 📅 Day 3: 카카오 + 런칭 에이전트 + 배포

| 시간 | 작업 | 산출물 | 의존성 |
|------|------|--------|--------|
| **0-3h** | 카카오 웹훅 구현 | `/api/kakao/webhook`, 카카오 채널 연동 | Gemini |
| **3-5h** | 런칭 에이전트 프롬프트 최적화 | 연애봇, 블로그봇 시스템 프롬프트 튜닝 | 채팅 |
| **5-7h** | 블로그 AI 대필 — 전용 UI | 결과물 복사, 톤 선택, 키워드 입력 | 채팅 |
| **7-9h** | 에이전트 3-5개 추가 시딩 | 운세, 영어회화, 레시피 등 | DB |
| **9-11h** | SEO 최적화 | 메타 태그, OG 이미지, sitemap.xml, robots.txt | 전체 |
| **11-13h** | 에러 처리 + 엣지 케이스 | 404, 에러 바운더리, 토스트 알림 | 전체 |
| **13-15h** | 성능 최적화 | 이미지 최적화, 번들 분석, Suspense 경계 | 전체 |
| **15-17h** | E2E 테스트 (수동) + 버그 수정 | 전체 플로우 테스트 | 전체 |
| **17-19h** | Vercel 배포 + 도메인 + 환경변수 | 프로덕션 배포 | 전체 |
| **19-20h** | 모니터링 설정 + README 작성 | Vercel Analytics | 배포 |

**Day 3 체크포인트:** ✅ 카카오 연동 ✅ 에이전트 5개+ ✅ 배포 완료 ✅ 실사용 가능

---

## 8. 환경 변수

```env
# .env.local

# ---- Supabase ----
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # 서버 전용! 절대 클라이언트 노출 금지

# ---- Google Gemini ----
GEMINI_API_KEY=AIza...

# ---- 카카오 ----
KAKAO_CHANNEL_ID=...
KAKAO_REST_API_KEY=...
KAKAO_ADMIN_KEY=...                        # 카카오 관리자 키

# ---- 토스페이먼츠 (Phase 2) ----
# TOSS_CLIENT_KEY=...
# TOSS_SECRET_KEY=...

# ---- 앱 ----
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_SECRET_KEY=...                       # 에이전트 CRUD용 관리자 키
```

---

## 부록: 초기 시드 에이전트 데이터

### 에이전트 1: 연애 상담사 루나 🌙

```json
{
  "name": "연애 상담사 루나",
  "slug": "luna-dating",
  "tagline": "당신의 연애 고민, 루나에게 말해보세요",
  "category": "dating",
  "pricing_type": "freemium",
  "free_message_limit": 30,
  "temperature": 0.8,
  "welcome_message": "안녕! 나는 루나야 🌙 연애 고민이 있으면 편하게 말해줘. 오늘 어떤 이야기를 해볼까?",
  "suggested_prompts": [
    "썸 타는 사람한테 먼저 연락해도 될까?",
    "남자/여자친구가 답장을 안 읽어요",
    "고백할 타이밍은 언제가 좋을까?",
    "이별 후 연락이 왔어요"
  ],
  "system_prompt": "당신은 '루나'라는 이름의 따뜻하고 공감적인 연애 상담사입니다..."
}
```

### 에이전트 2: 블로그 작가 하늘 ✍️

```json
{
  "name": "블로그 작가 하늘",
  "slug": "haneul-blog",
  "tagline": "네이버 블로그 포스팅, AI가 대신 써드립니다",
  "category": "content",
  "pricing_type": "freemium",
  "free_message_limit": 10,
  "temperature": 0.6,
  "welcome_message": "안녕하세요! 블로그 작가 하늘이에요 ✍️ 어떤 주제로 글을 써드릴까요?",
  "suggested_prompts": [
    "강남역 맛집 후기 써줘",
    "피부 관리 꿀팁 포스팅",
    "소상공인 마케팅 블로그 글",
    "제주도 여행 후기 작성"
  ],
  "system_prompt": "당신은 '하늘'이라는 이름의 전문 블로그 작가입니다. 네이버 블로그 최적화에 특화되어 있습니다..."
}
```

---

## 핵심 설계 결정 & 근거

| 결정 | 근거 |
|------|------|
| **Supabase Realtime 대신 SSE 스트리밍** | 채팅은 단방향 스트리밍이면 충분. Realtime은 나중에 다수 유저 알림용으로 |
| **에이전트 CRUD는 admin key로만** | Clo가 API/DB로 직접 관리. 어드민 UI는 불필요 (Phase 2에서 고려) |
| **프롬프트 버전 관리 테이블** | 프롬프트 튜닝이 핵심 운영 업무. 롤백 가능해야 함 |
| **메시지에 tokens/latency 기록** | 비용 추적 + 성능 모니터링 필수. 나중에 모델 전환 판단 근거 |
| **비정규화 카운터 (agents.total_messages)** | 카탈로그에서 매번 COUNT 쿼리 방지. 트리거로 동기화 |
| **카카오는 비스트리밍** | 카카오 스킬 서버 5초 타임아웃 제한. 긴 응답은 분할 전송 |
| **무료 한도를 profiles에** | 간단한 카운터. 매일 리셋 (cron or 조회 시 확인) |
| **slug 기반 URL** | SEO + 공유 가능한 URL. `/agents/luna-dating` >> `/agents/uuid` |

---

> **이 문서는 구현 시작점입니다. 빌드하면서 필요에 따라 업데이트하세요.**
>
> — Clo 🤖
