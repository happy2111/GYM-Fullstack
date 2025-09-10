const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const authService = require("../services/authService");

// Функция для получения перевода по языку
const messages = {
  ru: {
    startCaption: (name) => `Привет, ${name || 'друг'}! 👋

Я помогу тебе зарегистрироваться и использовать наше приложение.
Нажми кнопку ниже, чтобы отправить номер телефона или открыть мини-приложение.`,
    chooseAction: "Выбери действие:",
    phoneSaved: "✅ Телефон успешно сохранён! Теперь ты можешь открыть приложение или использовать команды бота.",
    profileInfo: (user) => `Имя: ${user.firstName} ${user.lastName || ''}
Телефон: ${user.phone || 'не указан'}
Username: @${user.username || '-'}`,
    userNotFound: "❌ Пользователь не найден",
    botInfo: "Я бот для регистрации и доступа к вашему мини-приложению. 🔹 Просто отправь номер телефона и пользуйся функциями!",
    goodbye: "👋 До встречи! Для повторного входа нажми /start",
    chooseLanguage: "Выберите язык / Choose language / Tilni tanlang:"
  },
  en: {
    startCaption: (name) => `Hello, ${name || 'friend'}! 👋

I will help you register and use our app.
Press the button below to send your phone number or open the mini-app.`,
    chooseAction: "Choose action:",
    phoneSaved: "✅ Phone successfully saved! Now you can open the app or use bot commands.",
    profileInfo: (user) => `Name: ${user.firstName} ${user.lastName || ''}
Phone: ${user.phone || 'not set'}
Username: @${user.username || '-'}`,
    userNotFound: "❌ User not found",
    botInfo: "I am a bot for registration and access to your mini-app. 🔹 Just send your phone number and enjoy the features!",
    goodbye: "👋 See you! Press /start to login again",
    chooseLanguage: "Выберите язык / Choose language / Tilni tanlang:"
  },
  uz: {
    startCaption: (name) => `Salom, ${name || "do'st"}! 👋

Men sizga ro'yxatdan o'tishda va ilovani ishlatishda yordam beraman.
Quyidagi tugmani bosing va telefon raqamingizni yuboring yoki mini-ilovani oching.`,
    chooseAction: "Harakatni tanlang:",
    phoneSaved: "✅ Telefon raqami muvaffaqiyatli saqlandi! Endi siz ilovani ochishingiz yoki bot buyruqlaridan foydalanishingiz mumkin.",
    profileInfo: (user) => `Ism: ${user.firstName} ${user.lastName || ''}
Telefon: ${user.phone || "ko'rsatilmagan"}
Username: @${user.username || '-'}`,
    userNotFound: "❌ Foydalanuvchi topilmadi",
    botInfo: "Men sizning mini-ilovangizga ro'yxatdan o'tish va kirish uchun botman. 🔹 Faqat telefon raqamingizni yuboring va funksiyalardan foydalaning!",
    goodbye: "👋 Ko'rishguncha! Qayta kirish uchun /start ni bosing",
    chooseLanguage: "Выберите язык / Choose language / Tilni tanlang:"
  }
};

// Словарь для хранения выбранного языка пользователя (можно заменить на БД)
const userLanguages = new Map();

// ===== START BOT =====
bot.start(async (ctx) => {
  // Сначала предложим выбрать язык
  await ctx.reply(messages.ru.chooseLanguage,
    Markup.keyboard([
      ["🇷🇺 Русский", "🇺🇿 O'zbek", "🇬🇧 English"]
    ]).resize().oneTime()
  );
});

// Обработка выбора языка
bot.hears(["🇷🇺 Русский", "🇺🇿 O'zbek", "🇬🇧 English"], async (ctx) => {
  let lang;
  switch (ctx.message.text) {
    case "🇷🇺 Русский": lang = "ru"; break;
    case "🇺🇿 O'zbek": lang = "uz"; break;
    case "🇬🇧 English": lang = "en"; break;
    default: lang = "en";
  }

  userLanguages.set(ctx.from.id, lang);

  const name = ctx.from.first_name || 'friend';
  const msg = messages[lang].startCaption(name);

  // Стартовое сообщение с картинкой и кнопками
  await ctx.replyWithPhoto(
    { url: 'https://wp.technologyreview.com/wp-content/uploads/2023/10/Las-Colinas_Full-Studio_Set-Up.jpeg?w=3000' },
    {
      caption: msg,
      ...Markup.keyboard([
        [Markup.button.contactRequest("📱 Отправить телефон")],
        [Markup.button.webApp("🌐 Открыть приложение", process.env.FRONTEND_URL || "https://your-frontend-url.com")]
      ]).resize().oneTime()
    }
  );
});

// ===== ОБРАБОТКА КОНТАКТА =====
bot.on("contact", async (ctx) => {
  const { phone_number: phone } = ctx.message.contact;
  const { id: telegramId, first_name: firstName, last_name: lastName, username } = ctx.from;
  const lang = userLanguages.get(telegramId) || "ru";

  try {
    await authService.createOrUpdateTelegramUser({
      telegramId,
      firstName,
      lastName,
      phone,
      username,
      photoUrl: null
    });

    console.log("Телефон сохранён:", phone, "для Telegram ID:", telegramId);

    await ctx.reply(messages[lang].phoneSaved);

    // Показать основные команды после сохранения телефона
    await ctx.reply(messages[lang].chooseAction,
      Markup.keyboard([
        ["📝 Мой профиль", "🚪 Выйти"],
        ["💡 Инфо о боте"]
      ]).resize()
    );
  } catch (err) {
    console.error("Ошибка при сохранении телефона:", err);
    await ctx.reply("⚠️ Не удалось сохранить телефон, попробуйте позже");
  }
});

// ===== ОСНОВНЫЕ КОМАНДЫ =====
bot.hears("📝 Мой профиль", async (ctx) => {
  const lang = userLanguages.get(ctx.from.id) || "ru";
  const user = await authService.getTelegramUser(ctx.from.id);
  if (user) {
    await ctx.reply(messages[lang].profileInfo(user), { parse_mode: "HTML" });
  } else {
    await ctx.reply(messages[lang].userNotFound);
  }
});

bot.hears("🚪 Выйти", async (ctx) => {
  const lang = userLanguages.get(ctx.from.id) || "ru";
  await ctx.reply(messages[lang].goodbye);
});

bot.hears("💡 Инфо о боте", async (ctx) => {
  const lang = userLanguages.get(ctx.from.id) || "ru";
  await ctx.reply(messages[lang].botInfo);
});

// ===== LAUNCH =====
bot.launch();
