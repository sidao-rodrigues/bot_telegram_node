const { bot } = require('../config/data');
const { 
  about, 
  configureScenens, 
  saveGroupIdDefault,
  saveUrlSheWizardScenes, 
  hasPermission,
  listCommands,
  routines,
  informations
} = require('./commands');

const initTelegraf = async () => {

  configureScenens(bot);

  bot.use(hasPermission);
  bot.command('criador', about);
  bot.command('urlgoogle', saveUrlSheWizardScenes);
  bot.command('definirgrupo', saveGroupIdDefault);
  bot.command('listacomandos', listCommands);
  bot.command('rotinas', routines);
  bot.command('ajuda', listCommands);
  bot.command('informacoesdiaria', (context) => informations(context, true));
  
  
  console.log('Bot RUNING...');
  
  await bot.telegram.deleteWebhook();
  if(process.env.URL_NETIFLY) {
    await bot.telegram.setWebhook(process.env.URL_NETIFLY + '/apibot' || '')
  }
  
  const botInfo = (await bot.telegram.getWebhookInfo());
  console.log('BOT INFO:', botInfo);

  await bot.launch();

}

module.exports = {
  initTelegraf
}

//exemplos
/*
const qa = () => {

  const start = new Composer();
  start.on('text', async (context) => {
    console.log(context.from.first_name);
    // await context.reply(`Olá ${context.from.first_name} `);
    await context.reply(`Olá ${context.from.first_name}, informe a url da planinha: <strong>AA</strong>`);

    context.wizard.state.data = {};
    return context.wizard.next();
  })
  
  const url = new Composer();
  url.on('text', async (context) => {
    // await context.reply('URL:');
    context.wizard.state.data.url = context.message.text;
    await context.reply(context.wizard.state.data.url);
    console.log('valor url:', context.wizard.state.data.url);
    return context.scene.leave();
  })

  const messenger = new Composer();
  messenger.action('Telegram', async(context) => {
    context.wizard.stage.data.messenger = 'Telegram';
    await context.reply(context.wizard.state.data.url);
    return context.scene.leave();
  })

  const menuScene = new Scenes.WizardScene('sceneWirzard', start, url)//, messenger)
  const stage = new Scenes.Stage([menuScene]);
  return stage;
}*/