import React from 'react';
import { partition, times } from 'lodash';
import { Alert, Modal, Skeleton, Tag } from 'antd';
import { useWeb3React } from '@web3-react/core';

import { useContractMutation, useContractQuery } from '../../utils/contract';

import type { ContractQuery } from '../../utils/contract';
import type { BookedSlot, Company, Employee, Room } from '../../types';

const slots = times(24, (i) => (i + 1).toString());

export function CalendarComponent() {
  const { account } = useWeb3React();

  const rooms = useContractQuery<Room[]>('getRooms');
  const companies = useContractQuery<Company[]>('getCompanies');
  const employees = useContractQuery<Employee[]>('getEmployees');
  const bookedSlots = useContractQuery<BookedSlot[]>('getBookedSlots');

  const isLoading =
    typeof account !== 'string' ||
    companies.loading ||
    employees.loading ||
    rooms.loading ||
    bookedSlots.loading;

  const canBook = account && employees.data?.some((e) => e.addr === account);
  const roomsWithCompany = (rooms.data || []).map((room) => {
    const company = companies.data?.find((c) => c.id === room.companyId);
    return { room, company };
  });

  return (
    <div className="w-full p-4 mt-12 bg-white">
      <h1 className="mb-4 text-xl font-semibold">Calendar</h1>
      <Skeleton active={true} loading={isLoading}>
        {!isLoading && !canBook ? (
          <Alert
            type="warning"
            className="mb-3"
            message="You are not connected with an employee account, please switch account in Metamask."
          />
        ) : (
          <div className="flex flex-wrap border border-t-0 border-l-0 border-black">
            {slots.map((slotId) => (
              <CalendarSlotComponent
                key={slotId}
                slotId={slotId}
                account={account}
                roomsWithCompany={roomsWithCompany}
                bookedSlots={bookedSlots}
              />
            ))}
          </div>
        )}
      </Skeleton>
    </div>
  );
}

function CalendarSlotComponent({
  slotId,
  account,
  roomsWithCompany,
  bookedSlots,
}: {
  slotId: string;
  account?: string | null;
  roomsWithCompany: Array<{ room: Room; company?: Company }>;
  bookedSlots: ContractQuery<BookedSlot[]>;
}) {
  const { mutation: bookSlotMutation } = useContractMutation('bookSlot');
  const { mutation: unbookSlotMutation } = useContractMutation('unbookSlot');

  const [booked, free] = partition(roomsWithCompany, ({ room }) =>
    bookedSlots.data?.some(
      (bookedSlot) =>
        bookedSlot.slotId === slotId && bookedSlot.roomId === room.id
    )
  );

  const slotStart = parseInt(slotId, 10) - 1;
  const slotEnd = slotStart + 1;

  const formattedStart = `${slotStart < 10 ? `0${slotStart}` : slotStart}:00`;
  const formattedEnd = `${slotEnd < 10 ? `0${slotEnd}` : slotEnd}:00`;

  const slotRange = `${formattedStart} - ${formattedEnd}`;

  const handleBookSlot = (roomId: string) => {
    Modal.confirm({
      title: 'Are you sure to book this room?',
      content: (
        <ul>
          <li>{slotRange}</li>
          <li>Room {roomId}</li>
        </ul>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        await bookSlotMutation(roomId, slotId);
        await bookedSlots.refetch();
      },
    });
  };

  const handleUnbookSlot = (roomId: string) => {
    Modal.confirm({
      title: 'Are you sure to unbook this room?',
      content: (
        <ul>
          <li>{slotRange}</li>
          <li>Room {roomId}</li>
        </ul>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        await unbookSlotMutation(roomId, slotId);
        await bookedSlots.refetch();
      },
    });
  };

  return (
    <div className="w-1/4 p-2 border border-b-0 border-r-0 border-black border-solid">
      <div>
        <h2 className="text-lg font-semibold">{slotRange}</h2>
      </div>
      {booked.length > 0 && (
        <div>
          <h2 className="font-semibold">Booked rooms</h2>
          <div className="flex flex-wrap w-full">
            {booked.map(({ room, company }) => {
              const canUnbook = bookedSlots.data?.some(
                (bookedSlot) =>
                  bookedSlot.slotId === slotId &&
                  bookedSlot.roomId === room.id &&
                  bookedSlot.bookedBy === account
              );
              return (
                <div key={room.id} className="mb-1">
                  <Tag
                    color="red"
                    className={
                      canUnbook ? 'cursor-pointer' : 'cursor-not-allowed'
                    }
                    onClick={
                      canUnbook ? () => handleUnbookSlot(room.id) : undefined
                    }
                  >
                    {company?.name?.[0].toUpperCase() || '?'}
                    {room.id}
                  </Tag>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {free.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Free rooms</h2>
          <div className="flex flex-wrap w-full">
            {free.map(({ room, company }) => (
              <div key={room.id} className="mb-1">
                <Tag
                  className="cursor-pointer"
                  color="green"
                  onClick={() => handleBookSlot(room.id)}
                >
                  {company?.name?.[0].toUpperCase() || '?'}
                  {room.id}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
