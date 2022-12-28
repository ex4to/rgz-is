import { Telegraf, session } from "telegraf";
import dotenv from "dotenv";

const { parsed } = dotenv.config();

const bot = new Telegraf(parsed?.BOT_TOKEN || "");
const admins = parsed?.ADMINS_IDS.split(",")

const monitoring = async () => {
      const info = await fetch("http://localhost:9100/metrics").then((e) =>
      e.text()
    );

    const availableMemRaw = info
      .split("\n")
      .filter((e) => e.includes('node_memory_MemAvailable_bytes') && e.charAt(0) !== "#")
      .join("")
      .split(" ");

    const availableMem = Number(availableMemRaw[1]).toFixed(20) / (1024 * 1024 * 1024);

  if (availableMem < 0.01) {
    admins.forEach(
      (e) => bot.telegram.sendMessage(e, `Высокая нагрузка на сервер. Оставшаяся память: ${availableMem} Gb`))
  } else {
    bot.telegram.sendMessage(955737136, `Всё гуд`)
  }

}

//  setInterval(() => monitoring(), 3500)

bot.start((ctx) => {
  const message = `Please use the /id command to receive your id`;
  ctx.reply(message);
});

bot.command("id", (ctx) => {
  console.log(ctx.message.from);
  console.log(ctx.message.chat.id);
  ctx.reply(`Ваш айди пользователя: ${ctx.message.from.id}. Айди этого чата: ${ctx.message.chat.id}`);
});

bot.command("debug", async (ctx) => {
  try {
    const info = await fetch("http://localhost:9100/metrics").then((e) =>
      e.text()
    );
    const totalMemRaw = info
      .split("\n")
      .filter((e) => e.includes('node_memory_MemTotal_bytes') && e.charAt(0) !== "#")
      .join("")
      .split(" ");

    const availableMemRaw = info
      .split("\n")
      .filter((e) => e.includes('node_memory_MemAvailable_bytes') && e.charAt(0) !== "#")
      .join("")
      .split(" ");

    const totalMem = Number(totalMemRaw[1]).toFixed(20) / (1024 * 1024 * 1024)
    const availableMem = Number(availableMemRaw[1]).toFixed(20) / (1024 * 1024 * 1024)

    const networkRaw = 
	    await fetch(`http://localhost:9090/api/v1/query_range?query=node_network_receive_bytes_total&start=${new Date(Date.now() - 60000 * 2).toISOString()}&end=${new Date().toISOString()}&step=1m`)
	    .then((e) => e.json())
 
    if (networkRaw.status === 'success') {
    	console.log(networkRaw?.data?.result)
    }
    
    console.log(networkRaw?.data?.result[0].values);
    
    const networkTraffic = (Number(networkRaw?.data?.result[0].values[2][1]) - Number(networkRaw?.data?.result[0].values[0][1])) * 60 * 2 / (1024 * 8)

    ctx.reply(`Total memory: ${totalMem.toFixed(2)} Gb
Available memory: ${availableMem.toFixed(2)} Gb
Network traffic: ${networkTraffic.toFixed(2)} kb/s`);

  } catch (e) {
    console.log(e, "wild error");
    ctx.reply("Oops! Error appeared");
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
