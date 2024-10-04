import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Merkle Root: 0xbdf043ccaff5ac3f589906608c081d1298d5a3d51f472203bcca01ca8dacfa41
const Web3CXI = "0xAB35C28842fBCAef412af34d2242D29C187b8483";
const merkleRoot = "0xbdf043ccaff5ac3f589906608c081d1298d5a3d51f472203bcca01ca8dacfa41"
const nftAddr = "0x9f3F341FdbC9644C095136Bfb869AEf23ACD5F37"

const NftGatedAirdropModule = buildModule("NftGatedAirdropModule", (m) => {
  const token = m.getParameter("token", Web3CXI);
  const root = m.getParameter("merkleRoot", merkleRoot);
  const nftAddress = m.getParameter("nftContractAddress", nftAddr)

  const nftGatedAirdrop = m.contract("NFTGatedAirdrop", [token, root, nftAddress]);

  return { nftGatedAirdrop };
});

export default NftGatedAirdropModule;
