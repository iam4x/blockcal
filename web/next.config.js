/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = {
  reactStrictMode: true,
  env: {
    ENV: process.env.ENV || 'development',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    RPC_URL: process.env.RPC_URL,
  },
};
