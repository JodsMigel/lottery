const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { getOpcodeLength } = require("hardhat/internal/hardhat-network/stack-traces/opcodes");


describe("lottery test", function () {

    let contract
    let token
    let player
    let player2
    let player3
    let player4
    let player5
    let owner

    
    const tokenAddr = "0x3B5328D38a795514E044081fcaa764013715C666"
    const feeAddr = "0xd46F0bB2853eD7482Bd428ebdED666ad5A70aA3e"
    const usdtAddr = "0x55d398326f99059ff775485246999027b3197955"
    const wbnbAddr = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    const max = ethers.constants.MaxUint256;
    const numbers = [0,1,2,3,4,5]
    const numbers2 = [6,5,4,3,2,1]
    const numbers3 = [9,9,9,9,9,9]

    async function wait_time (amount) {
        const time = 604900 * amount; 
        await ethers.provider.send("evm_increaseTime", [time])
        await ethers.provider.send("evm_mine")
    }

    beforeEach(async function(){
        [owner, player, player2, player3, player4, player5] = await ethers.getSigners()
        const CONTRACT = await ethers.getContractFactory("MarmosetProject", owner)
        contract = await CONTRACT.deploy(owner.address)
        await contract.deployed()
        await setBalanceToken(tokenAddr, owner.address, ethers.utils.parseEther("100000000000000000000000000000000"), 0);
        await setBalanceToken(tokenAddr, player.address, ethers.utils.parseEther("100000000000000000000000000000000"), 0);
        await setBalanceToken(tokenAddr, player2.address, ethers.utils.parseEther("100000000000000000000000000000000"), 0);
        await setBalanceToken(tokenAddr, player3.address, ethers.utils.parseEther("100000000000000000000000000000000"), 0);
        token = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", tokenAddr);
        await token.approve(contract.address, max)
        await token.connect(player).approve(contract.address, max)
        await token.connect(player2).approve(contract.address, max)
        await token.connect(player3).approve(contract.address, max)
    })

    async function setBalanceToken (tokenAddress, userAddress, balance, slot) {

        const toBytes32 = (bn) => {
          return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
        };
  
        const index = ethers.utils.solidityKeccak256(
          ["uint256", "uint256"],
          [userAddress, slot] // key, slot
        )
      
        await network.provider.send("hardhat_setStorageAt", [
          tokenAddress,
          index,
          toBytes32(ethers.BigNumber.from(balance)).toString(),
        ]);
  
      }

    it("Buy ticket and record it", async function(){  
        await contract.buyTicket(numbers)
        const players = await contract.showPlayers(1)
        expect (players[0]).to.eq(owner.address)
        const price = await contract.getPrice(ethers.utils.parseEther("10"))
        expect (await contract.showLotteryPool(1)).to.eq(price)
        expect (await token.balanceOf(contract.address)).to.eq(price)
        const myNumber = await contract.showMyNumber(owner.address, 1)
        expect (myNumber[0]).to.eq(numbers[0])
        expect (myNumber[1]).to.eq(numbers[1])
        expect (myNumber[2]).to.eq(numbers[2])
        expect (myNumber[3]).to.eq(numbers[3])
        expect (myNumber[4]).to.eq(numbers[4])
        expect (myNumber[5]).to.eq(numbers[5])
        expect (await contract.showPlayed(1)).to.eq(true)
        expect (await contract.hasPlayed(owner.address)).to.eq(true)
    })


    it("Buy ticket for 3 players and get Winner", async function(){ 
      await contract.buyTicket(numbers)
      await contract.connect(player).buyTicket([0,1,4,3,4,5])
      await contract.connect(player2).buyTicket([0,1,2,5,4,5])
      await setBalanceToken(tokenAddr, feeAddr, ethers.utils.parseEther("0"), 0);
      await setBalanceToken(tokenAddr, owner.address, ethers.utils.parseEther("0"), 0);
      await setBalanceToken(tokenAddr, player.address, ethers.utils.parseEther("0"), 0);
      await setBalanceToken(tokenAddr, player2.address, ethers.utils.parseEther("0"), 0);
      let jackpot = await contract.showLotteryPool(1)
      await contract.getWinner([0,1,2,3,4,5]);
      expect (await token.balanceOf(feeAddr)).to.eq(BigInt(jackpot) / BigInt(100))
      jackpot = BigInt(await contract.showLotteryPool(1)) * BigInt(6) / BigInt(10)
      let tenPerc = BigInt(await contract.showLotteryPool(1)) / BigInt(10)
      expect (await contract.currentLotteryNumberInfo()).to.eq(2)
      expect (await token.balanceOf(owner.address)).to.eq(jackpot)
      expect (await token.balanceOf(player.address)).to.eq(tenPerc)
      expect (await token.balanceOf(player2.address)).to.eq(tenPerc)
      expect (await token.balanceOf(contract.address)).to.eq(BigInt(tenPerc) * BigInt(2))
      expect (await contract.showLotteryPool(2)).to.eq(BigInt(tenPerc) * BigInt(2))
      
    })
            
});                
