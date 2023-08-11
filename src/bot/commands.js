const { Scenes, session, Composer } = require('telegraf');
const { setUrlSheet, setGroup, getUrlSheet, bot } = require('../config/data');
const { getGroup, getUsersPermissions } = require('../config/data');
const { getListBySheetName } = require('../sheets/google');
const { generateByCompany, generateAbout, generateCommandList, generateRoutineInfo, generateError, generateURLContext, generateGroupIdDefault } = require('./templates');


const hasPermission = async (context, next) => {
  const message = generateAbout(context.from.first_name);
  console.log(getUsersPermissions(), context.from.id)
  if(getUsersPermissions().includes(context.from.id) || getGroup().id == context.update.message.chat.id) {
    return next();
  }
  await context.sendMessage(message, { parse_mode: 'html' });
}

const about = async (context) => {
  const message = generateAbout(context.from.first_name);
  await context.sendMessage(message, { parse_mode: 'html' });
  // await context.replyWithMarkdownV2(message, { parse_mode: 'html' });
}

/*const teste = async (context) => {
  let data = await getListBySheetName();
  const messages = generateByCompany(data, ['CHAVE', 'PIX', 'STATUS', 'VENCIMENTO', 'EMPRESA']);
  console.log(messages, messages.length);
  for await (const message of messages) {
    await context.sendMessage(message, { chart_id: getGroup().id, parse_mode: 'html' });
  }
}*/

const commandList = async (context) => {
  const message = generateCommandList(context.from.first_name);
  await context.sendMessage(message, { parse_mode: 'html' });
}

const routineInfo = async (context) => {
  const message = generateRoutineInfo(context.from.first_name, getGroup());
  await context.sendMessage(message, { parse_mode: 'html' });
}

const dailyInfo = async (context, byCommand = false) => {

  const sendMessage = async (message, options) => {
    if(byCommand) {
      await context.sendMessage(message, {
        ...options,
        chat_id: getGroup().id
      });
    } else {
      context = bot.telegram;
      await context.sendMessage(getGroup().id, message, options);
    }
  }

  try {
    const data = await getListBySheetName();
    const messages = generateByCompany(data, ['CHAVE', 'PIX', 'STATUS', 'VENCIMENTO', 'EMPRESA']);

    console.log(messages, messages.length);
    
    for await (const message of messages) {
      await sendMessage(message, { parse_mode: 'html' });
    }
  } catch(error) {
    console.log(err);
    const messageError = generateError(error.message);
    await sendMessage(messageError);
  } 
}

// SCENES

const configureScenens = (bot) => {
  const scenes = [
    configureUrlContext(),
    configureGroupIdDefault(),
  ];
  const stage = new Scenes.Stage(scenes);
  bot.use(session());
  bot.use(stage.middleware());
}

const configureUrlContext = () => {
  const [startComposer, url] = [new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const message = generateURLContext({ name: context.from.first_name, urlSheet: getUrlSheet() }, 1);
    context.wizard.state.data = {};
    await context.reply(message, { parse_mode: 'html' });
    return context.wizard.next();
  });
  
  url.on('text', async (context) => {
    const { message, answerCbQuery } = generateURLContext({ name: context.from.first_name, url: context.message.text }, 2);

    if(context.message.text.toLowerCase() === 'cancelar') {
      await context.sendMessage(answerCbQuery);
      return context.scene.leave();
    }

    context.wizard.state.data.url = context.message.text;
    setUrlSheet(context.wizard.state.data.url);

    await context.reply(message, { parse_mode: 'html' });
    return context.scene.leave();
  });

  return new Scenes.WizardScene('urlGoogle', startComposer, url);
}

const configureGroupIdDefault = () => {
  const [startComposer, option] = [new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const message = generateGroupIdDefault({
      group: getGroup(),
      name: context.from.first_name,
      newGroup: context.update.message.chat
    }, 1);

    context.wizard.state.data = { group: {} };

    await context.sendMessage(message, {
      parse_mode: 'html', 
      reply_markup: {
        inline_keyboard: [
          [ { text: 'Sim', callback_data: 'yes_option' }, { text: 'Não', callback_data: 'no_option' } ]
        ]
      }  
    });
    return context.wizard.next();
  });
  
  option.action('yes_option', async (context) => {
    const isUpdate = !!getGroup().id;

    context.wizard.state.data.group.id = context.update.callback_query.message.chat.id;
    context.wizard.state.data.group.title = context.update.callback_query.message.chat.title;
    
    setGroup(context.wizard.state.data.group);
    
    const { message, answerCbQuery } = generateGroupIdDefault({
      isUpdate,
      newGroup: context.wizard.state.data.group
    }, 'yes_option');

    await context.answerCbQuery(answerCbQuery);
    await context.sendMessage(message, { parse_mode: 'html' });
    return context.scene.leave();
  });

  option.action('no_option', async (context) => {
    const message = generateGroupIdDefault({ newGroup: context.update.callback_query.message.chat }, 'no_option');

    await context.sendMessage(message, { parse_mode: 'html' });
    return context.scene.leave();
  });

  return new Scenes.WizardScene('groupId', startComposer, option);
}

const saveUrlSheWizardScenes = (context) => {
  context.scene.enter('urlGoogle');
}

const saveGroupIdDefault = (context) => {
  context.scene.enter('groupId');
}

module.exports = { 
  about,
  configureScenens,
  saveGroupIdDefault,
  saveUrlSheWizardScenes,
  hasPermission,
  commandList,
  routineInfo,
  dailyInfo,
}