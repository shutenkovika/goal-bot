# 🎯 Goal Bot

> AI-powered Telegram bot that helps you achieve any goal — with a personalized plan and daily tasks.

---

## ✨ What it does

You tell the bot your goal, describe your current level, and set a deadline.  
The AI analyzes everything and returns a structured plan with concrete steps — broken down by month and with 3 tasks to start today.

---

## 🚀 Features

- 🧠 **AI-powered planning** via OpenRouter (free tier)
- 🌍 **6 languages** — Russian, English, Spanish, German, French, Chinese
- 📋 **Structured output** — goal assessment, monthly plan, timeline, daily tasks
- 💬 **Conversational flow** — state machine guides the user step by step
- 🔐 **Secure** — API keys stored in `.env`, never committed to git

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Runtime | Node.js v24 |
| Bot framework | Telegraf |
| AI | OpenRouter API (Gemini / LLaMA) |
| Module system | ES Modules |
| Config | dotenv |

---

## 📁 Project Structure

```
goal-bot/
├── src/
│   ├── bot/
│   │   └── bot.ts        # Telegram bot logic & state machine
│   ├── ai/
│   │   └── gemini.ts     # OpenRouter API integration
│   ├── db/
│   │   └── database.ts   # Database (coming soon)
│   └── index.ts          # Entry point
├── .env.example
└── tsconfig.json
```

---

## ⚡ Quick Start

**1. Clone the repo**
```bash
git clone https://github.com/shutenkovika/goal-bot.git
cd goal-bot
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```
TELEGRAM_BOT_TOKEN=your_token_from_BotFather
OPENROUTER_API_KEY=your_key_from_openrouter.ai
```

**4. Run the bot**
```bash
npx ts-node src/index.ts
```

---

## 🌍 Supported Languages

🇷🇺 Russian · 🇬🇧 English · 🇪🇸 Spanish · 🇩🇪 German · 🇫🇷 French · 🇨🇳 Chinese

---

## 📸 How it works

```
User: /start
Bot:  🌍 [language buttons]

User: 🇷🇺 Русский
Bot:  Привет! Нажми 🎯 Поставить цель

User: Выучить английский до B2
Bot:  Опиши свой текущий уровень

User: Знаю базовые слова, уровень A1
Bot:  За какой срок хочешь достичь цели?

User: За 8 месяцев
Bot:  🧠 Анализирую...
      📊 ОЦЕНКА ЦЕЛИ ...
      🗓 ПЛАН ПО ЭТАПАМ ...
      ⏰ СРОКИ ...
      ✅ ЗАДАНИЯ НА СЕГОДНЯ ...
```

---

## 🗺 Roadmap

- [x] Core bot with AI planning
- [x] Multilanguage support (6 languages)
- [ ] SQLite database — save goals between sessions
- [ ] Daily task reminders via cron
- [ ] Progress tracking
- [ ] React Mini App inside Telegram

---

## 👩‍💻 Author

Made with ❤️ by [Victoria](https://github.com/shutenkovika)  
Built as a learning project — TypeScript, Node.js, Telegram Bot API, AI integration.
