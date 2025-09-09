const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Добро пожаловать! 🚀", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Открыть приложение",
            web_app: { url: process.env.FRONTEND_URL ||"https://your-frontend-url.com" },
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
});

bot.launch();
