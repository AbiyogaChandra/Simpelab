
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const session = await getCurrentSession();

    if (!session) {
        redirect('/api/auth/logout');
    }

    return <DashboardClient />;
}
