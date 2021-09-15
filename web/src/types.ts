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
