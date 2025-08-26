import { serve } from "bun";
import fs from "fs";
import path from "path";

const PORT = process.env.PORT || 5443;
const __dirname = import.meta.dir

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    // Отдаём index.html
    if (url.pathname === "/") {
      const html = fs.readFileSync(path.join(import.meta.dir, "public", "index.html"), "utf-8");
      return new Response(html, { headers: { "Content-Type": "text/html" } });
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
        return new Response(fs.readFileSync(filePath), {
          headers: { "Content-Type": types[ext] || "application/octet-stream" }
        });
      }
    }

    // Прокси-запросы к API
    if (url.pathname === "/api/proxy" && req.method === "POST") {
      return req.json().then(async ({ baseUrl, section, method, body }) => {
        let endpoint = section ? `/config/${section}` : "/config";
        let targetUrl = `${baseUrl}${endpoint}`;

        let fetchOptions = { method };
        if (method === "PATCH") {
          fetchOptions.headers = { "Content-Type": "application/json" };
          fetchOptions.body = JSON.stringify(body);
        }

        try {
          const res = await fetch(targetUrl, fetchOptions);
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }
});

console.log(`Сервер запущен на http://localhost:${PORT}`);
