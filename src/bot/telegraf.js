const { bot } = require('../config/data');
const { 
  about, 
  configureScenens, 
  saveGroupIdDefault,
  saveUrlSheWizardScenes, 
  hasPermission,
  commandList,
  routineInfo,
  dailyInfo,
  backlogMonthInfo,
  botAbout
} = require('./commands');

const initTelegraf = async () => {
  try {

    const res = await bot.telegram.deleteWebhook();
    console.log('Bot Delete WebHook:', res);
    
    if(process.env?.URL_CLOUD.trim()) {
      await bot.telegram.setWebhook(process.env.URL_CLOUD + '/apibot' || '')
    }

    configureScenens(bot);
    
    bot.use(hasPermission);
    bot.command(/start/ig, commandList);
    bot.command(/ajuda/ig, commandList);
    bot.command(/sobre/ig, botAbout);
    bot.command(/criador/ig, about);
    bot.command(/urlgoogle/ig, saveUrlSheWizardScenes);
    bot.command(/definirgrupo/ig, saveGroupIdDefault);
    bot.command(/comandos/ig, commandList);
    bot.command(/rotinas/ig, routineInfo);
    bot.command(/informacoesdiaria/ig, (context) => dailyInfo(context, true, false));
    bot.use(backlogMonthInfo(/pendenciasdomes/ig));
    
    console.log('Bot RUNING...');
    
    const botInfo = (await bot.telegram.getWebhookInfo());
    console.log('Bot INFO:', botInfo);
    
    await bot.launch();
    
  } catch(error) {
    console.log('Ocorreu um erro no initTelegraf:', error);
    await bot.launch();
  }

}

module.exports = {
  initTelegraf
}