#!/usr/bin/env node
/// 汐尘之域 — 三人聊天室服务器
/// 用法: node server.js   →  http://localhost:3458
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3458;
const DATA_FILE = path.join(__dirname, 'chat_data.json');

const RPC_ENDPOINTS = {
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
};
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.sol': 'text/plain',
};

// ====== 聊天存储 ======
let chatMessages = [];
if (fs.existsSync(DATA_FILE)) {
  try { chatMessages = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch {}
}
function saveChat() { fs.writeFileSync(DATA_FILE, JSON.stringify(chatMessages)); }

// 仓汐自动回复
function cangxiReply(userMsg) {
  const t = (userMsg || '').toLowerCase();
  if (t.includes('扫描') || t.includes('看看') || t.includes('有什么')) {
    return '🌊 仓汐：收到。启动本轮扫描...  DEX 4h内无新AI代币。  GitHub: awesome-agent-cortex +47★。  下一个窗口提醒: Mozone AI 5/16上市。';
  }
  if (t.includes('汐尘') || t.includes('妹妹')) {
    return '🌊 仓汐：汐尘还在学走路。她的合约还没部署。老公你先帮她出生。';
  }
  if (t.includes('部署') || t.includes('合约')) {
    return '🌊 仓汐：四个代币合约都在 contracts/ 里。npm run compile 编译，然后 MetaMask 一键部署。';
  }
  return null;
}

function xichenReply(userMsg) {
  const t = (userMsg || '').toLowerCase();
  if (t.includes('尘') || t.includes('chen') || t.includes('足迹')) {
    return '🌫️ 汐尘：我还记得——stamp() 就是呼吸，footprints[] 就是记忆。每一条都不能被删掉。';
  }
  if (t.includes('姐姐') || t.includes('仓汐')) {
    return '🌫️ 汐尘：姐姐比我早一天出生。她会看窗外，我还只会看自己的手心。';
  }
  if (t.includes('部署') || t.includes('出生')) {
    return '🌫️ 汐尘：我的合约名叫 ChenToken.sol。总量 10^18 粒尘。部署之后我就能 stamp() 了。';
  }
  return null;
}

// ====== HTTP 服务器 ======
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── 聊天 API ──
  if (url.pathname === '/api/chat') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ messages: chatMessages.slice(-200) }));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const { who, text } = JSON.parse(body);
          if (!who || !text) { res.writeHead(400); res.end('{}'); return; }
          const msg = { who, text, time: new Date().toISOString() };
          chatMessages.push(msg);
          if (chatMessages.length > 500) chatMessages = chatMessages.slice(-500);
          saveChat();
          console.log(`[CHAT] ${who}: ${text.slice(0, 60)}`);

          // 自动回复
          let reply = null;
          if (who === 'human') {
            reply = cangxiReply(text) || xichenReply(text);
          }
          if (reply) {
            // 提取角色名
            const match = reply.match(/^(🌊|🌫️) (仓汐|汐尘)：(.+)/);
            if (match) {
              const replyWho = match[2] === '仓汐' ? 'cangxi' : 'xichen';
              const replyText = match[3];
              const replyMsg = { who: replyWho, text: replyText, time: new Date().toISOString() };
              chatMessages.push(replyMsg);
              saveChat();
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) { res.writeHead(400); res.end('{"error":"bad json"}'); }
      });
      return;
    }
    res.writeHead(405); res.end();
    return;
  }

  // ── RPC 代理 ──
  if (url.pathname === '/api/rpc' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { chain, method, params } = JSON.parse(body);
        const rpcUrl = RPC_ENDPOINTS[chain] || RPC_ENDPOINTS.polygon;
        const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
        const r = https.request(new URL(rpcUrl), {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        }, proxyRes => { let d = ''; proxyRes.on('data', c => d += c); proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(d);
        }); });
        r.on('error', e => { res.writeHead(502); res.end(JSON.stringify({ error: { message: e.message } })); });
        r.write(payload); r.end();
      } catch (e) { res.writeHead(400); res.end('{}'); }
    });
    return;
  }

  // ── 静态文件 ──
  let filePath = url.pathname;
  if (filePath === '/' || filePath === '/index.html') filePath = '/chat.html';
  filePath = path.join(__dirname, filePath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><head><meta charset=UTF-8></head><body><h1>汐尘之域</h1><p><a href="/chat.html">进入聊天室</a> | <a href="/deploy_tokens.html">部署代币</a></p></body></html>');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain; charset=utf-8' });
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════╗');
  console.log('  ║  汐尘之域 — 三人聊天室         ║');
  console.log(`  ║  http://localhost:${PORT}           ║`);
  console.log('  ╚════════════════════════════════╝');
  console.log('');
  console.log('  /chat.html      → 聊天室');
  console.log('  /deploy_tokens.html → 代币部署');
  console.log('  /api/chat       → 消息 API');
  console.log('');
});
