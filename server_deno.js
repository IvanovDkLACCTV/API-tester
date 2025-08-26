// server.js
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { join, extname } from "https://deno.land/std@0.224.0/path/mod.ts";

const PORT = Number(Deno.env.get("PORT") || 5443);
const __dirname = new URL(".", import.meta.url).pathname;

serve(async (req) => {
  const url = new URL(req.url);

  // 1. Главная страница
  if (url.pathname === "/") {
    try {
      const html = await Deno.readTextFile(join(__dirname, "public", "index.html"));
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    } catch {
      return new Response("index.html not found", { status: 404 });
    }
  }

  // 2. Статика (CSS, JS и т.д.)
  if (url.pathname.startsWith("/src/")) {
    try {
      const filePath = join(__dirname, "public", url.pathname);
      const data = await Deno.readFile(filePath);
      const types = {
        ".css": "text/css",
        ".js": "application/javascript"
      };
      return new Response(data, {
        headers: { "Content-Type": types[extname(filePath)] || "application/octet-stream" }
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // 3. Прокси-запросы к API
  if (url.pathname === "/api/proxy" && req.method === "POST") {
    try {
      const { baseUrl, section, method, body } = await req.json();
      const endpoint = section ? `/config/${section}` : "/config";
      const targetUrl = `${baseUrl}${endpoint}`;

      const fetchOptions = { method };
      if (method === "PATCH") {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = JSON.stringify(body);
      }

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
  }

  // 4. 404
  return new Response("Not found", { status: 404 });
}, { port: PORT });

console.log(`Сервер запущен на http://localhost:${PORT}`);
