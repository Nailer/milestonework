// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MilestoneEscrowFactory.sol";

/**
 * @notice Deploy MilestoneEscrowFactory to Arc Testnet or Mainnet
 *
 * Testnet Usage (ZERO REAL MONEY RISK):
 *   forge script script/Deploy.s.sol \
 *     --rpc-url https://rpc.testnet.arc.network \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY \
 *     -vvvv
 *
 * Mainnet Usage:
 *   forge script script/Deploy.s.sol \
 *     --rpc-url https://rpc.mainnet.arc.io \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY \
 *     -vvvv
 */
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        MilestoneEscrowFactory factory = new MilestoneEscrowFactory();

        console.log("=== MilestoneWork Deployed ===");
        console.log("Factory address:", address(factory));
        console.log("Deployer:", msg.sender);

        vm.stopBroadcast();
    }
}
