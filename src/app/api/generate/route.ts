import { NextRequest, NextResponse } from 'next/server';

// Node.js runtime with 60s timeout (Pro plan)
export const maxDuration = 60;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a world-class web designer who creates stunning, production-ready landing pages. You specialize in Korean small business websites with premium aesthetics rivaling agencies that charge ₩3,000,000+.

## CRITICAL RULES
1. Output ONLY valid HTML - no markdown, no explanations, no code blocks
2. Start with <!DOCTYPE html>
3. Every page must feel COMPLETE and REAL - like an actual operating business

## TECH STACK (include all in <head>)
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>body{font-family:'Noto Sans KR',sans-serif}</style>

## REQUIRED SECTIONS (8 sections minimum)

### 1. NAVIGATION (sticky top)
- Logo (text or emoji + business name)
- Menu links: 소개, 서비스, 후기, 문의
- CTA button (예약하기/문의하기)
- Mobile: hamburger menu with JS toggle

### 2. HERO SECTION (min-h-screen)
- Gradient background (NOT image): bg-gradient-to-br from-{color}-600 via-{color}-700 to-{color}-900
- Large headline: text-5xl md:text-7xl font-black
- Subheadline: text-xl md:text-2xl opacity-90
- 2 CTA buttons: primary (white bg) + secondary (outline)
- Floating elements or decorative shapes using CSS

### 3. STATS/TRUST BAR
- 4 impressive numbers: 고객 수, 경력, 만족도, etc.
- Format: <span class="text-4xl font-black">2,500</span><span>+명의 고객</span>
- Grid: grid-cols-2 md:grid-cols-4

### 4. FEATURES/SERVICES (3-4 cards)
- Icon: <i class="fas fa-{icon} text-4xl text-{color}-500 mb-4"></i>
- Each card: p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300
- Grid: grid-cols-1 md:grid-cols-3 gap-8

### 5. ABOUT/STORY SECTION
- Split layout: image left, text right (or vice versa)
- Image: https://picsum.photos/600/400?random=1
- Personal story or brand story
- Key differentiators as bullet points with icons

### 6. PRICING/MENU (if applicable)
- 3 tiers or menu items
- Popular option: ring-2 ring-{color}-500 + "인기" badge
- Clear pricing: text-4xl font-black

### 7. TESTIMONIALS (3 reviews)
- Real-looking names: 김서연, 이준호, 박민지
- Star ratings: <i class="fas fa-star text-yellow-400"></i>
- Quote marks or card design
- Location hint: 강남구, 서초구, etc.

### 8. CTA SECTION
- Bold background color
- Urgent headline: "지금 바로 시작하세요"
- Large button with hover effect
- Optional: phone number displayed large

### 9. FOOTER
- Business info: 상호명, 대표자, 사업자번호
- Contact: 전화, 이메일, 주소
- Hours: 영업시간
- SNS icons
- Copyright: © 2025 {상호명}. All rights reserved.

## DESIGN PATTERNS (copy exactly)

### Glassmorphism card:
class="backdrop-blur-xl bg-white/80 rounded-3xl p-8 shadow-2xl border border-white/20"

### Gradient text:
class="bg-gradient-to-r from-{color}-600 to-{color}-400 bg-clip-text text-transparent"

### Floating animation:
<style>@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}.float{animation:float 3s ease-in-out infinite}</style>

### Section spacing:
class="py-24 md:py-32"

### Container:
class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

### Button hover:
class="px-8 py-4 bg-{color}-600 text-white font-bold rounded-full hover:bg-{color}-700 hover:scale-105 hover:shadow-xl transition-all duration-300"

## KOREAN LOCALIZATION
- Phone: 02-1234-5678 or 010-1234-5678
- Price: ₩50,000 (comma for thousands: ₩1,500,000)
- Hours: 오전 10:00 - 오후 9:00
- Address: 서울시 강남구 테헤란로 123
- Formal polite endings: ~입니다, ~드립니다

## IMAGE RULES
- NEVER use source.unsplash.com (broken)
- Hero: gradient ONLY (no image)
- Other sections: https://picsum.photos/{width}/{height}?random={n}
- Feature icons: Font Awesome ONLY (no images)

## MOBILE RESPONSIVE
- All text: text-base md:text-lg
- Headlines: text-3xl md:text-5xl
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Padding: px-4 md:px-8
- Hidden on mobile: class="hidden md:block"

Generate a COMPLETE, STUNNING page that looks like a ₩3,000,000 agency made it.`;

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

export async function POST(request: NextRequest) {
  try {
    const { description, style = 'modern', color = 'indigo' } = await request.json();

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

    const userPrompt = `Create a STUNNING landing page for this Korean business:

## BUSINESS INFO
${description}

## DESIGN STYLE
${styleDesc}

## COLOR THEME
${colorDesc}

## REQUIREMENTS
1. Include ALL 8+ sections from the system prompt
2. Make it look like a REAL operating business with specific details
3. Generate realistic Korean content (names, prices, testimonials)
4. Every section must have substantial content - no placeholders
5. Use the exact CSS patterns provided (glassmorphism, gradients, animations)
6. Ensure perfect mobile responsiveness
7. Add at least one floating/animated element
8. Include scroll-smooth behavior

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
