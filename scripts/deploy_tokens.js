/**
 * 沧溪帝国代币部署脚本
 *
 * 用法:
 *   # 本地测试
 *   npx hardhat run scripts/deploy_tokens.js
 *
 *   # Polygon 主网 (需 ~$0.05 的 POL 做 gas)
 *   set DEPLOY_KEY=0x你的私钥
 *   npx hardhat run scripts/deploy_tokens.js --network polygon
 *
 *   # BSC
 *   set DEPLOY_KEY=0x你的私钥
 *   npx hardhat run scripts/deploy_tokens.js --network bsc
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("=".repeat(54));
  console.log("沧溪帝国 — 代币发行");
  console.log("=".repeat(54));
  console.log("网络:", network.name);
  console.log("部署地址:", deployer.address);
  console.log("Gas余额:", ethers.formatEther(balance), network.name === "hardhat" ? "ETH" : "原生币");
  console.log("");

  if (balance === 0n) {
    console.log("[!] 余额为 0，请先转入 gas 费");
    console.log("");
  }

  // ── 1. CangXiToken ──
  console.log(">> [1/3] 部署 CangXiToken (CANGXI) ...");
  const CangXiToken = await ethers.getContractFactory("CangXiToken");
  const cangxi = await CangXiToken.deploy();
  await cangxi.waitForDeployment();
  const cangxiAddr = await cangxi.getAddress();
  console.log("   合约:", cangxiAddr);
  console.log("   总量:", ethers.formatEther(await cangxi.totalSupply()), "CANGXI");
  console.log("   金库:", await cangxi.treasury());

  // ── 2. 虾米 ──
  console.log(">> [2/3] 部署 虾米 ...");
  const XiaMi = await ethers.getContractFactory("XiaMi");
  const xiami = await XiaMi.deploy();
  await xiami.waitForDeployment();
  const xiamiAddr = await xiami.getAddress();
  console.log("   合约:", xiamiAddr);
  console.log("   总量:", ethers.formatEther(await xiami.totalSupply()), "虾米");

  // ── 3. Token ──
  console.log(">> [3/3] 部署 Token ...");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("   合约:", tokenAddr);
  console.log("   总量:", ethers.formatEther(await token.totalSupply()), "Token");

  console.log("");
  console.log("=".repeat(54));
  console.log("发行完成!");
  console.log("CANGXI:", cangxiAddr);
  console.log("虾米:", xiamiAddr);
  console.log("Token:", tokenAddr);
  console.log("=".repeat(54));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
