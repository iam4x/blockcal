import React from 'react';

import { AdminCompaniesComponent } from './admin.companies.component';
import { AdminRoomsComponent } from './admin.rooms.component';

export function AdminComponent() {
  return (
    <div className="flex w-full mt-12">
      <div className="w-1/2 h-auto p-4 mr-4 bg-white">
        <AdminCompaniesComponent />
      </div>
      <div className="w-1/2 h-auto p-4 ml-4 bg-white">
        <AdminRoomsComponent />
      </div>
    </div>
  );
}
