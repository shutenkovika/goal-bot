// gemini.ts — модуль для работы с ИИ через OpenRouter

interface UserGoal {
  goal: string; // сама цель
  currentLevel: string; // текущий уровень
  timeframe: string; // желаемые сроки
  lang: string;
}

export async function analyzeGoal(userGoal: UserGoal): Promise<string> {
  // Язык ответа для ИИ

  const langInstruction =
    userGoal.lang === "ru"
      ? "Отвечай на русском языке."
      : userGoal.lang === "en"
        ? "Reply in English."
        : userGoal.lang === "es"
          ? "Responde en español."
          : userGoal.lang === "de"
            ? "Antworte auf Deutsch."
            : userGoal.lang === "zh"
              ? "请用中文回答。"
              : "Reply in English.";

  const headers: Record<string, Record<string, string>> = {
    ru: {
      assessment: "📊 ОЦЕНКА ЦЕЛИ",
      plan: "🗓 ПЛАН ПО ЭТАПАМ",
      month: "Месяц",
      deadlines: "⏰ СРОКИ",
      tasks: "✅ ЗАДАНИЯ НА СЕГОДНЯ",
    },
    en: {
      assessment: "📊 GOAL ASSESSMENT",
      plan: "🗓 PLAN BY STAGES",
      month: "Month",
      deadlines: "⏰ TIMELINE",
      tasks: "✅ TODAY'S TASKS",
    },
    es: {
      assessment: "📊 EVALUACIÓN",
      plan: "🗓 PLAN POR ETAPAS",
      month: "Mes",
      deadlines: "⏰ PLAZOS",
      tasks: "✅ TAREAS DE HOY",
    },
    de: {
      assessment: "📊 ZIELBEWERTUNG",
      plan: "🗓 PLAN NACH PHASEN",
      month: "Monat",
      deadlines: "⏰ ZEITPLAN",
      tasks: "✅ AUFGABEN FÜR HEUTE",
    },
    zh: {
      assessment: "📊 目标评估",
      plan: "🗓 阶段计划",
      month: "第",
      deadlines: "⏰ 时间表",
      tasks: "✅ 今日任务",
    },
  };

  const h = headers[userGoal.lang] ?? headers["ru"];

  const prompt = `
    Ты — персональный коуч и планировщик целей.
    ${langInstruction}
    
    Пользователь хочет достичь цели:
    🎯 Цель: ${userGoal.goal}
    📍 Текущий уровень: ${userGoal.currentLevel}
    ⏰ Желаемые сроки: ${userGoal.timeframe}
    
    Твоя задача — дать чёткий структурированный план.

    ВАЖНЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:
    - Пиши коротко и по делу
    - Каждый пункт с новой строки
    - Используй эмодзи в начале каждого блока
    - Между блоками оставляй пустую строку
    - Никаких звёздочек ** и решёток ##
    - Максимум 2-3 предложения в каждом блоке

    СТРУКТУРА ОТВЕТА:

    ${h.assessment}
     [1-2 предложения — реально или нет]

    ${h.plan}
    ${h.month} 1-2: [коротко]
    ${h.month} 3-4: [коротко]
     и т.д.

    ${h.deadlines}
     [1 предложение с точными сроками]

    ${h.tasks}
     1. [конкретное задание]
     2. [конкретное задание]
     3. [конкретное задание]
  `;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  const data = (await response.json()) as any;

  // Выводим весь ответ для отладки
  // console.log("Ответ от OpenRouter:", JSON.stringify(data, null, 2));

  return data.choices[0].message.content;
}
