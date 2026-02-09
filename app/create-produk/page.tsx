
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import CreateProdukClient from './CreateProdukClient';

export default async function CreateProdukPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <CreateProdukClient />;
}
