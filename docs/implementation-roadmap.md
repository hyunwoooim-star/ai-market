# 에이전트마켓 AI 비서 구현 로드맵

작성일: 2026-02-06 03:10 KST
목표: **2/18 Hashed 제출**
남은 시간: **12일**

---

## 🎯 MVP 범위 (Hashed 데드라인)

### 반드시 포함 (Must-Have)
1. ✅ 웹사이트 30초 생성 (완료)
2. ✅ 무료 호스팅 (완료)
3. 🔄 네이버 블로그 자동 포스팅
4. 🔄 AI 전화번호 (Twilio)
5. 🔄 대시보드 UI

### 있으면 좋음 (Nice-to-Have)
- 인스타그램 연동 (Meta 심사 기간 불확실)
- 카카오 메시지 발송 (비즈메시지 계약 필요)

---

## 📅 12일 스프린트 계획

### Week 1: 인프라 + 핵심 기능 (D1-D7)

#### D1-D2 (2/6-7): OAuth 기반
```
[ ] 네이버 개발자 앱 등록
[ ] NextAuth.js 설정 (Naver OAuth)
[ ] 네이버 블로그 API 테스트
[ ] DB 스키마 (user_connections 테이블)
```

#### D3-D4 (2/8-9): 블로그 포스팅
```
[ ] 블로그 글 AI 생성 API
[ ] 네이버 블로그 발행 API 연동
[ ] "블로그 글 써줘" 대화형 UI
[ ] 예약 발행 기능
```

#### D5-D6 (2/10-11): AI 전화
```
[ ] Twilio 계정 설정
[ ] 한국 전화번호 발급 (02-XXXX)
[ ] 음성 인식 (Whisper) 연동
[ ] 음성 응답 (ElevenLabs TTS) 연동
[ ] 전화 시나리오 로직
```

#### D7 (2/12): 통합 테스트
```
[ ] OAuth 플로우 테스트
[ ] 블로그 포스팅 E2E 테스트
[ ] 전화 수신/응답 테스트
[ ] 버그 수정
```

### Week 2: 대시보드 + 런칭 (D8-D12)

#### D8-D9 (2/13-14): 대시보드
```
[ ] 대시보드 레이아웃
[ ] 연결된 서비스 현황 카드
[ ] 활동 로그 (포스팅/전화 기록)
[ ] 설정 페이지
```

#### D10 (2/15): 결제 + 플랜
```
[ ] 토스페이먼츠 연동 (테스트)
[ ] 플랜별 기능 제한 로직
[ ] 구독 관리 UI
```

#### D11 (2/16): 랜딩 페이지 리뉴얼
```
[ ] 새 포지셔닝 반영
[ ] 기능 소개 섹션
[ ] 데모 영상 삽입
[ ] 가격표 업데이트
```

#### D12 (2/17): 최종 준비
```
[ ] Hashed 지원서 완성
[ ] 데모 녹화
[ ] 버그 수정
[ ] 배포 최종 확인
```

#### D-Day (2/18): 제출
```
[ ] Hashed 지원서 제출
[ ] 라이브 URL 확인
[ ] 모니터링 설정
```

---

## 🛠️ 기술 구현 상세

### 1. 네이버 블로그 연동

**API 엔드포인트:**
```
POST https://openapi.naver.com/blog/writePost.json
Authorization: Bearer {access_token}
```

**필요 권한:**
- `blog` - 블로그 글쓰기

**코드 구조:**
```
/src/app/api/blog/
├── connect/route.ts    # OAuth 시작
├── callback/route.ts   # OAuth 콜백
├── post/route.ts       # 글 발행
└── schedule/route.ts   # 예약 발행

/src/lib/
├── naver-auth.ts       # 네이버 OAuth
└── naver-blog.ts       # 블로그 API 래퍼
```

### 2. AI 전화 (Twilio)

**아키텍처:**
```
전화 수신
    ↓
Twilio Webhook → /api/phone/incoming
    ↓
Whisper (음성→텍스트)
    ↓
Claude API (대화 생성)
    ↓
ElevenLabs TTS (텍스트→음성)
    ↓
Twilio (음성 응답)
```

**코드 구조:**
```
/src/app/api/phone/
├── incoming/route.ts   # 전화 수신 처리
├── gather/route.ts     # 음성 입력 처리
└── status/route.ts     # 통화 상태 웹훅

/src/lib/
├── twilio.ts           # Twilio 래퍼
├── whisper.ts          # 음성 인식
└── tts.ts              # 음성 합성
```

### 3. 대시보드

**페이지 구조:**
```
/dashboard
├── page.tsx            # 메인 대시보드
├── connections/        # 연결 관리
│   └── page.tsx
├── blog/               # 블로그 관리
│   ├── page.tsx        # 글 목록
│   └── new/page.tsx    # 새 글 작성
├── phone/              # 전화 관리
│   └── page.tsx        # 통화 기록
└── settings/           # 설정
    └── page.tsx
```

---

## 💰 비용 예측 (MVP 기준)

| 항목 | 월 비용 |
|-----|--------|
| Vercel Pro | $20 |
| Supabase | $0 (무료) |
| Claude API | ~$50 (예상) |
| Twilio (번호 10개) | ~$10 |
| ElevenLabs | ~$22 |
| **합계** | ~$102/월 |

**손익분기점:**
- 비즈니스 플랜 ₩59,900 = ~$45
- 3명 구독 시 손익분기

---

## 📁 DB 스키마 추가

```sql
-- user_connections: OAuth 연결 정보
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  provider TEXT NOT NULL, -- 'naver', 'kakao', 'instagram'
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- blog_posts: 블로그 글
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'naver', 'tistory'
  platform_post_id TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- phone_numbers: AI 전화번호
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  twilio_number TEXT NOT NULL,
  twilio_sid TEXT NOT NULL,
  business_name TEXT,
  greeting_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- phone_calls: 통화 기록
CREATE TABLE phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id UUID REFERENCES phone_numbers,
  twilio_call_sid TEXT,
  caller_number TEXT,
  duration_seconds INT,
  transcript TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 오늘 밤 (2/6) 코딩 계획

**목표: dev 브랜치에 OAuth 기반 구축**

```
1. [ ] dev 브랜치 생성
2. [ ] NextAuth.js 설치 및 설정
3. [ ] 네이버 OAuth provider 추가
4. [ ] user_connections 테이블 생성
5. [ ] /dashboard 기본 레이아웃
6. [ ] "네이버 연결" 버튼 UI
```

**완료 시 결과물:**
- dev 브랜치에 OAuth 기반 코드
- 네이버 로그인 버튼 작동
- 대시보드 기본 UI

---

## ✅ 체크리스트

### Han 필요 작업 (내일 아침)
- [ ] 네이버 개발자 앱 등록 (Han 계정)
- [ ] Twilio 계정 생성 (카드 필요)
- [ ] 리서치 보고서 검토 + 피드백

### Clo 진행 (오늘 밤)
- [x] 경쟁사 분석
- [x] 구현 로드맵
- [ ] dev 브랜치 코딩 시작
- [ ] 7시까지 보고

---

*작성 완료: 2026-02-06 03:15 KST*
