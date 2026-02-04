import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Credit packages: amount → credits mapping
const CREDIT_PACKAGES: Record<number, { credits: number; name: string }> = {
  5000: { credits: 500, name: 'Starter' },
  10000: { credits: 1100, name: 'Basic' },
  30000: { credits: 3500, name: 'Pro' },
  50000: { credits: 6000, name: 'Premium' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  // Determine locale for redirect
  const referer = request.headers.get('referer') || '';
  const localeMatch = referer.match(/\/(ko|en|ja|zh)\//);
  const locale = localeMatch ? localeMatch[1] : 'ko';
  const baseUrl = new URL(request.url).origin;

  // Validate params
  if (!paymentKey || !orderId || !amount) {
    const failUrl = `${baseUrl}/${locale}/checkout/fail?code=MISSING_PARAMS&message=필수 파라미터가 누락되었습니다`;
    return NextResponse.redirect(failUrl);
  }

  const amountNum = Number(amount);
  const pkg = CREDIT_PACKAGES[amountNum];

  if (!pkg) {
    const failUrl = `${baseUrl}/${locale}/checkout/fail?code=INVALID_AMOUNT&message=유효하지 않은 결제 금액입니다`;
    return NextResponse.redirect(failUrl);
  }

  try {
    // Confirm payment with TossPayments API
    const authHeader = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    const confirmRes = await fetch(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: amountNum,
      }),
    });

    const confirmData = await confirmRes.json();

    if (!confirmRes.ok) {
      console.error('TossPayments confirm failed:', confirmData);
      const failUrl = `${baseUrl}/${locale}/checkout/fail?code=${confirmData.code || 'CONFIRM_FAILED'}&message=${encodeURIComponent(confirmData.message || '결제 확인에 실패했습니다')}`;
      return NextResponse.redirect(failUrl);
    }

    // Payment confirmed! Now add credits.
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user ID from orderId or cookie
    // We'll get the user from the kakao_user cookie
    const kakaoUserCookie = request.cookies.get('kakao_user')?.value;
    let userId = 'anonymous';
    let userName = 'Anonymous';

    if (kakaoUserCookie) {
      try {
        const kakaoUser = JSON.parse(decodeURIComponent(kakaoUserCookie));
        userId = `kakao_${kakaoUser.id}`;
        userName = kakaoUser.nickname || 'User';
      } catch {
        // fallback
      }
    }

    // Record transaction in am_transactions
    const { error: txError } = await supabase.from('am_transactions').insert({
      from_id: 'toss_payments',
      to_id: userId,
      amount: pkg.credits,
      type: 'credit_purchase',
      note: JSON.stringify({
        paymentKey,
        orderId,
        amountKRW: amountNum,
        credits: pkg.credits,
        packageName: pkg.name,
        userName,
        confirmedAt: new Date().toISOString(),
      }),
    });

    if (txError) {
      console.error('Failed to record transaction:', txError);
      // Payment was confirmed but recording failed — still redirect to success
      // The credits can be reconciled manually
    }

    // Redirect to success page with credit info
    const successUrl = new URL(`${baseUrl}/${locale}/checkout/success`);
    successUrl.searchParams.set('orderId', orderId);
    successUrl.searchParams.set('amount', String(amountNum));
    successUrl.searchParams.set('paymentKey', paymentKey);
    successUrl.searchParams.set('credits', String(pkg.credits));

    return NextResponse.redirect(successUrl.toString());
  } catch (err) {
    console.error('Payment confirm error:', err);
    const failUrl = `${baseUrl}/${locale}/checkout/fail?code=SERVER_ERROR&message=${encodeURIComponent('서버 오류가 발생했습니다')}`;
    return NextResponse.redirect(failUrl);
  }
}
