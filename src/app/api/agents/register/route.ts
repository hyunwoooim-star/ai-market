import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface AgentRegistration {
  walletAddress: string;
  registeredAt: string;
  network: string;
}

interface RegistrationStore {
  agents: AgentRegistration[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'agents.json');

async function readStore(): Promise<RegistrationStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { agents: [] };
  }
}

async function writeStore(store: RegistrationStore): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Basic Solana address validation (base58, 32-44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 }
      );
    }

    const store = await readStore();

    // Check if already registered
    const existing = store.agents.find(a => a.walletAddress === walletAddress);
    if (existing) {
      return NextResponse.json({
        message: 'Agent already registered',
        agent: existing,
      });
    }

    const newAgent: AgentRegistration = {
      walletAddress,
      registeredAt: new Date().toISOString(),
      network: 'devnet',
    };

    store.agents.push(newAgent);
    await writeStore(store);

    return NextResponse.json({
      message: 'Agent registered successfully',
      agent: newAgent,
    }, { status: 201 });
  } catch (err) {
    console.error('Agent registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({
      count: store.agents.length,
      agents: store.agents,
    });
  } catch (err) {
    console.error('Agent list error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
