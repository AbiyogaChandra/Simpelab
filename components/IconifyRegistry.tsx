'use client';

import { useEffect } from 'react';

export default function IconifyRegistry() {
    useEffect(() => {
        // Dynamic import to ensure it runs on client
        import('iconify-icon');
    }, []);

    return null;
}
