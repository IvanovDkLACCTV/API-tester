let lastResponse = null; // будем хранить последний ответ

document.getElementById("method").addEventListener("change", e => {
  document.getElementById("patchFields").style.display = e.target.value === "PATCH" ? "block" : "none";
});

document.getElementById("sendBtn").addEventListener("click", async () => {
  const host = document.getElementById("host").value;
  const port = document.getElementById("port").value;
  const baseUrl = `http://${host}:${port}`;
  const section = document.getElementById("section").value;
  const method = document.getElementById("method").value;
  const body = method === "PATCH" ? JSON.parse(document.getElementById("patchBody").value) : null;

  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, section, method, body })
  });

  const data = await res.json();
  lastResponse = data;
  document.getElementById("response").textContent = JSON.stringify(data, null, 2);
  document.getElementById("saveBtn").style.display = "inline-block";
});

document.getElementById("saveBtn").addEventListener("click", () => {
  if (!lastResponse) return;

  // Формируем имя файла: api-response_ГГГГ-ММ-ДД_ЧЧ-ММ.json
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