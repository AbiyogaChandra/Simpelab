
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@lib/auth';
import AktivitasClient from './AktivitasClient';

export default async function AktivitasPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/api/auth/logout');
  }

  return <AktivitasClient />;
}
