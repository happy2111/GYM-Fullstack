const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

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
            web_app: { url: process.env.FRONTEND_URL ||"https://your-frontend-url.com" },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    },
  });
});

bot.on("contact", (ctx) => {
  const phone = ctx.message.contact.phone_number;
  const userId = ctx.from.id;
  // сохранить в базу (users.telegram_id -> phone)
  console.log("Телефон:", phone, userId);
});

bot.launch();
