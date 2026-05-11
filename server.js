#!/usr/bin/env node
/// 本地开发服务器 — 提供 deploy_tokens.html + RPC 代理
/// 用法: node server.js   →  http://localhost:3456
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const RPC_ENDPOINTS = {
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
};

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.sol': 'text/plain',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // RPC 代理： /api/rpc → 转发到对应链的 RPC
  if (url.pathname === '/api/rpc' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { chain, method, params } = JSON.parse(body);
        const rpcUrl = RPC_ENDPOINTS[chain] || RPC_ENDPOINTS.polygon;
        const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });

        const r = https.request(new URL(rpcUrl), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        }, proxyRes => {
          let d = '';
          proxyRes.on('data', c => d += c);
          proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(d);
          });
        });
        r.on('error', e => {
          res.writeHead(502);
          res.end(JSON.stringify({ error: { message: 'RPC unreachable: ' + e.message } }));
        });
        r.write(payload);
        r.end();
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: { message: 'Bad request' } }));
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  // 静态文件
  let filePath = url.pathname === '/' ? '/deploy_tokens.html' : url.pathname;
  filePath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><head><meta charset=UTF-8><title>沧溪帝国</title></head><body><h1>沧溪帝国 — 代币部署</h1><p>文件未找到。请运行 <code>npm run compile</code> 编译合约。</p></body></html>');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════╗');
  console.log('  ║   沧溪帝国 — 代币部署工具     ║');
  console.log(`  ║   http://localhost:${PORT}        ║`);
  console.log('  ╚═══════════════════════════════╝');
  console.log('');
  console.log('  使用:');
  console.log('  1. npm run compile  ← 先编译合约');
  console.log('  2. node server.js    ← 启动服务器');
  console.log('  3. 浏览器打开 → 连接 MetaMask → 一键部署');
  console.log('');
});
