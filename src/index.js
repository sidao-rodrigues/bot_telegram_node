require('dotenv').config();
const { Telegraf } = require('telegraf');

const cron = require("node-cron");
const bot = new Telegraf(process.env.API_KEY_TELEGRAM);

bot.command('start', ctx => {
  console.log(ctx.from)
  bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
  })
})

bot.launch();
console.log('INIT')

cron.schedule("* * * * *", () => {
  console.log("Executando a tarefa a cada 1 minuto");
  bot.telegram.sendMessage(-981790060, 'Enviando message a cada minuto '+ (new Date()).toISOString(), {

  })
});