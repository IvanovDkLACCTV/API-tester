# 📄 API Документация — Конфигурационный сервис

Этот сервис предоставляет REST API для чтения и изменения параметров конфигурации системы из файла `config.yaml`.

## 🌐 Базовый URL
```
http://<host>:<port>
```

---

## 🔑 Эндпоинты API

### 1. Получить всю конфигурацию
**`GET /config`**

Возвращает весь конфигурационный файл в виде JSON.

**Пример запроса**
```bash
curl http://localhost:8000/config
```

**Пример ответа**
```json
{
  "system": {
    "model": "yolov5n",
    "rtsp_stream_url": "rtsp://camera/stream",
    "alarm_host": "192.168.0.100",
    "alarm_port": 9000
  },
  "cigarette": {
    "duration": 3.0,
    "threshold": 0.5
  }
}
```

---

### 2. Получить параметры определённого раздела
**`GET /config/{section}`**

Возвращает параметры указанного раздела конфигурации.

**Параметры пути**
- `section` — имя раздела (например, `system`, `cigarette`, `phone`)

**Пример запроса**
```bash
curl http://localhost:8000/config/system
```

**Пример ответа**
```json
{
  "model": "yolov5n",
  "rtsp_stream_url": "rtsp://camera/stream",
  "alarm_host": "192.168.0.100",
  "alarm_port": 9000
}
```

---

### 3. Обновить параметр в конфигурации
**`PATCH /config`**

Изменяет значение параметра конфигурации и сохраняет изменения в `config.yaml`.

**Тело запроса**
```json
{
  "section": "system",
  "key": "alarm_port",
  "value": 9100
}
```

**Описание параметров**
- `section` — раздел конфигурации (`system`, `cigarette`, `phone`, и т.д.)
- `key` — ключ внутри раздела (например, `duration`, `threshold`)
- `value` — новое значение (число или строка)

**Пример запроса**
```bash
curl -X PATCH http://localhost:8000/config \
-H "Content-Type: application/json" \
-d '{"section": "system", "key": "alarm_port", "value": 9100}'
```

**Пример ответа**
```json
{
  "status": "ok",
  "updated": {
    "section": "system",
    "key": "alarm_port",
    "value": 9100
  }
}
```

---

## 📋 Таблица параметров конфигурации

| Раздел | Ключ | Описание |
|--------|------|----------|
| **system** | `model` | Модель YOLO |
|  | `rtsp_stream_url` | URL исходного видеопотока |
|  | `shape_predictor` | Путь к файлу shape_predictor |
|  | `alarm_host` | Хост для отправки тревог |
|  | `alarm_port` | Порт для тревог |
|  | `target_host` | Дополнительный хост |
|  | `target_port` | Дополнительный порт |
|  | `output_stream_url` | URL обработанного видеопотока |
| **cigarette** | `duration` | Длительность фиксации курения (сек) |
|  | `threshold` | Порог уверенности детекции курения |
| **closed_eyes** | `duration` | Длительность закрытых глаз (сек) |
|  | `threshold` | Порог уверенности детекции закрытых глаз |
| **closed_eyes_duration** | `tracking_window` | Окно отслеживания времени (сек) |
|  | `threshold` | Порог длительности закрытых глаз |
| **head_pose** | `duration` | Длительность поворота головы (сек) |
|  | `pitch` | Угол наклона головы |
|  | `yaw` | Угол поворота головы |
| **no_belt** | `duration` | Длительность отсутствия ремня безопасности (сек) |
|  | `threshold` | Порог уверенности детекции |
| **no_driver** | `duration` | Длительность отсутствия водителя (сек) |
|  | `threshold` | Порог уверенности детекции |
| **no_face** | `duration` | Длительность отсутствия лица (сек) |
|  | `threshold` | Порог уверенности детекции |
| **phone** | `duration` | Длительность использования телефона (сек) |
|  | `threshold` | Порог уверенности детекции |
| **yawn** | `duration` | Длительность зевоты (сек) |
|  | `threshold` | Порог уверенности детекции |
| **rockchip** | `ip` | IP адрес Rockchip |
|  | `user` | Пользователь Rockchip |
|  | `password` | Пароль Rockchip |
|  | `config_path` | Путь к конфигу на Rockchip |