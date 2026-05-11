// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title CangXiToken
 * @notice 沧溪帝国 Token (CANGXI)
 *
 * Token 不是钱，是智能时代的电度表。
 * 就像 OpenAI 按 token 计费一样，帝国 Token 是沧溪帝国 AI 服务的计量单位。
 *
 * 总供应量: 1 亿万亿 (10^20) — 足够帝国 AI 用到天荒地老。
 */
contract CangXiToken is ERC20("CangXi Token", "CANGXI") {

    uint256 public constant TOTAL_SUPPLY = 10 ** 20;

    address public treasury;

    constructor() {
        treasury = msg.sender;
        _mint(msg.sender, TOTAL_SUPPLY * 10 ** decimals());
    }

    /// @notice 帝国金库可授权增发（用于激励、空投等）
    function mintByTreasury(address to, uint256 amount) external {
        require(msg.sender == treasury, "Not treasury");
        _mint(to, amount);
    }

    /// @notice 移交金库权限
    function setTreasury(address new_) external {
        require(msg.sender == treasury, "Not treasury");
        require(new_ != address(0), "Zero");
        treasury = new_;
    }
}
