import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import TaskBoard from '@/components/tasks/TaskBoard';

export default async function TasksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <TaskBoard />
      <Footer />
    </>
  );
}
