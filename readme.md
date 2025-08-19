## Wildberries Box Tariffs Sync App

Скрипт для получения тарифов по доставке и хранению с Wildberries, сохранения их в PostgreSQL и экспорта в Google Sheets по датам.

## 🔹 Описание

Этот проект делает следующее:

- Запрашивает данные тарифов Wildberries через API (/api/v1/tariffs/box).

- Сохраняет ответы в PostgreSQL: таблицы responses и warehouses.

- Экспортирует данные в Google Sheets:

- По каждой дате создаётся отдельный лист.

- Если лист уже существует — данные обновляются.

Скрипт периодически обновляет данные (интервал 1 час).

## 📒 Google Sheets

1. Создать сервисный аккаунт в Google Cloud, скачать JSON ключ и положить в src/config/google-private-key.json.

2. Дать сервисному аккаунту доступ на редактирование таблицы.

3. В .env указать ID таблицы в SHEET_ID.

4. Каждый лист создаётся под отдельную дату в формате YYYY-MM-DD.


## 🔧 Установка и запуск
1. Клонирование репозитория

    ```bash
    git clone https://github.com/notnered/wildberries-tarrifs-app.git
    cd wb-api-test-task
    ```

2. Установка зависимостей

    ```bash
    npm install
    ```

3. Настройка переменных окружения

- Создайте файл .env в корне проекта и добавьте следующие переменные:

    ```env
    NODE_ENV=development
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_DB=wb_tariffs
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    API_KEY=your_wb_api_key
    SHEET_ID=your_google_sheet_id
    GOOGLE_KEYFILE=./src/config/google-private-key.json
    ```

- API_KEY: Ваш API-ключ Wildberries.

- SHEET_ID: ID Google Spreadsheet, куда будут экспортироваться данные.

- GOOGLE_KEYFILE: Путь к JSON-ключу сервисного аккаунта Google. Убедитесь, что файл существует по указанному пути.

4. Запуск проекта локально

    ```bash
    npm run dev
    ```

- Скрипт будет выполняться в режиме разработки, автоматически обновляя данные и экспортируя их в Google Sheets.

5. Запуск через Docker Compose

    ```bash
    docker compose build
    docker compose up
    ```

- Все сервисы, включая PostgreSQL, будут подняты автоматически.