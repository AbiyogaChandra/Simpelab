
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import ProsesPeminjamanClient from './ProsesPeminjamanClient';

export default async function ProsesPeminjamanPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <ProsesPeminjamanClient />;
}
