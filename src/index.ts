// index.ts — точка входа приложения

import "dotenv/config";

import { bot } from "./bot/bot.ts";

// Проверяем что все ключи есть
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN не найден в .env файле!");
}

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY не найден в .env файле!");
}

console.log("✅ Ключи загружены успешно");
console.log("🤖 Запускаем бота...");

// Запускаем бота!
// launch() — подключается к Telegram и начинает слушать сообщения
bot.launch();

console.log("🚀 Бот запущен! Открывай Telegram и пиши боту");

// Graceful stop — правильно останавливаем бота
// когда нажимаем Ctrl+C в терминале
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
