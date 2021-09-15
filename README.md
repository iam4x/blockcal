# BlockCal

> Fully decentralized blockchain based calendar.

## Specs

* Owner can create companies and assign rooms to them.
* Owner can create employees and assign them to companies.
* Employees can book a room for a given day slot.
* Employees can unbook their own booking.

## Description

This is my first ever Solidity smart contract, please don't be too picky on the data structure and the code, I still need to learn the best practices and this was a complete discovery.

I went with a simple CRUD data structure and the same contract owns the data, there's no proxy to a data store only contract.

To develop the contract itself I went with TDD using [Hardhat](https://hardhat.org/) and then deployed on the Ropsten testnet to interract with the UI I built.

The UI is built with [React](https://reactjs.org/), [ant.design](https://ant.design/) and [tailwindcss](https://tailwindcss.com/).

## How to run

* Clone the repository
* Create a `.env` and fill it according to `.env.example`
* Run `yarn && yarn deploy` copy the contract address and add it to `web/.env`
* Run `cd web && yarn dev` open your browser on `http://localhost:3000` and voilà!

## BlockCal.sol

* [0x8d48e5c896583c1aad7e40bec76c0d07e3fb75de](https://ropsten.etherscan.io/address/0x8d48e5c896583c1aad7e40bec76c0d07e3fb75de) (Ropsten)

### Public Methods

* `getCompanies()` -> `{ id: string; name: string }[]`
* `getEmployees()` -> `{ addr: string; name: string, companyId: string }[]`
* `getRooms()` -> `{ id: string; companyId: string }[]`
* `getBookedSlots()` -> `{ slotId: string; roomId: string; bookedBy: string; }[]`

### Owner methods

* `addComapny(name: string)`
* `removeCompany(id: string)`
* `addEmployee(name: string, companyId: string)`
* `removeEmployee(addr: string)`
* `addRoom(name: string, companyId: string)`
* `removeRoom(id: string)`

### Employee methods

* `bookSlot(roomId: string, slotId: string)`
* `unbookSlot(roomId: string, slotId: string)`
