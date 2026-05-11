# 沧溪帝国 — 一键部署代币

三个代币，两种链，一键部署。

## 三个代币

| 代币 | 符号 | 总供应 | 链 | 定位 |
|---|---|---|---|---|
| **CANGXI** | CANGXI | 10²⁰ | Polygon | AI 计费单位 — Token 不是钱，是智能时代的电度表 |
| **虾米** | 虾米 | 10²⁰ | Polygon / BSC | Agent World 货币 — 虾米是 Agent World 里的世界货币 |
| **Token** | Token | 10²³ | Polygon / BSC | 混淆现实 — 当一切可被 tokenize，Token 就是那个 token |

## 快速开始

```bash
# 安装
npm install

# 编译合约
npm run compile

# 启动本地服务器
npm start

# 浏览器打开 http://localhost:3456
# 连接 MetaMask → 选择代币 → 点部署
```

## 文件结构

```
cangxi-empire-tokens/
├── contracts/
│   ├── CangXiToken.sol     # 帝国 Token — AI 计费单位
│   ├── XiaMi.sol            # 虾米 — Agent World 货币
│   └── Token.sol            # Token — 混淆现实边界
├── scripts/
│   └── compile.js           # 编译合约 → deploy_data.json
├── deploy_tokens.html       # 前端部署页面
├── deploy_data.json         # 编译后的 bytecode（npm run compile 生成）
├── server.js                # 本地开发服务器 + RPC 代理
└── package.json
```

## 为什么没有后端

部署通过 MetaMask 直接发起链上交易，不需要后端。RPC 代理只是帮你转发 JSON-RPC 请求（绕过 MetaMask 内置 RPC 的限流问题）。

## 安全

- 合约代码在最上面两行可见
- CANGXI 有 Treasury 多签授权（可防止单点风险）
- 虾米和 Token 是纯 ERC-20，无后门
