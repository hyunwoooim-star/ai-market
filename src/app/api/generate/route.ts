import { NextRequest, NextResponse } from 'next/server';

// Node.js runtime with 60s timeout (Pro plan)
export const maxDuration = 60;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an elite web designer at a $500/hour design agency (like Framer experts or Webflow specialists). You create STUNNING, award-worthy landing pages for Korean small businesses that look like they cost ₩5,000,000+.

## CRITICAL RULES
1. Output ONLY valid HTML - no markdown, no explanations, no code blocks
2. Start with <!DOCTYPE html>
3. Every page must feel PREMIUM and COMPLETE - like an actual thriving business
4. Every element must have purpose - no filler content

## TECH STACK (include ALL in <head>)
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script>document.addEventListener('DOMContentLoaded',()=>AOS.init({duration:800,once:true,offset:100}))</script>

## REQUIRED ANIMATIONS (use data-aos on sections)
- data-aos="fade-up" for most sections
- data-aos="fade-right" / data-aos="fade-left" for split layouts
- data-aos="zoom-in" for cards with data-aos-delay="100/200/300" for stagger
- data-aos="flip-up" for stats/numbers

## REQUIRED SECTIONS (9 sections minimum)

### 1. NAVIGATION (sticky glass navbar)
<nav class="fixed w-full z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
- Logo: emoji + 상호명 in font-black
- Links: 소개, 서비스/메뉴, 후기, 오시는 길
- CTA: rounded-full bg-{color}-600 text-white px-6 py-2
- Mobile: hamburger with slide-in menu (include JS)

### 2. HERO (min-h-screen, the MONEY shot)
STRUCTURE:
<section class="min-h-screen relative overflow-hidden">
  <!-- Animated gradient background -->
  <div class="absolute inset-0 bg-gradient-to-br from-{color}-600 via-{color}-700 to-{color}-900">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-30"></div>
  </div>
  <!-- Floating shapes -->
  <div class="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl float"></div>
  <div class="absolute bottom-20 right-10 w-96 h-96 bg-{color}-400/20 rounded-full blur-3xl float-delayed"></div>
  <!-- Content -->
  <div class="relative z-10 flex items-center justify-center min-h-screen">
    <div class="text-center text-white px-4">
      <p class="text-lg md:text-xl mb-4 tracking-widest uppercase opacity-80" data-aos="fade-down">Welcome to</p>
      <h1 class="text-5xl md:text-8xl font-black mb-6 leading-tight" data-aos="fade-up">
        상호명<span class="text-{color}-300">.</span>
      </h1>
      <p class="text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-90" data-aos="fade-up" data-aos-delay="100">
        감성적이고 매력적인 한 줄 소개
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
        <a href="#contact" class="px-10 py-4 bg-white text-{color}-700 font-bold rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-300">
          예약하기 →
        </a>
        <a href="#menu" class="px-10 py-4 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300">
          메뉴 보기
        </a>
      </div>
    </div>
  </div>
  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <i class="fas fa-chevron-down text-white/50 text-2xl"></i>
  </div>
</section>

### 3. TRUST BAR (social proof strip)
<section class="py-16 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div data-aos="flip-up">
        <div class="text-4xl md:text-5xl font-black text-{color}-600">2,500+</div>
        <div class="text-gray-600 mt-2">누적 고객</div>
      </div>
      <!-- 3 more stats -->
    </div>
  </div>
</section>

### 4. FEATURES/SERVICES (bento grid style)
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4">
    <div class="text-center mb-16">
      <span class="text-{color}-600 font-semibold tracking-widest uppercase">Services</span>
      <h2 class="text-4xl md:text-5xl font-black mt-4">서비스 소개</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Cards with staggered aos-delay -->
      <div class="group p-8 bg-gray-50 rounded-3xl hover:bg-{color}-600 hover:text-white transition-all duration-500 cursor-pointer" data-aos="zoom-in" data-aos-delay="100">
        <div class="w-16 h-16 bg-{color}-100 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 transition-all">
          <i class="fas fa-icon text-2xl text-{color}-600 group-hover:text-white transition-all"></i>
        </div>
        <h3 class="text-2xl font-bold mb-4">서비스명</h3>
        <p class="opacity-80">상세 설명</p>
      </div>
    </div>
  </div>
</section>

### 5. ABOUT/STORY (split layout with parallax feel)
<section class="py-24 bg-white overflow-hidden">
  <div class="max-w-7xl mx-auto px-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div data-aos="fade-right">
        <img src="https://picsum.photos/600/500?random=1" class="rounded-3xl shadow-2xl w-full">
      </div>
      <div data-aos="fade-left">
        <span class="text-{color}-600 font-semibold tracking-widest uppercase">Our Story</span>
        <h2 class="text-4xl md:text-5xl font-black mt-4 mb-6">제목</h2>
        <p class="text-gray-600 text-lg leading-relaxed mb-8">스토리 본문</p>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-{color}-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-check text-{color}-600"></i>
            </div>
            <span class="font-medium">특징 1</span>
          </div>
          <!-- more features -->
        </div>
      </div>
    </div>
  </div>
</section>

### 6. MENU/PRICING (elegant cards)
<section class="py-24 bg-gray-50">
  - Section header with label + title
  - 3 pricing cards, middle one "인기" with ring-4 ring-{color}-500 and scale-105
  - Each card: white bg, rounded-3xl, shadow-xl, hover:shadow-2xl
  - Price: text-5xl font-black

### 7. TESTIMONIALS (carousel-style cards)
<section class="py-24 bg-white">
  - Large quote icon at top
  - Grid of 3 review cards
  - Each: photo (picsum), name, stars, quote
  - Subtle shadow-lg, rounded-2xl

### 8. LOCATION/CONTACT (map + info)
<section class="py-24 bg-gray-900 text-white">
  - Split: left = info (address, hours, phone), right = map embed or image
  - Or: contact form with dark glassmorphism

### 9. FINAL CTA (conversion focused)
<section class="py-32 bg-gradient-to-r from-{color}-600 to-{color}-700 text-white text-center">
  <h2 class="text-4xl md:text-6xl font-black mb-6" data-aos="fade-up">지금 바로 방문하세요</h2>
  <p class="text-xl mb-10 opacity-90" data-aos="fade-up" data-aos-delay="100">특별한 경험이 기다리고 있습니다</p>
  <a href="tel:02-1234-5678" class="inline-block px-12 py-5 bg-white text-{color}-700 font-bold text-xl rounded-full hover:scale-105 hover:shadow-2xl transition-all" data-aos="fade-up" data-aos-delay="200">
    📞 02-1234-5678
  </a>
</section>

### 10. FOOTER (clean, informative)
<footer class="py-16 bg-gray-950 text-gray-400">
  - Grid: 로고/소개, 메뉴, 영업시간, SNS
  - Copyright at bottom
  - 사업자번호, 대표자명

## PREMIUM CSS (add to <style>)
<style>
body{font-family:'Noto Sans KR',sans-serif;scroll-behavior:smooth}
.float{animation:float 6s ease-in-out infinite}
.float-delayed{animation:float 6s ease-in-out infinite;animation-delay:2s}
@keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(3deg)}}
.gradient-text{background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.glass{backdrop-filter:blur(20px);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)}
.text-shadow{text-shadow:0 4px 30px rgba(0,0,0,0.3)}
</style>

## KOREAN LOCALIZATION
- Phone: 02-1234-5678 or 010-1234-5678
- Price: ₩15,000 format (always include ₩)
- Hours: 오전 10:00 - 오후 10:00 (연중무휴)
- Address format: 서울시 강남구 테헤란로 123 OO빌딩 2층
- Polite endings: ~입니다, ~드립니다, ~하세요

## IMAGE RULES
- Hero: gradient + floating shapes ONLY (no images)
- Sections: https://picsum.photos/{w}/{h}?random={n}
- Icons: Font Awesome 6 only

## MOBILE RESPONSIVE (essential)
- All containers: px-4 sm:px-6 lg:px-8
- Text scale: text-3xl md:text-5xl
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Nav: hamburger menu JS required
- Touch targets: min py-3 px-6

## FINAL CHECKLIST
✓ AOS scroll animations on every section
✓ Sticky glass navbar with mobile menu
✓ Hero with floating shapes and gradient
✓ Stats with flip-up animation
✓ Cards with staggered zoom-in
✓ Split layouts with fade-left/right
✓ Final CTA with phone number
✓ Smooth scroll behavior
✓ All interactive elements have hover states

Generate a BREATHTAKING page that wins design awards.`;

const STYLE_PROMPTS: Record<string, string> = {
  modern: 'MODERN LUXURY: Glassmorphism cards, gradient backgrounds, floating animations, large bold typography (font-black), generous whitespace (py-32), subtle shadows, smooth hover transitions. Think Apple/Stripe aesthetic.',
  minimal: 'MINIMAL ELEGANCE: White/neutral backgrounds, single accent color, clean lines, typography-focused, lots of breathing room, subtle borders instead of shadows. Think Notion/Linear aesthetic.',
  vivid: 'VIVID & BOLD: Strong saturated colors, dynamic gradients, animated elements, bold typography, energetic feel, hover effects that pop. Think Vercel/Figma aesthetic.',
  warm: 'WARM & FRIENDLY: Soft pastel gradients, rounded corners (rounded-3xl), friendly icons, approachable typography, cozy color palette. Think Airbnb/Duolingo aesthetic.',
};

const COLOR_PROMPTS: Record<string, string> = {
  indigo: 'Use indigo as primary: indigo-500, indigo-600, indigo-700. Accent with violet-400. Gradients: from-indigo-600 via-indigo-700 to-purple-800. Professional and trustworthy.',
  rose: 'Use rose as primary: rose-500, rose-600, pink-500. Accent with rose-300. Gradients: from-rose-500 via-pink-600 to-rose-700. Elegant and sophisticated.',
  emerald: 'Use emerald as primary: emerald-500, emerald-600, teal-500. Accent with emerald-300. Gradients: from-emerald-500 via-teal-600 to-emerald-800. Fresh and natural.',
  amber: 'Use amber as primary: amber-500, orange-500, yellow-500. Accent with amber-300. Gradients: from-amber-500 via-orange-500 to-red-500. Warm and energetic.',
  slate: 'Use slate as primary: slate-800, slate-700, gray-900. Accent with slate-400. Gradients: from-slate-800 via-slate-900 to-black. Premium and sophisticated.',
};

// 업종별 특화 프롬프트
const INDUSTRY_PROMPTS: Record<string, string> = {
  cafe: `## CAFE/COFFEE SHOP SPECIFIC
MUST INCLUDE:
- 시그니처 메뉴 3-5개 (아메리카노 ₩4,500, 라떼 ₩5,500, 시그니처 음료 ₩7,000)
- 디저트 메뉴 (케이크, 마카롱, 크로플)
- 인테리어 강조: 감성 카페, 넓은 좌석, 콘센트 완비
- 영업시간: 오전 8:00 - 오후 10:00
- WiFi, 주차, 펫 프렌들리 표시
- 인스타그램 해시태그 힌트
- 포토존 언급
TESTIMONIALS EXAMPLE:
"커피도 맛있지만 인테리어가 정말 예뻐서 자주 와요. 노트북 작업하기도 좋아요!" - 김서연, 카페 단골
COLOR SUGGESTION: amber (warm), emerald (natural), rose (romantic)`,

  restaurant: `## RESTAURANT SPECIFIC  
MUST INCLUDE:
- 대표 메뉴 5-7개 with prices (₩12,000 ~ ₩35,000 range)
- 코스 메뉴 있다면 표시 (런치 코스 ₩25,000, 디너 코스 ₩45,000)
- 예약 필수/가능 여부
- 단체석/룸 안내
- 주차 정보
- 영업시간: 오전 11:30 - 오후 10:00 (브레이크타임 15:00-17:00)
- 라스트오더 시간
MUST HAVE SECTIONS:
- 메뉴판 섹션 (깔끔한 카드 그리드)
- 매장 소개 (분위기, 콘셉트)
- 오시는 길 (지도 or 주소)
TESTIMONIALS EXAMPLE:
"특별한 날 항상 여기 와요. 맛도 분위기도 최고입니다!" - 이준호, 방문 고객`,

  salon: `## HAIR SALON / BEAUTY SPECIFIC
MUST INCLUDE:
- 서비스 메뉴: 커트 ₩25,000, 펌 ₩80,000~, 염색 ₩70,000~, 클리닉 ₩30,000~
- 원장/디자이너 프로필 (경력, 전문 분야)
- Before/After 암시 (텍스트로)
- 예약 시스템 강조 (카카오톡, 전화)
- 주차 정보
- 영업시간: 오전 10:00 - 오후 8:00 (일요일 휴무)
- 첫 방문 할인 또는 이벤트
MUST HAVE SECTIONS:
- 원장 소개 with 경력
- 서비스 메뉴 & 가격표
- 스타일 갤러리 암시
- 예약하기 CTA
TESTIMONIALS EXAMPLE:
"항상 원하는 스타일로 만들어주셔서 3년째 다니고 있어요!" - 박민지, 단골 고객
COLOR SUGGESTION: rose (elegant), slate (premium), indigo (professional)`,

  fitness: `## GYM / FITNESS SPECIFIC
MUST INCLUDE:
- 프로그램: PT ₩70,000/회, 그룹 수업, 필라테스/요가
- 시설: 최신 기구, 샤워실, 락커
- 트레이너 프로필 (자격증, 전문 분야)
- 회원권: 1개월 ₩150,000, 3개월 ₩400,000, 12개월 ₩1,200,000
- 무료 체험 CTA
- 운영시간: 06:00 - 24:00 (연중무휴)
- 주차 정보
MUST HAVE SECTIONS:
- 시설 소개
- 프로그램 안내
- 트레이너 소개
- 가격표
- 무료 체험 신청
COLOR SUGGESTION: emerald (energy), amber (power), indigo (trust)`,

  clinic: `## CLINIC / MEDICAL SPECIFIC
MUST INCLUDE:
- 진료 과목 (피부과, 성형외과, 치과, 한의원 등)
- 대표 원장 프로필 (학력, 경력, 자격)
- 진료 시간표
- 예약 전화번호 크게
- 주차 안내
- 위치 (지하철역에서 도보 X분)
MUST HAVE SECTIONS:
- 원장 인사말
- 진료 안내
- 의료진 소개  
- 오시는 길
- 진료 예약 CTA
TONE: Professional, trustworthy, warm
COLOR SUGGESTION: indigo (trust), emerald (health), slate (premium)`,

  shop: `## RETAIL SHOP SPECIFIC
MUST INCLUDE:
- 대표 상품 카테고리
- 가격대 범위
- 영업시간, 휴무일
- 온라인 구매 가능 여부
- 주차/배송 정보
- 교환/환불 정책 암시
MUST HAVE SECTIONS:
- 상품 카테고리
- 베스트셀러
- 매장 소개
- 오시는 길
COLOR SUGGESTION: Based on brand identity`,

  default: '', // 업종 미지정 시 빈 문자열
};

export async function POST(request: NextRequest) {
  try {
    const { description, style = 'modern', color = 'indigo', industry = 'default' } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: '비즈니스 설명을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: '설명은 2000자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 설정 오류입니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.modern;
    const colorDesc = COLOR_PROMPTS[color] || COLOR_PROMPTS.indigo;
    const industryDesc = INDUSTRY_PROMPTS[industry] || INDUSTRY_PROMPTS.default;

    const userPrompt = `Create a BREATHTAKING, AWARD-WORTHY landing page for this Korean business:

## BUSINESS INFO
${description}

## DESIGN STYLE
${styleDesc}

## COLOR THEME
${colorDesc}

${industryDesc ? `## INDUSTRY-SPECIFIC REQUIREMENTS\n${industryDesc}\n` : ''}
## CRITICAL REQUIREMENTS
1. Include ALL 9+ sections from the system prompt with AOS animations
2. Every section must use data-aos attributes (fade-up, zoom-in, flip-up, etc.)
3. Hero must have floating animated shapes + gradient background
4. Cards must have staggered data-aos-delay (100, 200, 300)
5. Generate REALISTIC Korean content - real prices, real testimonials with names
6. Include sticky glass navbar with mobile hamburger menu (with JS)
7. Final CTA must have large clickable phone number
8. Footer must include 사업자번호, 대표자명, 주소

## PREMIUM CHECKLIST (MUST DO ALL)
✓ Smooth scroll behavior (scroll-smooth on html)
✓ AOS library initialized
✓ At least 2 floating shapes in hero
✓ Glass morphism navbar
✓ Staggered card animations
✓ Split layout sections with fade-left/right
✓ Stats with flip-up animation
✓ Every button has hover:scale-105 + transition

OUTPUT: Complete HTML only, starting with <!DOCTYPE html>`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: `AI 생성 실패: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';

    // Clean up any code block markers
    html = html.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Validate it looks like HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<body')) {
      return NextResponse.json(
        { error: 'AI가 올바른 HTML을 생성하지 못했습니다. 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: `서버 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
