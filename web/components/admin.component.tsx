import type { FormEvent } from 'react';
import React, { useEffect, useState, useCallback } from 'react';

import { useContractMutation, useContractQuery } from '../utils/contract';

export function AdminComponent() {
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [roomCount, setRoomCount] = useState('');

  const { data: rooms, refetch: refetchRooms } = useContractQuery(
    'getRooms',
    []
  );
  const { data: companies, refetch: refetchCompanies } = useContractQuery<
    Array<[string, string]>
  >('getCompanies', []);

  const { mutation: addCompanyMutation, loading: addCompanyLoading } =
    useContractMutation('addCompany');

  const { mutation: addRoomMutation, loading: addRoomLoading } =
    useContractMutation('addRooms');

  const handleAddCompany = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (companyName) {
        await addCompanyMutation(companyName);
        await refetchCompanies();
      }
    },
    [addCompanyMutation, companyName, refetchCompanies]
  );

  const handleAddRoom = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (companyId && parseInt(roomCount, 10) > 0) {
        await addRoomMutation(companyId, roomCount);
        await refetchRooms();
      }
    },
    [addRoomMutation, companyId, refetchRooms, roomCount]
  );

  useEffect(() => {
    if (companies?.length && !companyId) {
      setCompanyId(companies[0][0]);
    }
  }, [companies, companyId]);

  return (
    <div>
      <h2>Admin</h2>
      <pre>{JSON.stringify({ companies, rooms }, null, 4)}</pre>
      <form onSubmit={handleAddCompany}>
        <input
          type="text"
          value={companyName}
          disabled={addCompanyLoading}
          onChange={(event) => setCompanyName(event.target.value)}
        />
        <button type="submit" disabled={addCompanyLoading || !companyName}>
          Add company
        </button>
      </form>
      {companies?.length && (
        <form onSubmit={handleAddRoom}>
          <select
            disabled={addRoomLoading}
            onBlur={(event) => setCompanyId(event.target.value)}
          >
            {companies.map((company) => (
              <option key={company[0]} value={company[0]}>
                {company[1]}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={10}
            disabled={addRoomLoading}
            value={roomCount}
            onChange={(event) => setRoomCount(event.target.value)}
          />
          <button type="submit" disabled={addRoomLoading}>
            Add rooms
          </button>
        </form>
      )}
    </div>
  );
}
