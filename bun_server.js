import { serve } from "bun";
import fs from "fs";
import path from "path";

const PORT = process.env.PORT || 5443;

// Функция для загрузки ресурсов с fallback на файловую систему
function loadResource(relativePath) {
  const fullPath = path.join(import.meta.dir, relativePath);
  
  // Сначала пытаемся загрузить из текущей директории (где запущен exe)
  const currentDirPath = path.join(process.cwd(), relativePath);
  
  try {
    // Пробуем загрузить из папки рядом с exe
    if (fs.existsSync(currentDirPath)) {
      console.log(`Загружаем из текущей директории: ${currentDirPath}`);
      return fs.readFileSync(currentDirPath, "utf-8");
    }
    
    // Пробуем загрузить из папки рядом с исходным файлом
    if (fs.existsSync(fullPath)) {
      console.log(`Загружаем из директории проекта: ${fullPath}`);
      return fs.readFileSync(fullPath, "utf-8");
    }
    
    throw new Error(`Файл не найден: ${relativePath}`);
  } catch (error) {
    console.error(`Ошибка загрузки ${relativePath}:`, error.message);
    return null;
  }
}

// Загружаем ресурсы
console.log("Загрузка ресурсов...");
console.log("Текущая директория:", process.cwd());
console.log("Директория скрипта:", import.meta.dir);

const indexHtml = loadResource("public/index.html");
const stylesCss = loadResource("public/src/styles.css");
const scriptJs = loadResource("public/src/script.js");

// Проверяем, что все файлы загрузились
if (!indexHtml || !stylesCss || !scriptJs) {
  console.error("\nНе удалось загрузить все необходимые файлы!");
  console.error("Убедитесь, что папка 'public' находится в той же директории, где запущен exe файл");
  console.error("Или в директории с исходным server.js файлом");
  console.error("\nОжидаемая структура:");
  console.error("api-tester.exe");
  console.error("public/");
  console.error("├─ index.html");
  console.error("└─ src/");
  console.error("   ├─ styles.css");
  console.error("   └─ script.js");
  process.exit(1);
}

console.log("Все ресурсы успешно загружены!");

const server = serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    // Отдаём index.html
    if (url.pathname === "/") {
      return new Response(indexHtml, { 
        headers: { "Content-Type": "text/html" } 
      });
    }

    // Раздаём статические файлы из public/src
    if (url.pathname.startsWith("/src/")) {
      if (url.pathname === "/src/styles.css") {
        return new Response(stylesCss, {
          headers: { "Content-Type": "text/css" }
        });
      }
      
      if (url.pathname === "/src/script.js") {
        return new Response(scriptJs, {
          headers: { "Content-Type": "application/javascript" }
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

console.log(`\nСервер запущен на http://localhost:${PORT}`);
console.log("Нажмите Ctrl+C для остановки\n");

// Обработка graceful shutdown
process.on('SIGINT', () => {
  console.log('\nОстановка сервера...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nОстановка сервера...');
  process.exit(0);
});