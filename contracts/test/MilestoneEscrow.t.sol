// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MilestoneEscrow.sol";
import "../src/MilestoneEscrowFactory.sol";

/**
 * @dev Mock USDC for testing (mirrors Arc's ERC-20 interface)
 */
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MilestoneEscrowTest is Test {
    MilestoneEscrowFactory factory;

    address client    = address(0x1);
    address freelancer = address(0x2);

    string[] descriptions;
    uint256[] amounts;

    function setUp() public {
        factory = new MilestoneEscrowFactory();

        descriptions.push("First draft");
        descriptions.push("Final delivery");
        amounts.push(200_000_000); // 200 USDC (6 decimals)
        amounts.push(300_000_000); // 300 USDC
    }

    function test_CreateEscrow() public {
        vm.prank(client);
        address escrow = factory.createEscrow("Test Project", freelancer, descriptions, amounts);
        assertTrue(escrow != address(0));
        assertEq(factory.getTotalEscrowCount(), 1);
    }

    function test_FactoryTracksEscrows() public {
        vm.prank(client);
        address escrow = factory.createEscrow("Test Project", freelancer, descriptions, amounts);

        address[] memory byClient = factory.getEscrowsByClient(client);
        assertEq(byClient.length, 1);
        assertEq(byClient[0], escrow);

        address[] memory byFreelancer = factory.getEscrowsByFreelancer(freelancer);
        assertEq(byFreelancer.length, 1);
        assertEq(byFreelancer[0], escrow);
    }

    function test_ProjectDetails() public {
        vm.prank(client);
        address escrow = factory.createEscrow("Test Project", freelancer, descriptions, amounts);
        MilestoneEscrow e = MilestoneEscrow(escrow);

        assertEq(e.projectName(), "Test Project");
        assertEq(e.freelancer(), freelancer);
        assertEq(e.client(), client);
        assertEq(e.totalFunded(), 500_000_000);
        assertEq(e.getMilestoneCount(), 2);
    }
}
