import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Alert, Button } from 'antd';

import { CHAIN_ID } from '../config';

const injected = new InjectedConnector({ supportedChainIds: [CHAIN_ID] });

export default function HomeComponent() {
  const [loading, setLoading] = useState(false);
  const { activate, error, account, deactivate } = useWeb3React();

  const handleClick = () => {
    if (!loading && !account) {
      setLoading(true);
      activate(injected).finally(() => {
        setLoading(false);
      });
    } else if (!loading && account) {
      deactivate();
    }
  };

  return (
    <div className="m-12 bg-white p-4">
      <h1>{account ? 'Welcome' : 'Please connect with Metamask'}</h1>
      {error && (
        <Alert
          type="error"
          message={<pre>{JSON.stringify(error, null, 4)}</pre>}
        />
      )}
      {account && <pre>{account}</pre>}
      <Button type="default" loading={loading} onClick={handleClick}>
        {account ? 'Logout' : 'Connect'}
      </Button>
    </div>
  );
}
