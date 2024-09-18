import { MerkleAirdrop } from './../typechain-types/contracts/NFTGatedAirdrop.sol/MerkleAirdrop';
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

describe("NFTGatedAirdrop", function () {

  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
  
    const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
    const token = await erc20Token.deploy();
  
    return { token };
  }
  
  async function deployNFTGatedAirdrop() {
  
    const { token } = await loadFixture(deployToken)
  
    // const merkleRoot = "0xbdf043ccaff5ac3f589906608c081d1298d5a3d51f472203bcca01ca8dacfa41"
    const nftContractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
  
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const airdropList = [["0xF395767ae0e947504651a33aC2899520c551955D", 20]];
    const formattedList = airdropList.map(([address, amount]:any) => [address, ethers.parseUnits(amount.toString(), 18)]);

    const merkleTree = StandardMerkleTree.of(formattedList, ["address", "uint256"]);

    const root = merkleTree.root;
  
    const NFTGatedAirdrop = await hre.ethers.getContractFactory("NFTGatedAirdrop");
    const nftGatedAirdrop = await NFTGatedAirdrop.deploy(token, root, nftContractAddress);

    await token.transfer(nftGatedAirdrop, ethers.parseUnits("1000", 18))
  
    return { nftGatedAirdrop, nftContractAddress, merkleTree, root, owner, otherAccount };
  }
  
  describe("Deployment", function () {
    it("Should set the right NFT address", async function () {
      const { nftGatedAirdrop, nftContractAddress } = await loadFixture(deployNFTGatedAirdrop);
  
      expect((await nftGatedAirdrop.nftContractAddress()).toLowerCase()).to.equal(nftContractAddress);
    });
  
    it("Should set the right owner", async function () {
      const { nftGatedAirdrop, owner } = await loadFixture(deployNFTGatedAirdrop);
  
      expect(await nftGatedAirdrop.owner()).to.equal(owner.address);
    });
  
    // it("Should set the right merkle root", async function () {
    //   const { nftGatedAirdrop, root } = await loadFixture(deployNFTGatedAirdrop);
  
    //   expect(await nftGatedAirdrop.merkleRoot()).to.equal(root);
    // });
  });
  
  describe("Claim Airdrop", function () {
    it("Should claim airdrop successfully", async function () {
      const { nftGatedAirdrop, merkleTree } = await loadFixture(deployNFTGatedAirdrop);
  
      const TOKEN_HOLDER = "0xF395767ae0e947504651a33aC2899520c551955D";
  
      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await hre.ethers.getSigner(TOKEN_HOLDER);

      await setBalance(impersonatedSigner.address, ethers.parseUnits("100", 18));

      const leaf = [impersonatedSigner.address, ethers.parseUnits("20", 18)];
      const proof = merkleTree.getProof(leaf);
  
      // const proof = [
      //   "0x51ea7586aae9b40f431a10b8aa492619860b23d5814ce113ab855b7eb3e8cca9",
      //   "0x5e8ad918933129741cc2e1c7d7615c467e1bd2f82a630847cc5027b4696ee3f1"
      // ]
  
      await nftGatedAirdrop.connect(impersonatedSigner).claim(proof, ethers.parseUnits("20", 18));
  
      expect(await nftGatedAirdrop.hasClaimed(impersonatedSigner.getAddress())).to.equal(true);
    });
  })
    // 0xF395767ae0e947504651a33aC2899520c551955D
})
  

    // it("Should set the right router address", async function () {
    //   const { useSwap, ROUTER_ADDRESS } = await loadFixture(deployUseSwap);

    //   const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    //   const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    //   const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    //   await helpers.impersonateAccount(TOKEN_HOLDER);
    //   const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    //   const amountOut = ethers.parseUnits("20", 18);
    //   const amountInMax = ethers.parseUnits("1000", 6);

    //   const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    //   const DAI_Contract = await ethers.getContractAt("IERC20", DAI);
    //   const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    //   await USDC_Contract.approve(useSwap, amountInMax);

    //   const tx = await useSwap.connect(impersonatedSigner).handleSwap(amountOut, amountInMax, [USDC, DAI], impersonatedSigner.address, deadline);

    //   tx.wait();

    //   await USDC_Contract.approve(useSwap, amountInMax);
      
    //   const tx1 = await useSwap.connect(impersonatedSigner).handleSwap(amountOut, amountInMax, [USDC, DAI], impersonatedSigner.address, deadline);

    //   tx1.wait();

    //   expect(await useSwap.uniswapRouter()).to.equal(ROUTER_ADDRESS);
    //   expect(await useSwap.swapCount()).to.equal(2);

    // });
// )}}
