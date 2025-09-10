const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const authService = require("../services/authService");

bot.start((ctx) => {
  ctx.reply("Добро пожаловать! 🚀", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "📱 Отправить телефон",
            request_contact: true
          }
        ],
        [
          {
            text: "Открыть приложение",
            web_app: { url: process.env.FRONTEND_URL || "https://your-frontend-url.com" },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    },
  });
});

bot.on("contact", async (ctx) => {
  const phone = ctx.message.contact.phone_number;
  const telegramId = ctx.from.id; // <-- именно telegramId
  const firstName = ctx.from.first_name || null;
  const lastName = ctx.from.last_name || null;
  const username = ctx.from.username || null;

  try {
    await authService.createOrUpdateTelegramUser({
      telegramId,
      firstName,
      lastName,
      phone,
      username, // можно добавить в БД, если захочешь
      photoUrl: null // Mini App или Bot API может подтянуть
    });

    console.log("Телефон сохранён:", phone, "для Telegram ID:", telegramId);
    await ctx.reply("✅ Телефон успешно сохранён!");
  } catch (err) {
    console.error("Ошибка при сохранении телефона:", err);
    await ctx.reply("⚠️ Не удалось сохранить телефон, попробуйте позже");
  }
});

bot.launch();
