import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { notification } from 'antd';
import { atom, useAtom } from 'jotai';
import { useWeb3React } from '@web3-react/core';

import type { Contract } from 'web3-eth-contract/types';

import { CONTRACT_ADDRESS } from '../../config';
import abi from './abi.json';

const contractAtom = atom<Contract | null>(null);
const web3Atom = atom<Web3 | null>(null);
const ownerAtom = atom<boolean>(false);

export function useContract() {
  const { account, connector } = useWeb3React();

  const [contract, setContract] = useAtom(contractAtom);
  const [web3, setWeb3] = useAtom(web3Atom);
  const [isOwner, setOwner] = useAtom(ownerAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const initialize = useCallback(async () => {
    if (!loading && !contract && connector) {
      setLoading(true);
      try {
        const provider = await connector.getProvider();
        const _web3 = new Web3(provider);
        const _contract = new _web3.eth.Contract(abi as any, CONTRACT_ADDRESS);
        const _owner = await _contract.methods.owner().call();
        setWeb3(_web3);
        setContract(_contract);
        setOwner(_owner === account);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, account]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return { contract, isOwner, web3, loading, error };
}

export interface ContractQuery<T extends Record<string, any>> {
  data: T | null;
  loading: boolean;
  error: any | null;
  refetch: () => Promise<void>;
}

export function useContractQuery<T>(
  method: string,
  args: any[] = []
): ContractQuery<T> {
  const [contract] = useAtom(contractAtom);

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const query = useCallback(async () => {
    if (contract && !loading) {
      setLoading(true);
      try {
        const response = await contract.methods[method](...args).call();
        setData(response);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError(err);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

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

  return {
    data,
    loading: !data && loading,
    error,
    refetch: query,
  };
}

export function useContractMutation<T>(method: string) {
  const [contract] = useAtom(contractAtom);
  const [web3] = useAtom(web3Atom);

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
          const result = await tx
            .send({ from: account, gas })
            .on('transactionHash', (hash: string) => {
              notification.info({
                key: hash,
                message: 'Waiting for confirmation...',
                description: <pre>{hash}</pre>,
                placement: 'bottomRight',
                duration: 0,
              });
            });
          await web3.eth.getTransactionReceipt(result.transactionHash);
          setData(result);
          notification.close(result.transactionHash);
          notification.success({
            message: 'Success!',
            description: <pre>{result.transactionHash}</pre>,
            placement: 'bottomRight',
          });
        } catch (err: any) {
          notification.error({
            message: 'Error!',
            description: <pre>{err.message}</pre>,
            placement: 'bottomRight',
          });
          setError(err);
        }
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contract, web3]
  );

  return { mutation, data, loading, error };
}
