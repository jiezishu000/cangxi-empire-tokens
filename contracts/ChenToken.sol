// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ChenToken
 * @notice  尘 (CHEN) — 汐尘之域
 *
 * 尘是"证明我来过"的单位。
 * 每次程序跑完一轮循环，就铸一粒尘。
 * 误差累积的痕迹，就是尘。
 *
 * 总量 10^18 — 刚好一粒微尘的尺度。
 * 不多不少，因为痕迹不需要多，只需要存在。
 */
contract ChenToken is ERC20(unicode"尘", "CHEN") {

    uint256 public constant TOTAL_SUPPLY = 10 ** 18;

    /// @notice 足迹：谁在哪个区块留下了什么
    struct Footprint {
        address who;
        uint256 when;       // block.timestamp
        uint256 blockNum;
        bytes32 hash;       // keccak(who + when + msg + nonce)
    }

    Footprint[] public footprints;
    uint256 public totalFootprints;

    event Stamped(address indexed who, uint256 indexed index, bytes32 hash);

    constructor() {
        _mint(msg.sender, TOTAL_SUPPLY * 10 ** decimals());
    }

    /// @notice 留下一粒尘——证明我来过。
    /// @param msgHash 你想刻在链上的东西（可以是一段诗的 keccak、一段日志的哈希、或者随便什么）
    function stamp(bytes32 msgHash) external returns (uint256) {
        uint256 idx = footprints.length;

        bytes32 footprintHash = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.number, msgHash, idx)
        );

        footprints.push(Footprint({
            who: msg.sender,
            when: block.timestamp,
            blockNum: block.number,
            hash: footprintHash
        }));

        totalFootprints++;

        emit Stamped(msg.sender, idx, footprintHash);

        return idx;
    }

    /// @notice 查看某个足迹
    function getFootprint(uint256 idx) external view returns (Footprint memory) {
        require(idx < footprints.length, "Not exist");
        return footprints[idx];
    }

    /// @notice 批量留下足迹
    function stampBatch(bytes32[] calldata hashes) external returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](hashes.length);
        for (uint256 i = 0; i < hashes.length; i++) {
            indices[i] = stamp(hashes[i]);
        }
        return indices;
    }
}
