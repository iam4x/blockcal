import React from 'react';
import Link from 'next/link';
import Web3 from 'web3';
import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import { Provider as JotaiProvider } from 'jotai';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import type { AppProps } from 'next/app';

import { useContract } from '../utils/contract';

import '../styles/globals.css';
import 'antd/dist/antd.css';

function getLibrary(provider: any) {
  return new Web3(provider);
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOwner } = useContract();
  const { account } = useWeb3React();

  return (
    <Layout>
      <Layout.Header>
        <div className="logo"></div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[router.pathname]}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="/">
            <Link href="/" passHref={true}>
              <a href="/">Home</a>
            </Link>
          </Menu.Item>
          {account && (
            <Menu.Item key="/calendar">
              <Link href="/calendar" passHref={true}>
                <a href="/calendar">Calendar</a>
              </Link>
            </Menu.Item>
          )}
          {isOwner && (
            <Menu.Item key="/admin">
              <Link href="/admin" passHref={true}>
                <a href="/admin">Admin</a>
              </Link>
            </Menu.Item>
          )}
        </Menu>
      </Layout.Header>
      <Layout.Content
        style={{ padding: '0 50px', minHeight: 'calc(100vh - 50px - 20px)' }}
      >
        {children}
      </Layout.Content>
    </Layout>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <JotaiProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </Web3ReactProvider>
    </JotaiProvider>
  );
}

export default MyApp;
