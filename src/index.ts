import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

const { parsed } = dotenv.config()

const bot = new Telegraf(parsed?.BOT_TOKEN || "")

bot.start((ctx) => {
    const message = `Please use the /id command to receive your id`
    ctx.reply(message)
})

bot.command('id', (ctx) => {
    console.log(ctx.message.from)
    ctx.reply(`Your id is: ${ctx.message.from.id}`)
})

bot.command('monitoring',async (ctx) => {
    try {
        const info = await fetch('http://localhost:9100/metrics').then((e) => e.text())
        console.log(info)
	ctx.reply(`Working on`)
    } catch (e) {
        console.log(e, 'wild error')
        ctx.reply('Wild error appeared!')
    }
})

bot.launch()
