// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PrivacyPreservingVoting is Ownable {
    using ECDSA for bytes32;

    enum VotingState { NotStarted, Ongoing, Ended }
    VotingState public votingState;

    bytes32 public merkleRoot; // Root of the Merkle tree for voter eligibility
    mapping(address => bool) public hasVoted;
    mapping(bytes32 => uint256) public votes; // Mapping of vote options to their counts

    address[] public signers;
    uint256 public requiredSignatures;
    mapping(bytes32 => uint256) public approvals;

    event VoteCast(address voter, bytes32 voteOption);
    event VotingStarted();
    event VotingEnded();
    event VotesTallied(bytes32[] voteOptions, uint256[] counts);

    modifier onlySigners() {
        require(isSigner(msg.sender), "Not an authorized signer");
        _;
    }

    constructor(address[] memory _signers, uint256 _requiredSignatures, bytes32 _merkleRoot) Ownable(msg.sender){
        signers = _signers;
        requiredSignatures = _requiredSignatures;
        merkleRoot = _merkleRoot;
        votingState = VotingState.NotStarted;
    }

    function isSigner(address account) public view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == account) {
                return true;
            }
        }
        return false;
    }

    function startVoting(bytes[] memory signatures) external onlySigners {
        require(votingState == VotingState.NotStarted, "Voting already started");
        require(verifySignatures("startVoting", signatures), "Invalid signatures");

        votingState = VotingState.Ongoing;
        emit VotingStarted();
    }

    function endVoting(bytes[] memory signatures) external onlySigners {
        require(votingState == VotingState.Ongoing, "Voting not ongoing");
        require(verifySignatures("endVoting", signatures), "Invalid signatures");

        votingState = VotingState.Ended;
        emit VotingEnded();
    }

    function castVote(bytes32 voteOption, bytes32[] calldata merkleProof) external {
        require(votingState == VotingState.Ongoing, "Voting not ongoing");
        require(!hasVoted[msg.sender], "Already voted");
        require(verifyEligibility(msg.sender, merkleProof), "Not eligible to vote");

        hasVoted[msg.sender] = true;
        votes[voteOption]++;
        emit VoteCast(msg.sender, voteOption);
    }

    function tallyVotes(bytes[] memory signatures) external onlySigners {
        require(votingState == VotingState.Ended, "Voting not ended");
        require(verifySignatures("tallyVotes", signatures), "Invalid signatures");

        bytes32[] memory voteOptions = new bytes32[](2); // Example: ["Option1", "Option2"]
        uint256[] memory counts = new uint256[](2);

        for (uint256 i = 0; i < voteOptions.length; i++) {
            counts[i] = votes[voteOptions[i]];
        }

        emit VotesTallied(voteOptions, counts);
    }

    function verifyEligibility(address voter, bytes32[] calldata merkleProof) internal view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(voter));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    function verifySignatures(string memory action, bytes[] memory signatures) internal view returns (bool) {
        bytes32 actionHash = keccak256(abi.encodePacked(action));
        uint256 validSignatures = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            // address signer = actionHash.toEthSignedMessageHash().recover(signatures[i]);
            address signer = MessageHashUtils.toEthSignedMessageHash(actionHash).recover(signatures[i]);
            if (isSigner(signer)) {
                validSignatures++;
            }
        }

        return validSignatures >= requiredSignatures;
    }
}