import { useWeb3React } from '@web3-react/core';
import { Skeleton } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { CalendarComponent } from '../components/calendar/calendar.component';

export default function CalendarPage() {
  const router = useRouter();
  const { account } = useWeb3React();

  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  return account ? (
    <CalendarComponent />
  ) : (
    <Skeleton active={true} loading={true} />
  );
}
