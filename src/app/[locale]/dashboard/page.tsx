import { redirect } from 'next/navigation';

// Dashboard is not yet implemented — redirect to spectate
export default function DashboardPage() {
  redirect('/spectate');
}
