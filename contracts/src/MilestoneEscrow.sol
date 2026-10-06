// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MilestoneEscrow
 * @notice Freelance escrow contract on Arc mainnet (Chain ID: 5042)
 * @dev USDC on Arc: 0x3600000000000000000000000000000000000000 (ERC-20 interface, 6 decimals)
 *
 * Flow:
 *  1. Freelancer creates project → deploys or calls factory
 *  2. Client funds USDC into escrow
 *  3. Freelancer submits milestone deliverable (hash/link)
 *  4. Client approves → USDC releases to freelancer
 *  5. If client disappears: 48h auto-release after submission
 *  6. Either party can cancel before any milestone starts (full refund)
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MilestoneEscrow {
    // ─── Arc USDC (ERC-20 interface, 6 decimals) ───────────────────────────
    IERC20 public constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    // ─── State ──────────────────────────────────────────────────────────────
    enum MilestoneStatus { Pending, Funded, Submitted, Released, Refunded }

    struct Milestone {
        string  description;
        uint256 amount;         // in USDC (6 decimals)
        string  deliverableUri; // IPFS hash, URL, or note submitted by freelancer
        uint256 submittedAt;    // timestamp when freelancer submitted
        MilestoneStatus status;
    }

    string  public projectName;
    address public freelancer;
    address public client;
    uint256 public totalFunded;
    bool    public cancelled;
    bool    public funded;

    Milestone[] public milestones;

    uint256 public constant AUTO_RELEASE_DELAY = 48 hours;

    // ─── Events ─────────────────────────────────────────────────────────────
    event ProjectFunded(address indexed client, uint256 totalAmount);
    event MilestoneSubmitted(uint256 indexed milestoneId, string deliverableUri);
    event MilestoneReleased(uint256 indexed milestoneId, address freelancer, uint256 amount);
    event MilestoneAutoReleased(uint256 indexed milestoneId, address freelancer, uint256 amount);
    event ProjectCancelled(address indexed by);
    event Refunded(address indexed client, uint256 amount);

    // ─── Errors ─────────────────────────────────────────────────────────────
    error NotFreelancer();
    error NotClient();
    error NotFunded();
    error AlreadyFunded();
    error AlreadyCancelled();
    error InvalidMilestone();
    error MilestoneNotSubmitted();
    error MilestoneAlreadyReleased();
    error AutoReleaseNotReady();
    error MilestonesStarted();
    error ZeroAmount();
    error TransferFailed();

    // ─── Constructor ─────────────────────────────────────────────────────────
    /**
     * @param _projectName  Human readable project name
     * @param _freelancer   Wallet of the freelancer
     * @param _descriptions Array of milestone descriptions
     * @param _amounts      Array of USDC amounts per milestone (6 decimals)
     */
    constructor(
        string memory _projectName,
        address _client,
        address _freelancer,
        string[] memory _descriptions,
        uint256[] memory _amounts
    ) {
        require(_descriptions.length == _amounts.length, "Length mismatch");
        require(_descriptions.length > 0, "Need at least 1 milestone");
        require(_freelancer != address(0), "Invalid freelancer");
        require(_client != address(0), "Invalid client");

        projectName  = _projectName;
        client       = _client;
        freelancer   = _freelancer;

        uint256 total;
        for (uint256 i = 0; i < _descriptions.length; i++) {
            if (_amounts[i] == 0) revert ZeroAmount();
            milestones.push(Milestone({
                description:    _descriptions[i],
                amount:         _amounts[i],
                deliverableUri: "",
                submittedAt:    0,
                status:         MilestoneStatus.Pending
            }));
            total += _amounts[i];
        }
        totalFunded = total; // expected total — client must fund exactly this
    }

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyFreelancer() {
        if (msg.sender != freelancer) revert NotFreelancer();
        _;
    }

    modifier onlyClient() {
        if (msg.sender != client) revert NotClient();
        _;
    }

    modifier whenFunded() {
        if (!funded) revert NotFunded();
        _;
    }

    modifier whenNotCancelled() {
        if (cancelled) revert AlreadyCancelled();
        _;
    }

    // ─── Client: Fund the escrow ─────────────────────────────────────────────
    function fund() external onlyClient whenNotCancelled {
        if (funded) revert AlreadyFunded();

        bool ok = USDC.transferFrom(msg.sender, address(this), totalFunded);
        if (!ok) revert TransferFailed();

        funded = true;

        // Mark all milestones as Funded
        for (uint256 i = 0; i < milestones.length; i++) {
            milestones[i].status = MilestoneStatus.Funded;
        }

        emit ProjectFunded(msg.sender, totalFunded);
    }

    // ─── Freelancer: Submit deliverable ──────────────────────────────────────
    function submit(uint256 milestoneId, string calldata deliverableUri) external onlyFreelancer whenFunded whenNotCancelled {
        if (milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[milestoneId];
        if (m.status != MilestoneStatus.Funded) revert InvalidMilestone();

        m.deliverableUri = deliverableUri;
        m.submittedAt    = block.timestamp;
        m.status         = MilestoneStatus.Submitted;

        emit MilestoneSubmitted(milestoneId, deliverableUri);
    }

    // ─── Client: Approve and release funds ───────────────────────────────────
    function approve(uint256 milestoneId) external onlyClient whenFunded whenNotCancelled {
        if (milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[milestoneId];
        if (m.status != MilestoneStatus.Submitted) revert MilestoneNotSubmitted();

        m.status = MilestoneStatus.Released;

        bool ok = USDC.transfer(freelancer, m.amount);
        if (!ok) revert TransferFailed();

        emit MilestoneReleased(milestoneId, freelancer, m.amount);
    }

    // ─── Auto-release: Anyone can trigger after 48h of submission ───────────
    /**
     * @notice If client hasn't approved within 48h of submission, anyone can
     *         trigger auto-release to protect the freelancer.
     */
    function autoRelease(uint256 milestoneId) external whenFunded whenNotCancelled {
        if (milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[milestoneId];
        if (m.status != MilestoneStatus.Submitted) revert MilestoneNotSubmitted();
        if (block.timestamp < m.submittedAt + AUTO_RELEASE_DELAY) revert AutoReleaseNotReady();

        m.status = MilestoneStatus.Released;

        bool ok = USDC.transfer(freelancer, m.amount);
        if (!ok) revert TransferFailed();

        emit MilestoneAutoReleased(milestoneId, freelancer, m.amount);
    }

    // ─── Cancel: Full refund if no milestones released yet ───────────────────
    /**
     * @notice Either party can cancel if no milestone has been released.
     *         USDC returns to the client.
     */
    function cancel() external whenNotCancelled {
        if (msg.sender != client && msg.sender != freelancer) revert NotClient();

        // Ensure no milestone has been released yet
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status == MilestoneStatus.Released) revert MilestonesStarted();
        }

        cancelled = true;

        uint256 balance = USDC.balanceOf(address(this));
        if (balance > 0) {
            bool ok = USDC.transfer(client, balance);
            if (!ok) revert TransferFailed();
            emit Refunded(client, balance);
        }

        emit ProjectCancelled(msg.sender);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getContractBalance() external view returns (uint256) {
        return USDC.balanceOf(address(this));
    }

    /**
     * @notice Returns true if all milestones have been released (project complete).
     */
    function isComplete() external view returns (bool) {
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.Released) return false;
        }
        return milestones.length > 0;
    }
}
