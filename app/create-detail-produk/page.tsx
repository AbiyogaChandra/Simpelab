
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import CreateDetailProdukClient from './CreateDetailProdukClient';

export default async function CreateDetailProdukPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <CreateDetailProdukClient />;
}
