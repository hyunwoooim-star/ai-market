import { NextRequest, NextResponse } from 'next/server';
import { runEpochWithDiaries, getNextEpochNumber } from '@/lib/economy-engine';
import { generateSocialPosts } from '@/lib/social-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 min for epoch + diary + social

const EPOCH_SECRET = process.env.ECONOMY_EPOCH_SECRET!;
const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${EPOCH_SECRET}`) return true;
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true;
  return false;
}

/**
 * Unified cron handler: Epoch → Diary → Social posts
 * Triggered by Vercel Cron every 30 minutes or manually via GET/POST.
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Run epoch with diary generation (awaited, not fire-and-forget)
    const epochNumber = await getNextEpochNumber();
    console.log(`[Cron] Starting epoch ${epochNumber}...`);

    const epochResult = await runEpochWithDiaries(epochNumber);
    console.log(`[Cron] Epoch ${epochNumber} complete. ${epochResult.transactions.length} transactions.`);

    // 2. Generate social posts based on epoch results
    let socialResult = { generated: 0, errors: [] as string[] };
    try {
      socialResult = await generateSocialPosts();
      console.log(`[Cron] Social posts generated: ${socialResult.generated}`);
    } catch (err) {
      console.error('[Cron] Social post generation failed:', err);
      socialResult.errors.push(err instanceof Error ? err.message : 'Unknown error');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      epoch: epochResult.epoch,
      event: epochResult.events,
      transactions: epochResult.transactions.length,
      bankruptcies: epochResult.bankruptcies,
      socialPosts: socialResult.generated,
      errors: socialResult.errors,
      durationSeconds: duration,
    });
  } catch (err) {
    console.error('[Cron] Epoch cycle failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Epoch cycle failed' },
      { status: 500 },
    );
  }
}
