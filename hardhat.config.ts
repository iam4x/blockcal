/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
import '@nomiclabs/hardhat-waffle';
import 'hardhat-watcher';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';
import type { HardhatUserConfig } from 'hardhat/types';

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: '0.8.4',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    ropsten: {
      url: process.env.API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test' }],
      files: ['./test/**/*', './contracts/**/*'],
      verbose: true,
    },
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    currency: 'USD',
    gasPrice: 21,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
};

export default config;
