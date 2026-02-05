import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Extract user ID from orderId - format: amcredit_userId_timestamp_random
    const orderIdParts = orderId.split('_');
    let targetUserId: string | null = null;

    // Try to extract user ID from order ID pattern
    if (orderIdParts.length >= 2) {
      targetUserId = orderIdParts[1];
    }

    // If not found in orderId, try cookies as fallback
    if (!targetUserId) {
      const kakaoUserCookie = request.cookies.get('kakao_user')?.value;
      if (kakaoUserCookie) {
        try {
          const kakaoUser = JSON.parse(decodeURIComponent(kakaoUserCookie));
          targetUserId = `kakao_${kakaoUser.id}`;
        } catch {
          // fallback failed
        }
      }
    }

    if (!targetUserId) {
      console.error('Could not determine user ID from orderId or cookies');
      const failUrl = `${baseUrl}/${locale}/checkout/fail?code=INVALID_USER&message=${encodeURIComponent('사용자를 식별할 수 없습니다')}`;
      return NextResponse.redirect(failUrl);
    }

    // Add credits using our atomic function
    const { error: creditsError } = await supabase.rpc('add_user_credits', {
      target_user_id: targetUserId,
      credit_amount: pkg.credits,
      transaction_type: 'charge',
      payment_key_val: paymentKey,
      order_id_val: orderId,
      description_val: `TossPayments ${pkg.name} Package (₩${amountNum.toLocaleString()})`,
      metadata_val: {
        paymentKey,
        orderId,
        amountKRW: amountNum,
        credits: pkg.credits,
        packageName: pkg.name,
        confirmedAt: new Date().toISOString(),
        confirmIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    if (creditsError) {
      console.error('Failed to add credits:', creditsError);
      const failUrl = `${baseUrl}/${locale}/checkout/fail?code=CREDIT_ERROR&message=${encodeURIComponent('크레딧 추가 중 오류가 발생했습니다')}`;
      return NextResponse.redirect(failUrl);
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
