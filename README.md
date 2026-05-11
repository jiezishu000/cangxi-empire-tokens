# 沧溪帝国 三币种系统

CANGXI · 虾米 · Token — 混淆现实世界货币与代币的边界

## 架构

| 代币 | 标准 | 总量 | 特性 | 定位 |
|------|------|------|------|------|
| CANGXI | ERC20+ | 10^20 | treasury增发 | AI计费单位 |
| 虾米 | ERC20 | 10^20 | 纯标准 | Agent World货币 |
| Token | ERC20 | 10^23 | 纯标准 | 混淆现实边界 |

## 快速部署

```bash
# 网页部署
node scripts/server.js
# 浏览器打开 http://localhost:3457

# CLI部署
npx hardhat run scripts/deploy_tokens.js --network polygon
```
