require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("solidity-coverage");
require("hardhat-gas-reporter");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const CHAIN_ID = parseInt(process.env.CHAIN_ID || "1337");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: RPC_URL,
      chainId: CHAIN_ID,
      accounts: [PRIVATE_KEY]
    },
    hardhat: {
      chainId: 1337
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD"
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
