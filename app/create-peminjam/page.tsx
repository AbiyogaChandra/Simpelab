import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import CreatePeminjamClient from './CreatePeminjamClient';

export default async function CreatePeminjamPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <CreatePeminjamClient />;
}
