// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MilestoneEscrow.sol";

/**
 * @title MilestoneEscrowFactory
 * @notice Deploys MilestoneEscrow contracts and keeps a registry.
 *         Frontend queries this to list all projects.
 */
contract MilestoneEscrowFactory {
    // ─── State ──────────────────────────────────────────────────────────────
    address[] public allEscrows;
    mapping(address => address[]) public escrowsByFreelancer;
    mapping(address => address[]) public escrowsByClient;

    // ─── Events ─────────────────────────────────────────────────────────────
    event EscrowCreated(
        address indexed escrow,
        address indexed client,
        address indexed freelancer,
        string projectName,
        uint256 totalAmount
    );

    // ─── Create ──────────────────────────────────────────────────────────────
    /**
     * @notice Deploys a new MilestoneEscrow.
     *         msg.sender becomes the client.
     * @param projectName   Human-readable project name
     * @param freelancer    Freelancer's wallet address
     * @param descriptions  Milestone descriptions
     * @param amounts       USDC amounts per milestone (6 decimals)
     */
    function createEscrow(
        string calldata projectName,
        address freelancer,
        string[] calldata descriptions,
        uint256[] calldata amounts
    ) external returns (address escrow) {
        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }

        MilestoneEscrow newEscrow = new MilestoneEscrow(
            projectName,
            msg.sender,
            freelancer,
            descriptions,
            amounts
        );

        escrow = address(newEscrow);
        allEscrows.push(escrow);
        escrowsByClient[msg.sender].push(escrow);
        escrowsByFreelancer[freelancer].push(escrow);

        emit EscrowCreated(escrow, msg.sender, freelancer, projectName, total);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getAllEscrows() external view returns (address[] memory) {
        return allEscrows;
    }

    function getEscrowsByFreelancer(address freelancer) external view returns (address[] memory) {
        return escrowsByFreelancer[freelancer];
    }

    function getEscrowsByClient(address client) external view returns (address[] memory) {
        return escrowsByClient[client];
    }

    function getTotalEscrowCount() external view returns (uint256) {
        return allEscrows.length;
    }
}
