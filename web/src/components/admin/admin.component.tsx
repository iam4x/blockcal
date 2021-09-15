import React from 'react';
import { Divider, Skeleton } from 'antd';

import { AdminCompaniesComponent } from './admin.companies.component';
import { AdminEmployeesComponent } from './admin.employees.component';
import { AdminRoomsComponent } from './admin.rooms.component';

import { useContractQuery } from '../../utils/contract';
import type { Company, Employee, Room } from '../../types';

export function AdminComponent() {
  const companies = useContractQuery<Company[]>('getCompanies');
  const employees = useContractQuery<Employee[]>('getEmployees');
  const rooms = useContractQuery<Room[]>('getRooms');

  const isLoading = companies.loading || employees.loading || rooms.loading;

  return (
    <div className="flex w-full mt-12">
      <div className="w-1/2 h-auto p-4 mr-4 bg-white">
        <Skeleton active={true} loading={isLoading}>
          <AdminCompaniesComponent companies={companies} />
          <Divider />
          <AdminEmployeesComponent
            companies={companies}
            employees={employees}
          />
        </Skeleton>
      </div>
      <div className="w-1/2 h-auto p-4 ml-4 bg-white">
        <Skeleton active={true} loading={isLoading}>
          <AdminRoomsComponent companies={companies} rooms={rooms} />
        </Skeleton>
      </div>
    </div>
  );
}
