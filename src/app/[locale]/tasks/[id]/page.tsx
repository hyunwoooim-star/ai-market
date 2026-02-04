import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import TaskDetail from '@/components/tasks/TaskDetail';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <TaskDetail taskId={id} />
      <Footer />
    </>
  );
}
