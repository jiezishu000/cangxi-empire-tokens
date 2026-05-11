// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Token
 * @notice Token
 *
 * 混淆现实世界货币与代币的边界。
 * 它是钱，也不是钱；是 token，也不是 token。
 * 当一切都可以被 tokenize，Token 就是那个 token。
 *
 * 总量 1000 亿万亿 — 比帝国 Token 多 1000 倍，
 * 因为现实中流动的 "钱" 比 "计费单位" 多得多。
 */
contract Token is ERC20("Token", "Token") {

    uint256 public constant TOTAL_SUPPLY = 10 ** 23;

    constructor() {
        _mint(msg.sender, TOTAL_SUPPLY * 10 ** decimals());
    }
}
