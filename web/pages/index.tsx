import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

import { CHAIN_ID } from '../config';
import { AdminComponent } from '../components/admin.component';
import { useContract } from '../utils/contract';

const injected = new InjectedConnector({ supportedChainIds: [CHAIN_ID] });

export default function HomeComponent() {
  const { activate, error, account, deactivate } = useWeb3React();
  const { owner } = useContract();

  const handleClick = () => {
    return account ? deactivate() : activate(injected);
  };

  return (
    <div>
      <h1>Hello world</h1>
      {error && <pre>{JSON.stringify(error, null, 4)}</pre>}
      {account && <pre>{account}</pre>}
      <button type="button" onClick={handleClick}>
        {account ? 'Disconnect' : 'Connect'}
      </button>
      {account && owner && account === owner && <AdminComponent />}
    </div>
  );
}
