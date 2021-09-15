export interface Company {
  id: string;
  name: string;
}

export interface Employee {
  addr: string;
  name: string;
  companyId: string;
}

export interface Room {
  id: string;
  companyId: string;
}

export interface BookedSlot {
  slotId: string;
  roomId: string;
  bookedBy: string;
}
