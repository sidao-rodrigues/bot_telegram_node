const { bot } = require('../config/data');
const { 
  about, 
  configureScenens, 
  saveGroupIdDefault,
  saveUrlSheWizardScenes, 
  hasPermission,
  commandList,
  routineInfo,
  dailyInfo
} = require('./commands');

const initTelegraf = async () => {
  // try {

    configureScenens(bot);
    
    bot.use(hasPermission);
    bot.command('start', commandList);
    bot.command('criador', about);
    bot.command('urlgoogle', saveUrlSheWizardScenes);
    bot.command('definirgrupo', saveGroupIdDefault);
    bot.command('comandos', commandList);
    bot.command('rotinas', routineInfo);
    bot.command('ajuda', commandList);
    bot.command('informacoesdiaria', (context) => dailyInfo(context, true));
    
    console.log('Bot RUNING...');
    
    // await bot.telegram.deleteWebhook();
    
    // if(process.env?.URL_CLOUD.trim()) {
    //   await bot.telegram.setWebhook(process.env.URL_CLOUD + '/apibot' || '')
    // }
    
    const botInfo = (await bot.telegram.getWebhookInfo());
    console.log('Bot INFO:', botInfo);
    
    await bot.launch();

  // } catch(error) {
  //   console.log('Ocorreu um erro no initTelegraf:', error);
  // }

}

module.exports = {
  initTelegraf
}