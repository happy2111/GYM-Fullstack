const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const authService = require("../services/authService");

// Стартовое сообщение с картинкой и кнопками
bot.start((ctx) => {
  ctx.replyWithPhoto(
    { url: 'https://wp.technologyreview.com/wp-content/uploads/2023/10/Las-Colinas_Full-Studio_Set-Up.jpeg?w=3000' }, // картинка бота
    {
      caption: `Привет, ${ctx.from.first_name || 'друг'}! 👋\n\nЯ помогу тебе зарегистрироваться и использовать наше приложение.\nНажми кнопку ниже, чтобы отправить номер телефона или открыть мини-приложение.`,
      ...Markup.keyboard([
        [Markup.button.contactRequest("📱 Отправить телефон")],
        [Markup.button.webApp("🌐 Открыть приложение", process.env.FRONTEND_URL || "https://your-frontend-url.com")]
      ])
        .resize()
        .oneTime() // кнопка исчезает после нажатия
    }
  );
});

// Обработка телефона
bot.on("contact", async (ctx) => {
  const { phone_number: phone } = ctx.message.contact;
  const { id: telegramId, first_name: firstName, last_name: lastName, username } = ctx.from;

  try {
    await authService.createOrUpdateTelegramUser({
      telegramId,
      firstName,
      lastName,
      phone,
      username,
      photoUrl: null // можно подтянуть через mini app
    });

    console.log("Телефон сохранён:", phone, "для Telegram ID:", telegramId);

    await ctx.reply("✅ Телефон успешно сохранён! Теперь ты можешь открыть приложение или использовать команды бота.");

    // Показать основные команды после сохранения телефона
    await ctx.reply(
      "Выбери действие:",
      Markup.keyboard([
        ["📝 Мой профиль", "🚪 Выйти"],
        ["💡 Инфо о боте"]
      ])
        .resize()
    );
  } catch (err) {
    console.error("Ошибка при сохранении телефона:", err);
    await ctx.reply("⚠️ Не удалось сохранить телефон, попробуйте позже");
  }
});

// Примеры текстовых команд
bot.hears("📝 Мой профиль", async (ctx) => {
  const user = await authService.getTelegramUser(ctx.from.id); // добавь метод getTelegramUser
  if (user) {
    await ctx.reply(
      `Имя: ${user.firstName} ${user.lastName || ''}\nТелефон: ${user.phone || 'не указан'}\nUsername: @${user.username || '-'}`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply("❌ Пользователь не найден");
  }
});

bot.hears("🚪 Выйти", async (ctx) => {
  await ctx.reply("👋 До встречи! Для повторного входа нажми /start");
});

bot.hears("💡 Инфо о боте", async (ctx) => {
  await ctx.reply("Я бот для регистрации и доступа к вашему мини-приложению. 🔹 Просто отправь номер телефона и пользуйся функциями!");
});

bot.launch();
