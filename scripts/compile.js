#!/usr/bin/env node
/// 编译三个代币合约 → 输出 deploy_data.json（给 deploy_tokens.html 用）
/// 用法: npm run compile
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTRACTS = [
  { file: 'CangXiToken.sol', key: 'cangxi', name: 'CANGXI' },
  { file: 'XiaMi.sol', key: 'xiami', name: '虾米' },
  { file: 'Token.sol', key: 'token', name: 'Token' },
  { file: 'ChenToken.sol', key: 'chen', name: 'CHEN' },
];

async function main() {
  console.log('=== 沧溪帝国 — 合约编译 ===\n');

  // 1. 确认 solc 可用
  let solcVersion;
  try {
    solcVersion = execSync('npx solc --version', { encoding: 'utf8' }).trim();
    console.log('编译器: ' + solcVersion);
  } catch {
    console.log('正在安装 solc...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname + '/..' });
  }

  // 2. 创建 Flat 目录（扁平化 OpenZeppelin import）
  const flatDir = path.join(__dirname, '..', 'contracts', 'flat');
  if (!fs.existsSync(flatDir)) fs.mkdirSync(flatDir, { recursive: true });

  const output = {};

  for (const c of CONTRACTS) {
    console.log(`编译: ${c.file} (${c.name})`);

    // 用 solc 编译，把 @openzeppelin 映射到 node_modules
    const contractPath = path.join(__dirname, '..', 'contracts', c.file);
    const remappings = [
      '@openzeppelin/=' + path.join(__dirname, '..', 'node_modules', '@openzeppelin'),
    ].join(' ');

    try {
      const result = execSync(
        `npx solc --optimize --optimize-runs 200 --combined-json abi,bin ${contractPath} --base-path "${path.join(__dirname, '..')}" --include-path "${path.join(__dirname, '..', 'node_modules')}"`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
      );
      const combined = JSON.parse(result);
      const contracts = combined.contracts || {};

      // solc v0.8.20+ output format: contracts/CangXiToken.sol:CangXiToken
      const key = Object.keys(contracts).find(k => k.includes(c.file.replace('.sol', '')));
      if (!key) {
        console.log(`  ⚠️ 未找到合约 ${c.file}，跳过`);
        continue;
      }

      const bytecode = '0x' + contracts[key].bin;
      output[c.key] = { bytecode };
      console.log(`  ✅ ${c.name}: ${bytecode.length} chars bytecode`);
    } catch (e) {
      console.error(`  ❌ ${c.file} 编译失败:`, e.message.slice(0, 200));
    }
  }

  // 3. 输出 deploy_data.json
  const outPath = path.join(__dirname, '..', 'deploy_data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ deploy_data.json 已生成 (${JSON.stringify(output).length} bytes)`);

  // 4. 如果没有 solc，给出手动编译指令
  if (Object.keys(output).length === 0) {
    console.log('\n⚠️ 本地编译失败。请用 Remix 手动编译:');
    console.log('  1. 打开 https://remix.ethereum.org');
    console.log('  2. 粘贴三个合约');
    console.log('  3. 编译器选 0.8.20，开启优化 200 runs');
    console.log('  4. 编译 → 复制 Bytecode → 填入 deploy_data.json');
    console.log('\n  deploy_data.json 格式:');
    console.log('  {');
    console.log('    "cangxi": { "bytecode": "0x..." },');
    console.log('    "xiami":  { "bytecode": "0x..." },');
    console.log('    "token":  { "bytecode": "0x..." }');
    console.log('  }');
  }
}

main().catch(console.error);
