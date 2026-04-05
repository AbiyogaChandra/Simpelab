
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import InventarisClient from './InventarisClient';
import { Suspense } from 'react';

export default async function DataInventarisPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventarisClient />
    </Suspense>
  );
}
