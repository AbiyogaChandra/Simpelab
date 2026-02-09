
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import InventarisClient from './InventarisClient';

export default async function DataInventarisPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <InventarisClient />;
}
