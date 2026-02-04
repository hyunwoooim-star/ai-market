import { redirect } from 'next/navigation';

// Individual agent pages redirect to spectate for now
export default function AgentDetailPage() {
  redirect('/spectate');
}
