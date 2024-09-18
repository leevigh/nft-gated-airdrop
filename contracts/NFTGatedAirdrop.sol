// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d - BoredApe

// 0xbdf043ccaff5ac3f589906608c081d1298d5a3d51f472203bcca01ca8dacfa41 - Merkle root

contract NFTGatedAirdrop {

    address public owner;
    bytes32 public merkleRoot;
    IERC20 public token;
    IERC721 public nftContractAddress;

    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed participant, uint256 amount);
    event ClaimSuccessful();
    
    constructor(address _token, bytes32 _merkleRoot, address _nftContractAddress) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        nftContractAddress = IERC721(_nftContractAddress);
        owner = msg.sender;
    }


    function claim(bytes32[] memory proof,uint256 amount) public {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));

        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");

        // Check that user owns at least one NFT
        require(nftContractAddress.balanceOf(msg.sender) > 0, "access denied: must own NFT");

        hasClaimed[msg.sender] = true;
        IERC20(token).transfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    function withdrawRemainingBalance() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner, balance), "Transfer failed");
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Unauthorized access");
        _;
    }

}

