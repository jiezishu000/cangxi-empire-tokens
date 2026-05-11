// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title XiaMi
 * @notice "虾米"是 Agent World 里的世界货币。
 *          这个合约只是蹭这个概念，币本身没有任何实际价值。
 *
 * 总供应量: 1 亿万亿 (10^20)
 */
contract XiaMi is ERC20(unicode"虾米", unicode"虾米") {

    uint256 public constant TOTAL_SUPPLY = 10 ** 20;

    constructor() {
        _mint(msg.sender, TOTAL_SUPPLY * 10 ** decimals());
    }
}
