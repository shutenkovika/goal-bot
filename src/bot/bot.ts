// bot.ts — здесь живёт весь код Telegram бота с поддержкой нескольких языков
// Telegraf — это библиотека которая упрощает работу с Telegram Bot API

import { Telegraf, Markup } from "telegraf";
import { analyzeGoal } from "../ai/gemini.ts";

// Создаём экземпляр бота с нашим токеном
// Telegraf сам общается с Telegram серверами
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Хранилище состояний пользователей
// Временно в памяти — потом перенесём в базу данных
// Map — это структура данных "ключ → значение"
interface userState {
  step: string; // на каком шаге диалога находится пользователь
  lang?: string; // язык диалога
  goal?: string; // его цель
  currentLevel?: string; // текущий уровень
}

// 🌍 Все тексты бота на разных языках
// Такой подход называется i18n (internationalization)
const texts: Record<string, Record<string, string>> = {
  ru: {
    choose_lang: "Привет! 👋 Выбери язык общения:",
    welcome: "🇷🇺 Отлично! Общаемся на русском!",
    intro:
      "Я помогу тебе достичь любой цели!\n\n1️⃣ Ты говоришь мне свою цель\n2️⃣ Я оцениваю твой текущий уровень\n3️⃣ Составляю персональный план\n4️⃣ Каждый день даю конкретные задания",
    btn_goal: "🎯 Поставить цель",
    ask_goal:
      "🎯 Напиши свою цель.\n\nНапример:\n• Выучить английский до B2\n• Похудеть на 10 кг\n• Научиться программировать",
    goal_saved:
      "✅ Цель записана!\n\nТеперь опиши свой текущий уровень.\n\nНапример:\n• Полный новичок\n• Знаю основы\n• Есть базовые знания",
    ask_timeframe:
      "✅ Понял!\n\nЗа какой срок хочешь достичь цели?\n\nНапример:\n• За 3 месяца\n• За полгода\n• За год",
    thinking: "🧠 Анализирую цель и составляю план...",
    another_goal: "Хочешь поставить ещё одну цель?",
    error: "😔 Что-то пошло не так. Попробуй ещё раз!",
    start_prompt: "Нажми кнопку 🎯 Поставить цель чтобы начать!",
  },
  en: {
    choose_lang: "Hello! 👋 Choose your language:",
    welcome: "🇬🇧 Great! Let's talk in English!",
    intro:
      "I'll help you achieve any goal!\n\n1️⃣ Tell me your goal\n2️⃣ I assess your current level\n3️⃣ Create a personal plan\n4️⃣ Give daily tasks",
    btn_goal: "🎯 Set a goal",
    ask_goal:
      "🎯 Write your goal.\n\nFor example:\n• Learn Spanish to B2\n• Lose 10 kg\n• Learn programming",
    goal_saved:
      "✅ Goal saved!\n\nNow describe your current level.\n\nFor example:\n• Complete beginner\n• Know the basics\n• Have some experience",
    ask_timeframe:
      "✅ Got it!\n\nIn what timeframe do you want to achieve this goal?\n\nFor example:\n• In 3 months\n• In 6 months\n• In a year",
    thinking: "🧠 Analyzing your goal and creating a plan...",
    another_goal: "Want to set another goal?",
    error: "😔 Something went wrong. Please try again!",
    start_prompt: "Press the 🎯 Set a goal button to start!",
  },
  es: {
    choose_lang: "¡Hola! 👋 Elige tu idioma:",
    welcome: "🇪🇸 ¡Genial! ¡Hablamos en español!",
    intro:
      "¡Te ayudaré a alcanzar cualquier objetivo!\n\n1️⃣ Dime tu objetivo\n2️⃣ Evalúo tu nivel actual\n3️⃣ Creo un plan personal\n4️⃣ Te doy tareas diarias",
    btn_goal: "🎯 Establecer objetivo",
    ask_goal:
      "🎯 Escribe tu objetivo.\n\nPor ejemplo:\n• Aprender inglés hasta B2\n• Perder 10 kg\n• Aprender programación",
    goal_saved:
      "✅ ¡Objetivo guardado!\n\nAhora describe tu nivel actual.\n\nPor ejemplo:\n• Principiante completo\n• Conozco lo básico\n• Tengo algo de experiencia",
    ask_timeframe:
      "✅ ¡Entendido!\n\n¿En cuánto tiempo quieres alcanzar este objetivo?\n\nPor ejemplo:\n• En 3 meses\n• En 6 meses\n• En un año",
    thinking: "🧠 Analizando tu objetivo y creando un plan...",
    another_goal: "¿Quieres establecer otro objetivo?",
    error: "😔 Algo salió mal. ¡Inténtalo de nuevo!",
    start_prompt: "¡Presiona el botón 🎯 Establecer objetivo para comenzar!",
  },
  de: {
    choose_lang: "Hallo! 👋 Wähle deine Sprache:",
    welcome: "🇩🇪 Super! Wir sprechen Deutsch!",
    intro:
      "Ich helfe dir, jedes Ziel zu erreichen!\n\n1️⃣ Sag mir dein Ziel\n2️⃣ Ich bewerte dein aktuelles Niveau\n3️⃣ Erstelle einen persönlichen Plan\n4️⃣ Gebe dir tägliche Aufgaben",
    btn_goal: "🎯 Ziel setzen",
    ask_goal:
      "🎯 Schreibe dein Ziel.\n\nZum Beispiel:\n• Englisch bis B2 lernen\n• 10 kg abnehmen\n• Programmieren lernen",
    goal_saved:
      "✅ Ziel gespeichert!\n\nBeschreibe jetzt dein aktuelles Niveau.\n\nZum Beispiel:\n• Kompletter Anfänger\n• Kenne die Grundlagen\n• Habe etwas Erfahrung",
    ask_timeframe:
      "✅ Verstanden!\n\nIn welchem Zeitraum möchtest du dieses Ziel erreichen?\n\nZum Beispiel:\n• In 3 Monaten\n• In 6 Monaten\n• In einem Jahr",
    thinking: "🧠 Analysiere dein Ziel und erstelle einen Plan...",
    another_goal: "Möchtest du ein weiteres Ziel setzen?",
    error: "😔 Etwas ist schiefgelaufen. Bitte versuche es erneut!",
    start_prompt: "Drücke den Knopf 🎯 Ziel setzen um zu beginnen!",
  },
  fr: {
    choose_lang: "Bonjour! 👋 Choisissez votre langue:",
    welcome: "🇫🇷 Super! On parle français!",
    intro:
      "Je t'aiderai à atteindre n'importe quel objectif!\n\n1️⃣ Dis-moi ton objectif\n2️⃣ J'évalue ton niveau actuel\n3️⃣ Je crée un plan personnel\n4️⃣ Je te donne des tâches quotidiennes",
    btn_goal: "🎯 Définir un objectif",
    ask_goal: "🎯 Écris ton objectif",
    goal_saved: "✅ Objectif enregistré!",
    ask_timeframe: "✅ Compris! En combien de temps?",
    thinking: "🧠 Analyse en cours...",
    another_goal: "Tu veux définir un autre objectif?",
    error: "😔 Une erreur est survenue. Réessaie!",
    start_prompt: "Appuie sur 🎯 Définir un objectif pour commencer!",
  },
  zh: {
    choose_lang: "你好！👋 请选择语言：",
    welcome: "🇨🇳 太棒了！我们用中文交流！",
    intro:
      "我将帮助您实现任何目标！\n\n1️⃣ 告诉我您的目标\n2️⃣ 我评估您的当前水平\n3️⃣ 制定个人计划\n4️⃣ 每天给您具体任务",
    btn_goal: "🎯 设定目标",
    ask_goal:
      "🎯 请写下您的目标。\n\n例如：\n• 将英语学到B2水平\n• 减重10公斤\n• 学习编程",
    goal_saved:
      "✅ 目标已保存！\n\n现在描述您的当前水平。\n\n例如：\n• 完全初学者\n• 了解基础知识\n• 有一些经验",
    ask_timeframe:
      "✅ 明白了！\n\n您希望在多长时间内实现这个目标？\n\n例如：\n• 3个月内\n• 6个月内\n• 一年内",
    thinking: "🧠 正在分析您的目标并制定计划...",
    another_goal: "您想设定另一个目标吗？",
    error: "😔 出了点问题，请再试一次！",
    start_prompt: "请按 🎯 设定目标 按钮开始！",
  },
};

// Вспомогательная функция — достаёт текст на нужном языке
// Если язык не найден — возвращает русский по умолчанию
function t(lang: string | undefined, key: string): string {
  return texts[lang ?? "ru"][key] ?? texts["ru"][key];
}

// Хранилище состояний пользователей
const userStates = new Map<number, userState>();

// /start — первая команда когда пользователь открывает бота
bot.start((ctx) => {
  const name = ctx.from.first_name;
  ctx.reply(
    "🌍👋",
    Markup.keyboard([
      ["🇬🇧 English", "🇪🇸 Español", "🇩🇪 Deutsch"],
      ["🇫🇷 Français", "🇷🇺 Русский", "🇨🇳 中文"],
    ]).resize(),
  );
});

// Выбор языка — обрабатываем три кнопки
bot.hears(
  [
    "🇷🇺 Русский",
    "🇬🇧 English",
    "🇪🇸 Español",
    "🇩🇪 Deutsch",
    "🇨🇳 中文",
    "🇫🇷 Français",
  ],
  (ctx) => {
    // Определяем язык по нажатой кнопке
    const langMap: Record<string, string> = {
      "🇷🇺 Русский": "ru",
      "🇬🇧 English": "en",
      "🇪🇸 Español": "es",
      "🇩🇪 Deutsch": "de",
      "🇨🇳 中文": "zh",
      "🇫🇷 Français": "fr",
    };
    const lang = langMap[ctx.message.text];

    // Сохраняем язык в состоянии
    userStates.set(ctx.from.id, { step: "idle", lang });

    // Приветствие + объяснение + кнопка на выбранном языке
    ctx.reply(t(lang, "welcome"));
    ctx.reply(
      t(lang, "intro"),
      Markup.keyboard([[t(lang, "btn_goal")]]).resize(),
    );
  },
);

// Кнопка "Поставить цель" на любом языке
bot.hears(
  [
    "🎯 Поставить цель",
    "🎯 Set a goal",
    "🎯 Establecer objetivo",
    "🎯 Ziel setzen",
    "🎯 设定目标",
    "🎯 Définir un objectif",
  ],
  (ctx) => {
    const state = userStates.get(ctx.from.id);
    const lang = state?.lang ?? "ru";

    userStates.set(ctx.from.id, { step: "waiting_goal", lang });
    ctx.reply(t(lang, "ask_goal"));
  },
);

// Обрабатываем текстовые сообщения
bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const state = userStates.get(userId);
  const lang = state?.lang ?? "ru";

  if (!state || state.step === "idle") {
    ctx.reply(t(lang, "start_prompt"));
    return;
  }

  // Шаг 1 — получили цель
  if (state.step === "waiting_goal") {
    userStates.set(userId, { ...state, step: "waiting_level", goal: text });
    ctx.reply(t(lang, "goal_saved"));
    return;
  }

  // Шаг 2 — получили уровень
  if (state.step === "waiting_level") {
    userStates.set(userId, {
      ...state,
      step: "waiting_timeframe",
      currentLevel: text,
    });
    ctx.reply(t(lang, "ask_timeframe"));
    return;
  }

  // Шаг 3 — получили сроки, идём к ИИ
  if (state.step === "waiting_timeframe") {
    await ctx.reply(t(lang, "thinking"));

    try {
      const plan = await analyzeGoal({
        goal: state.goal!,
        currentLevel: state.currentLevel!,
        timeframe: text,
        lang, // передаём язык в ИИ!
      });

      await ctx.reply(plan);
      userStates.set(userId, { step: "idle", lang });

      await ctx.reply(
        t(lang, "another_goal"),
        Markup.keyboard([[t(lang, "btn_goal")]]).resize(),
      );
    } catch (error) {
      ctx.reply(t(lang, "error"));
      userStates.set(userId, { step: "idle", lang });
    }
  }
});

export { bot };
