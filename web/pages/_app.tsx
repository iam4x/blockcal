import React from 'react';
import Web3 from 'web3';
import type { AppProps } from 'next/app';
import { Provider as JotaiProvider } from 'jotai';
import { Web3ReactProvider } from '@web3-react/core';

import '../styles/globals.css';

function getLibrary(provider: any) {
  return new Web3(provider);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <JotaiProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
    </JotaiProvider>
  );
}

export default MyApp;
