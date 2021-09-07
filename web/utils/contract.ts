import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';

import type { Contract } from 'web3-eth-contract/types';

import { CONTRACT_ADDRESS } from '../config';
import abi from './abi.json';

export function useContract() {
  const { connector } = useWeb3React();

  const [contract, setContract] = useState<Contract | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const initialize = useCallback(async () => {
    if (connector) {
      const provider = await connector.getProvider();
      const _web3 = new Web3(provider);
      const _contract = new _web3.eth.Contract(abi as any, CONTRACT_ADDRESS);
      setWeb3(_web3);
      setContract(_contract);
    }
  }, [connector]);

  const fetchOwner = useCallback(async () => {
    if (contract) {
      const _owner = await contract.methods.owner().call();
      setOwner(_owner);
    }
    return null;
  }, [contract]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  return { contract, owner, web3 };
}

export function useContractQuery<T>(method: string, args: any[]) {
  const { contract } = useContract();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const query = useCallback(async () => {
    if (contract && !loading) {
      setLoading(true);

      try {
        const _data = await contract.methods[method](...args).call();
        setData(_data);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    return null;
  }, [contract, method, args, loading, setLoading]);

  useEffect(() => {
    let interval: any;
    query().finally(() => {
      interval = setInterval(() => query(), 3000);
    });
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [query]);

  return { data, loading, error, refetch: query };
}

export function useContractMutation<T>(method: string) {
  const { contract, web3 } = useContract();
  const { account } = useWeb3React();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const mutation = useCallback(
    async (...args: any[]) => {
      if (contract && web3 && !loading) {
        setLoading(true);
        try {
          const tx = contract.methods[method](...args);
          const gas = await tx.estimateGas({ from: account });
          const result = await tx.send({ from: account, gas });
          await web3.eth.getTransactionReceipt(result.transactionHash);
          setData(result);
        } catch (err) {
          setError(err);
        }
        setLoading(false);
      }
    },
    [account, contract, loading, method, web3]
  );

  return { mutation, data, loading, error };
}
