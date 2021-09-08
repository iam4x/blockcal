// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";

struct Room {
  uint256 id;
  uint256 index;
  uint256 companyId;
}

struct RoomResponse {
  uint256 id;
  uint256 companyId;
}

struct Company {
  uint256 id;
  uint256 index;
  string name;
}

struct CompanyResponse {
  uint256 id;
  string name;
}

struct Employee {
  address addr;
  string name;
  uint256 index;
  uint256 companyId;
}

struct EmployeeResponse {
  address addr;
  string name;
  uint256 companyId;
}

struct Slot {
  bool booked;
  address bookedBy;
  uint256 index;
  uint256 bookedAt;
}

struct BookedSlotResponse {
  uint256 slotId;
  uint256 roomId;
  address bookedBy;
}

contract BlockCal {
  address public owner = msg.sender;
  uint256 public creationTime = block.timestamp;

  uint256 private nextCompanyId = 1;
  uint256 private nextRoomId = 1;

  mapping(uint256 => Company) public companies;
  uint256[] public companiesIds;

  mapping(address => Employee) public employees;
  address[] public employeesAddresses;

  mapping(uint256 => Room) public rooms;
  uint256[] public roomsIds;

  // slots 1 to 25
  // usage: `bookings[roomId][slotId]`
  mapping(uint256 => mapping(uint256 => Slot)) public bookings;
  uint256[][] public bookedSlots;

  function getCompanies() public view returns (CompanyResponse[] memory) {
    CompanyResponse[] memory _companies = new CompanyResponse[](
      companiesIds.length
    );

    for (uint256 i = 0; i < companiesIds.length; i++) {
      _companies[i].id = companies[companiesIds[i]].id;
      _companies[i].name = companies[companiesIds[i]].name;
    }

    return _companies;
  }

  function getRooms() public view returns (RoomResponse[] memory) {
    RoomResponse[] memory _rooms = new RoomResponse[](roomsIds.length);

    for (uint256 i = 0; i < roomsIds.length; i++) {
      _rooms[i].id = rooms[roomsIds[i]].id;
      _rooms[i].companyId = rooms[roomsIds[i]].companyId;
    }

    return _rooms;
  }

  function getBookedSlots() public view returns (BookedSlotResponse[] memory) {
    BookedSlotResponse[] memory _bookedSlots = new BookedSlotResponse[](
      bookedSlots.length
    );

    for (uint256 i = 0; i < bookedSlots.length; i++) {
      uint256 roomId = bookedSlots[i][0];
      uint256 slotId = bookedSlots[i][1];

      _bookedSlots[i].slotId = slotId;
      _bookedSlots[i].roomId = roomId;
      _bookedSlots[i].bookedBy = bookings[roomId][slotId].bookedBy;
    }

    return _bookedSlots;
  }

  function getEmployees() public view returns (EmployeeResponse[] memory) {
    EmployeeResponse[] memory _employees = new EmployeeResponse[](
      employeesAddresses.length
    );

    for (uint256 i = 0; i < employeesAddresses.length; i++) {
      _employees[i].addr = employeesAddresses[i];
      _employees[i].name = employees[employeesAddresses[i]].name;
      _employees[i].companyId = employees[employeesAddresses[i]].companyId;
    }

    return _employees;
  }

  function employeeInfos(address _addr)
    public
    view
    returns (EmployeeResponse memory)
  {
    require(employees[_addr].addr == _addr, "Employee does not exist");

    EmployeeResponse memory _employee;
    _employee.addr = _addr;
    _employee.name = employees[_addr].name;
    _employee.companyId = employees[_addr].companyId;

    return _employee;
  }

  function isRoomSlotBooked(uint256 roomId, uint256 slot)
    public
    view
    returns (bool isBooked)
  {
    return
      bookings[roomId][slot].bookedBy != address(0)
        ? bookings[roomId][slot].booked
        : false;
  }

  function addCompany(string memory companyName) public returns (bool success) {
    require(msg.sender == owner, "Only owner can create new company");

    for (uint256 index = 0; index < companiesIds.length; index++) {
      require(
        keccak256(bytes(companyName)) !=
          keccak256(bytes(companies[companiesIds[index]].name)),
        "Company with this name already exist"
      );
    }

    companiesIds.push(nextCompanyId);

    companies[nextCompanyId].id = nextCompanyId;
    companies[nextCompanyId].name = companyName;
    companies[nextCompanyId].index = companiesIds.length - 1;

    nextCompanyId = nextCompanyId + 1;

    return true;
  }

  function hasRoom(uint256 companyId) public view returns (uint256) {
    for (uint256 index = 0; index < roomsIds.length; index++) {
      if (rooms[roomsIds[index]].companyId == companyId) {
        return roomsIds[index];
      }
    }
    return 0;
  }

  function hasEmployee(uint256 companyId) public view returns (address) {
    for (uint256 index = 0; index < employeesAddresses.length; index++) {
      if (employees[employeesAddresses[index]].companyId == companyId) {
        return employeesAddresses[index];
      }
    }
    return address(0);
  }

  function removeCompany(uint256 companyId) public returns (bool success) {
    require(msg.sender == owner, "Only owner can delete company");
    require(
      companies[companyId].id == companyId && companyId != 0,
      "Company does not exist"
    );

    while (this.hasRoom(companyId) != 0) {
      uint256 roomId = this.hasRoom(companyId);
      this.removeRoom(roomId);
    }

    while (this.hasEmployee(companyId) != address(0)) {
      address employeeAddr = this.hasEmployee(companyId);
      this.removeEmployee(employeeAddr);
    }

    uint256 rowToDelete = companies[companyId].index;
    uint256 keyToMove = companiesIds[companiesIds.length - 1];

    companiesIds[rowToDelete] = keyToMove;
    companies[keyToMove].index = rowToDelete;

    companiesIds.pop();
    delete companies[companyId];

    return true;
  }

  function addEmployee(
    address employeeAddress,
    uint256 companyId,
    string memory employeeName
  ) public returns (bool success) {
    require(msg.sender == owner, "Only owner can add employee");
    require(
      companies[companyId].id == companyId && companyId != 0,
      "Company does not exist"
    );
    require(
      employees[employeeAddress].addr != employeeAddress,
      "Employee already exist"
    );

    employeesAddresses.push(employeeAddress);

    employees[employeeAddress].addr = employeeAddress;
    employees[employeeAddress].companyId = companyId;
    employees[employeeAddress].name = employeeName;
    employees[employeeAddress].index = employeesAddresses.length - 1;

    return true;
  }

  function hasEmployeeBookedSlot(address employeeAddress)
    public
    view
    returns (uint256[] memory)
  {
    uint256[] memory _bookedSlot = new uint256[](2);

    for (uint256 i = 0; i < bookedSlots.length; i++) {
      uint256 roomId = bookedSlots[i][0];
      uint256 slotId = bookedSlots[i][1];

      if (bookings[roomId][slotId].bookedBy == employeeAddress) {
        _bookedSlot[0] = roomId;
        _bookedSlot[1] = slotId;
        return _bookedSlot;
      }
    }

    return _bookedSlot;
  }

  function removeEmployee(address employeeAddress)
    public
    returns (bool success)
  {
    bool isOwner = msg.sender == owner || msg.sender == address(this);
    bool employeeExist = employees[employeeAddress].addr == employeeAddress;
    require(isOwner, "Only owner can remove employee");
    require(employeeExist, "Employee does not exist");

    while (this.hasEmployeeBookedSlot(employeeAddress)[0] != 0) {
      uint256[] memory bookedSlot = this.hasEmployeeBookedSlot(employeeAddress);
      this.unbookSlot(bookedSlot[0], bookedSlot[1]);
    }

    uint256 rowToDelete = employees[employeeAddress].index;
    address keyToMove = employeesAddresses[employeesAddresses.length - 1];

    employeesAddresses[rowToDelete] = keyToMove;
    employees[keyToMove].index = rowToDelete;

    employeesAddresses.pop();
    delete employees[employeeAddress];

    return true;
  }

  function addRoom(uint256 companyId) public returns (bool success) {
    bool isOwner = msg.sender == owner || address(this) == msg.sender;
    bool companyExist = companies[companyId].id == companyId && companyId != 0;
    require(isOwner, "Only owner can add room");
    require(companyExist, "Company does not exist");

    roomsIds.push(nextRoomId);
    rooms[nextRoomId].id = nextRoomId;
    rooms[nextRoomId].companyId = companyId;
    rooms[nextRoomId].index = roomsIds.length - 1;

    nextRoomId = nextRoomId + 1;

    return true;
  }

  function addRooms(uint256 companyId, uint256 count)
    public
    returns (bool success)
  {
    for (uint256 index = 0; index < count; index++) this.addRoom(companyId);
    return true;
  }

  function hasSlotBooked(uint256 roomId) public view returns (uint256) {
    for (uint256 index = 0; index < bookedSlots.length; index++) {
      if (bookedSlots[index][0] == roomId) {
        return bookedSlots[index][1];
      }
    }
    return 0;
  }

  function removeRoom(uint256 roomId) public returns (bool success) {
    bool isOwner = msg.sender == owner || msg.sender == address(this);
    require(isOwner, "Only owner can remove room");
    require(rooms[roomId].id == roomId, "Room does not exist");

    // remove booked slots
    while (this.hasSlotBooked(roomId) != 0) {
      uint256 slotBooked = this.hasSlotBooked(roomId);
      this.unbookSlot(roomId, slotBooked);
    }

    uint256 rowToDelete = rooms[roomId].index;
    uint256 keyToMove = roomsIds[roomsIds.length - 1];

    roomsIds[rowToDelete] = keyToMove;
    rooms[keyToMove].index = rowToDelete;

    roomsIds.pop();
    delete rooms[roomId];

    return true;
  }

  function bookSlot(uint256 roomId, uint256 slotId)
    public
    returns (bool success)
  {
    require(slotId > 0 && slotId < 25, "Slot must be between 1 and 25");
    require(bookings[roomId][slotId].booked != true, "Slot already booked");
    require(
      employees[msg.sender].addr == msg.sender,
      "Employee does not exist"
    );

    uint256[] memory _bookedSlot = new uint256[](2);
    _bookedSlot[0] = roomId;
    _bookedSlot[1] = slotId;

    bookedSlots.push(_bookedSlot);

    bookings[roomId][slotId].booked = true;
    bookings[roomId][slotId].bookedBy = msg.sender;
    bookings[roomId][slotId].index = bookedSlots.length - 1;
    bookings[roomId][slotId].bookedAt = block.timestamp;

    return true;
  }

  function unbookSlot(uint256 roomId, uint256 slot)
    public
    returns (bool success)
  {
    require(bookings[roomId][slot].booked, "Slot is not booked");
    require(
      bookings[roomId][slot].bookedBy == msg.sender ||
        msg.sender == owner ||
        msg.sender == address(this),
      "Only owner can unbook slot"
    );

    uint256 indexToRemove = bookings[roomId][slot].index;
    uint256[] memory keyToMove = bookedSlots[bookedSlots.length - 1];

    bookings[keyToMove[0]][keyToMove[1]].index = indexToRemove;
    bookedSlots[indexToRemove] = keyToMove;

    bookedSlots.pop();
    delete bookings[roomId][slot];

    return true;
  }
}
