
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import PeminjamanClient from './PeminjamanClient';

export default async function DataPeminjamanPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <PeminjamanClient />;
}
