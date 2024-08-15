<template>
    NFT
    <button @click="check_balance">Check Balance</button>

    <button @click="getapproved">Approve</button>
    <button @click="royalty">Get royalty info</button>
    <button @click="royalty">Get royalty info</button>
    <button @click="mint">Mint Nft</button>

</template>
<script setup lang="ts">
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { readContract } from "thirdweb";
import { prepareContractCall, sendTransaction } from "thirdweb";

let tokenid = ref('')
let royaltyid = ref('')


const runtimeConfig = useRuntimeConfig()

// create the client with your clientId, or secretKey if in a server environment
const client = createThirdwebClient({
    clientId: runtimeConfig.public.thirdwebClientId,

});

// connect to your contract
const contract = getContract({
    client,
    chain: defineChain(1328),
    address: "0xe312BD735D4bae0dFa7b2b0fFBcA01fBC57846D8"
});


async function check_balance() {


    const data = await readContract({
        contract,
        method: "function balanceOf(address owner) view returns (uint256)",
        params: ["0x420AeF56973233F735B9501F234b31ff5c47bE62"]
    })



}


async function getapproved() {
    const data = await readContract({
        contract,
        method: "function getApproved(uint256 tokenId) view returns (address)",
        params: [tokenid.value]
    })

}

async function royalty() {
    const data = await readContract({
        contract,
        method: "function getRoyaltyInfoForToken(uint256 _tokenId) view returns (address, uint16)",
        params: [royaltyid.value]
    })

}

async function mint() {
    const transaction = await prepareContractCall({
        contract,
        method: "function initialize(address _defaultAdmin, string _name, string _symbol, string _contractURI, address[] _trustedForwarders, address _saleRecipient, address _royaltyRecipient, uint128 _royaltyBps)",
        params: [_defaultAdmin, _name, _symbol, _contractURI, _trustedForwarders, _saleRecipient, _royaltyRecipient, _royaltyBps]
    });
    const { transactionHash } = await sendTransaction({
        transaction,
        account
    });

}

</script>