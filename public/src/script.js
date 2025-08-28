let lastResponse = null; // будем хранить последний ответ

document.getElementById("method").addEventListener("change", e => {
  document.getElementById("textarea").style.display = e.target.value === "PATCH" ? "block" : "none";
});

document.getElementById("sendBtn").addEventListener("click", async () => {
  const host = document.getElementById("host").value;
  const port = document.getElementById("port").value;
  const baseUrl = `http://${host}:${port}`;
  const section = document.getElementById("section").value;
  const method = document.getElementById("method").value;

  let body = null;

  if (method === "PATCH") {
    const raw = document.getElementById("patchBody").value;
    try {
      body = JSON.parse(raw);
    } catch (err) {
      document.getElementById("response").textContent = "❌ Невалидный JSON в PATCH-теле";
      return;
    }
  }

  const payload = {
    baseUrl,
    method,
    ...(section && method !== "PATCH" ? { section } : {}),
    ...(body ? { body } : {})
  };

  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Ответ от сервера:", text);

    try {
      const data = JSON.parse(text);
      lastResponse = data;
      document.getElementById("response").textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      document.getElementById("response").textContent = "⚠️ Ответ не JSON: " + text;
    }

    document.getElementById("saveBtn").style.display = "inline-block";
  } catch (err) {
    console.error("Ошибка запроса:", err);
    document.getElementById("response").textContent = "❌ Ошибка запроса: " + err.message;
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  if (!lastResponse) return;

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fileName = `api-response_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.json`;

  const blob = new Blob([JSON.stringify(lastResponse, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
});
