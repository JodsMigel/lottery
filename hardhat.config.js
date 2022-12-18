require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.7"},
      { version: "0.4.18"}
    ]},
  networks: {
    hardhat: {
      forking: {
        url: "https://bsc-dataseed.binance.org/",
        blockNumber: 24009206,
      }
    }
  }
};
