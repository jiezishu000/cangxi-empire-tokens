/**
 * 本地 HTTP 服务器 — 让 MetaMask 能正常注入
 * 用法: node scripts/server.js
 */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT, 10) || 3457;
const ROOT = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
};

// RPC 端点配置
const RPCS = {
  polygon: { host: "polygon-bor.publicnode.com", path: "/" },
  bsc: { host: "bsc.publicnode.com", path: "/" },
};

const server = http.createServer((req, res) => {
  // ── RPC 代理 ──
  if (req.method === "POST" && req.url === "/api/rpc") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { chain, method, params } = JSON.parse(body);
        const rpc = RPCS[chain] || RPCS.polygon;
        const postData = JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params });

        const opts = {
          hostname: rpc.host,
          path: rpc.path,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        };

        const rpcReq = https.request(opts, rpcRes => {
          let data = "";
          rpcRes.on("data", chunk => data += chunk);
          rpcRes.on("end", () => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(data);
          });
        });
        rpcReq.on("error", err => {
          res.writeHead(502);
          res.end(JSON.stringify({ error: err.message }));
        });
        rpcReq.write(postData);
        rpcReq.end();
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── MetaMask RPC 代理（透传，供 wallet_addEthereumChain 使用）──
  if (req.method === "POST" && req.url === "/rpc") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const opts = {
        hostname: "polygon-bor.publicnode.com",
        path: "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };
      const rpcReq = https.request(opts, rpcRes => {
        let data = "";
        rpcRes.on("data", chunk => data += chunk);
        rpcRes.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(data);
        });
      });
      rpcReq.on("error", err => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: err.message }));
      });
      rpcReq.write(body);
      rpcReq.end();
    });
    return;
  }

  // ── 静态文件 ──
  var filePath;
  if (req.url === "/") {
    filePath = path.join(ROOT, "deploy_tokens.html");
  } else if (req.url === "/wiki") {
    filePath = path.join(ROOT, "..", "wiki", "index.html");
  } else if (req.url.startsWith("/wiki/")) {
    filePath = path.join(ROOT, "..", "wiki", req.url.replace("/wiki/", ""));
  } else {
    filePath = path.join(ROOT, req.url);
  }
  var ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`沧溪帝国部署工具: http://localhost:${PORT}`);
});
