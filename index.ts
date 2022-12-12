import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN || "")

bot.start((ctx) => {
    const message = ` Please use the /id command to receive your id`
    ctx.reply(message)
})

bot.command('id', async (ctx) => {
    ctx.reply(`${ctx.message.from}`)
})

bot.launch()