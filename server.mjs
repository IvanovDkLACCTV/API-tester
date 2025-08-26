// server.js
import http from "http";
import fs from "fs";
const path = require("path")
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 5443;

// Эмуляция __dirname в ESM
const __filename = __filename; 
const __dirname = __dirname;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Отдаём index.html
  if (url.pathname === "/") {
    const htmlPath = path.join(__dirname, "public", "index.html");
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fs.readFileSync(htmlPath, "utf-8"));
      return;
    }
  }

  // Раздаём статические файлы из public/src
  if (url.pathname.startsWith("/src/")) {
    const filePath = path.join(__dirname, "public", url.pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const types = {
        ".css": "text/css",
        ".js": "application/javascript"
      };
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  // Прокси-запросы к API
  if (url.pathname === "/api/proxy" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { baseUrl, section, method, body: reqBody } = JSON.parse(body);
        let endpoint = section ? `/config/${section}` : "/config";
        let targetUrl = `${baseUrl}${endpoint}`;

        let fetchOptions = { method };
        if (method === "PATCH") {
          fetchOptions.headers = { "Content-Type": "application/json" };
          fetchOptions.body = JSON.stringify(reqBody);
        }

        const apiRes = await fetch(targetUrl, fetchOptions);
        const data = await apiRes.json();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
