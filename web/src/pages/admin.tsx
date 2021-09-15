import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useContract } from '../utils/contract';
import { AdminComponent } from '../components/admin/admin.component';
import { Skeleton } from 'antd';

export default function HomeComponent() {
  const router = useRouter();
  const { isOwner, loading } = useContract();

  useEffect(() => {
    if (!loading && !isOwner) {
      router.push('/');
    }
  }, [isOwner, loading, router]);

  return !loading && isOwner ? (
    <AdminComponent />
  ) : (
    <div className="p-4 m-12 bg-white">
      <Skeleton active={true} loading={true} />
    </div>
  );
}
