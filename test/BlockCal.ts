import { expect } from 'chai';
import type { ContractFactory, Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('BlockCal contract', function () {
  let BlockCalContract: ContractFactory;
  let blockCal: Contract;

  beforeEach(async () => {
    BlockCalContract = await ethers.getContractFactory('BlockCal');
    blockCal = await BlockCalContract.deploy();
  });

  it('Should assign owner at deployment', async () => {
    const [{ address: owner }, { address: addr1 }] = await ethers.getSigners();
    const blockCalOwner = await blockCal.owner();
    expect(blockCalOwner).to.equal(owner);
    expect(blockCalOwner).not.to.equal(addr1);
  });

  describe('Company', () => {
    it('Should add company if called by owner', async () => {
      await blockCal.addCompany('Coke');
      const company = await blockCal.companies(1);
      expect(company.name).to.equal('Coke');
      expect(company.id.toNumber()).to.equal(1);
    });

    it('Should not add two companies with same name', async () => {
      await blockCal.addCompany('Coke');
      await expect(blockCal.addCompany('Coke')).to.be.revertedWith(
        'Company with this name already exist'
      );
    });

    it('Should not add company if called by not the owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await expect(
        blockCal.connect(addr1).addCompany('Coke')
      ).to.be.revertedWith('Only owner can create new company');
    });

    it('Should remove a company', async () => {
      await blockCal.addCompany('Coke');
      expect((await blockCal.companies(1)).name).to.equal('Coke');
      await blockCal.removeCompany(1);
      expect((await blockCal.companies(1)).name).to.not.equal('Coke');
    });

    it('Should not remove a company if called by not the owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addCompany('Coke');
      await expect(blockCal.connect(addr1).removeCompany(1)).to.be.revertedWith(
        'Only owner can delete company'
      );
    });

    it('Should remove employees assigned', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addCompany('Coke');
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await blockCal.removeCompany(1);
      await expect(blockCal.employeeInfos(addr1.address)).to.be.revertedWith(
        'Employee does not exist'
      );
    });

    it('Should remove rooms assigned', async () => {
      await blockCal.addCompany('Coke');
      await blockCal.addRoom(1);
      await blockCal.removeCompany(1);
      expect((await blockCal.rooms(1)).id).to.equal(0);
      expect((await blockCal.rooms(1)).name).to.equal(undefined);
    });
  });

  describe('Employee', () => {
    beforeEach(async () => {
      await blockCal.addCompany('Coke');
      await blockCal.addCompany('Pepsi');
    });

    it('Should add employees if called by owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addEmployee(addr1.address, 1, 'Max');
    });

    it('Should not add employees if called by not the owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await expect(
        blockCal.connect(addr1).addEmployee(addr1.address, 1, 'Max')
      ).to.be.revertedWith('Only owner can add employee');
    });

    it('Should not add add twice the same employee', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await expect(
        blockCal.addEmployee(addr1.address, 1, 'John')
      ).to.be.revertedWith('Employee already exist');
    });

    it('Should not add employee with unknown company', async () => {
      const [, addr1] = await ethers.getSigners();
      await expect(
        blockCal.addEmployee(addr1.address, 3, 'Max')
      ).to.be.revertedWith('Company does not exist');
    });

    it('Should remove employee', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await blockCal.removeEmployee(addr1.address);
      await expect(blockCal.employeeInfos(addr1.address)).to.be.revertedWith(
        'Employee does not exist'
      );
    });

    it('Should remove booked slots when removing employee', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addRoom(1);
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await blockCal.connect(addr1).bookSlot(1, 1);
      expect(await blockCal.getBookedSlots()).to.have.lengthOf(1);
      await blockCal.removeEmployee(addr1.address);
      expect(await blockCal.getBookedSlots()).to.have.lengthOf(0);
    });
  });

  describe('Rooms', () => {
    beforeEach(async () => {
      await blockCal.addCompany('Coke');
    });

    it('Should add rooms if called by the owner', async () => {
      await blockCal.addRoom(1);
      expect((await blockCal.rooms(1)).id).to.equal(1);
      expect((await blockCal.rooms(1)).companyId).to.equal(1);
    });

    it('Should add multiple rooms', async () => {
      await blockCal.addRooms(1, 10);
      for (let i = 1; i <= 10; i++) {
        expect((await blockCal.rooms(i)).id).to.equal(i);
        expect((await blockCal.rooms(i)).companyId).to.equal(1);
      }
    });

    it('Should add rooms if called by not the owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await expect(blockCal.connect(addr1).addRoom(1)).to.be.revertedWith(
        'Only owner can add room'
      );
    });

    it('Should remove rooms if the owner', async () => {
      await blockCal.addRoom(1);
      await blockCal.removeRoom(1);
      expect((await blockCal.rooms(1)).id).to.equal(0);
      expect((await blockCal.rooms(1)).name).to.equal(undefined);
    });

    it('Should not remove rooms if not the owner', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addRoom(1);
      expect(blockCal.connect(addr1).removeRoom(1)).to.be.revertedWith(
        'Only owner can remove room'
      );
    });

    it('Should not remove rooms if not exist', async () => {
      await expect(blockCal.removeRoom(1)).to.be.revertedWith(
        'Room does not exist'
      );
    });

    it('Should not add rooms if company does not exist', async () => {
      await expect(blockCal.addRoom(2)).to.be.revertedWith(
        'Company does not exist'
      );
    });
  });

  describe('Booking', () => {
    beforeEach(async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.addCompany('Coke');
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await blockCal.addRoom(1);
    });

    it('Should book a slot in between 1 to 25', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.connect(addr1).bookSlot(1, 1);
      await blockCal.connect(addr1).bookSlot(1, 2);
    });

    it('Should unbook its own slot', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.connect(addr1).bookSlot(1, 1);
      await blockCal.connect(addr1).unbookSlot(1, 1);
    });

    it('Should not book a slot if not an employee', async () => {
      const [, , addr2] = await ethers.getSigners();
      await expect(blockCal.connect(addr2).bookSlot(1, 1)).to.be.revertedWith(
        'Employee does not exist'
      );
    });

    it('Should not unbook a slot its not owner of the slot', async () => {
      const [, addr1, addr2] = await ethers.getSigners();
      await blockCal.connect(addr1).bookSlot(1, 1);
      await expect(blockCal.connect(addr2).unbookSlot(1, 1)).to.be.revertedWith(
        'Only owner can unbook slot'
      );
    });

    it('Should not unbook an unbooked slot', async () => {
      const [, addr1] = await ethers.getSigners();
      expect(blockCal.connect(addr1).unbookSlot(1, 1)).to.be.revertedWith(
        'Slot is not booked'
      );
    });

    it('Should remove bookings when removing a Company', async () => {
      const [, addr1] = await ethers.getSigners();
      await blockCal.connect(addr1).bookSlot(1, 1);
      expect(await blockCal.isRoomSlotBooked(1, 1)).to.equal(true);
      await blockCal.removeCompany(1);
      expect(await blockCal.isRoomSlotBooked(1, 1)).to.equal(false);
    });
  });

  describe('Data fetching', () => {
    beforeEach(async () => {
      const [, addr1, addr2] = await ethers.getSigners();
      await blockCal.addCompany('Coke');
      await blockCal.addCompany('Pepsi');
      await blockCal.addEmployee(addr1.address, 1, 'Max');
      await blockCal.addEmployee(addr2.address, 2, 'Tyler');
    });

    it('Should return user profile', async () => {
      const [, addr1, addr2, addr3] = await ethers.getSigners();

      const userInfos1 = await blockCal.employeeInfos(addr1.address);
      expect(userInfos1.addr).to.equal(addr1.address);
      expect(userInfos1.name).to.equal('Max');
      expect(userInfos1.companyId).to.equal(1);

      const userInfos2 = await blockCal.employeeInfos(addr2.address);
      expect(userInfos2.addr).to.equal(addr2.address);
      expect(userInfos2.name).to.equal('Tyler');
      expect(userInfos2.companyId).to.equal(2);

      await expect(blockCal.employeeInfos(addr3.address)).to.be.revertedWith(
        'Employee does not exist'
      );
    });

    it('Should return rooms', async () => {
      await blockCal.addRooms(1, 10);
      await blockCal.addRooms(2, 10);
      const rooms = await blockCal.getRooms();

      expect(
        rooms.map((room: any) => [
          room.id.toNumber(),
          room.companyId.toNumber(),
        ])
      ).to.deep.equal(
        JSON.parse(`
          [
            [ 1, 1 ],  [ 2, 1 ],  [ 3, 1 ],
            [ 4, 1 ],  [ 5, 1 ],  [ 6, 1 ],
            [ 7, 1 ],  [ 8, 1 ],  [ 9, 1 ],
            [ 10, 1 ], [ 11, 2 ], [ 12, 2 ],
            [ 13, 2 ], [ 14, 2 ], [ 15, 2 ],
            [ 16, 2 ], [ 17, 2 ], [ 18, 2 ],
            [ 19, 2 ], [ 20, 2 ]
          ]
        `)
      );
    });

    it('Should return booked slots', async () => {
      await blockCal.addRooms(1, 10);
      await blockCal.addRooms(2, 10);

      const [, addr1, addr2] = await ethers.getSigners();
      await blockCal.connect(addr1).bookSlot(1, 1);
      await blockCal.connect(addr1).bookSlot(1, 2);
      await blockCal.connect(addr1).bookSlot(1, 3);
      await blockCal.connect(addr2).bookSlot(2, 4);
      await blockCal.connect(addr2).bookSlot(2, 1);

      const bookedSlots = await blockCal.getBookedSlots();

      expect(bookedSlots).to.have.lengthOf(5);
      expect(bookedSlots[0].bookedBy).to.equal(addr1.address);
      expect(bookedSlots[0].roomId).to.equal(1);
      expect(bookedSlots[0].slotId).to.equal(1);

      expect(bookedSlots[3].bookedBy).to.equal(addr2.address);
      expect(bookedSlots[3].roomId).to.equal(2);
      expect(bookedSlots[3].slotId).to.equal(4);
    });
  });
});
