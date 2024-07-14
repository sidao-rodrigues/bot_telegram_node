const { Scenes, session, Composer } = require('telegraf');
const { setUrlSheet, setGroup, getUrlSheet, bot } = require('../config/data');
const { getGroup, getUsersPermissions } = require('../config/data');
const { getListBySheetName } = require('../sheets/google');
const { 
  generateByCompany, 
  generateAbout, 
  generateCommandList, 
  generateRoutineInfo, 
  generateError, 
  generateURLContext, 
  generateGroupIdDefault, 
  generateBacklogMonth, 
  generateBotAbout,
  generateBacklogInfo,
  generateSimpleFilter
} = require('./templates');
const { getDateNow, getDateNowMonthNumeric, getDateNowYear } = require('../config/util');


const hasPermission = async (context, next) => {
  const message = generateAbout(context.from.first_name);
  // console.log(getUsersPermissions(), context.from.id);
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

const botAbout = async (context) => {
  const message = generateBotAbout(context.from.first_name, context.botInfo.first_name);
  await context.sendMessage(message, { parse_mode: 'html' });
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
  const message = generateCommandList(context.from.first_name, context.botInfo.first_name);
  await context.sendMessage(message, { parse_mode: 'html' });
}

const routineInfo = async (context) => {
  const message = generateRoutineInfo(context.from.first_name, getGroup());
  await context.sendMessage(message, { parse_mode: 'html' });
}

const dailyInfo = async (context, byCommand = false, byDailyRoutine = true) => {

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

  const filter = (item) => item.VENCIMENTO && !item.STATUS.includes('PAGAMENTO');

  try {
    const data = await getListBySheetName(null, filter);
    const dataPerDay = data.filter(item => item.VENCIMENTO === getDateNow());

    const messages = generateByCompany(dataPerDay, {
      removeColumns: ['CHAVE', 'PIX', 'STATUS', 'VENCIMENTO', 'EMPRESA']
    });

    for await (const message of messages) {
      await sendMessage(message, { parse_mode: 'html' });
    }

    const messagesAllDays = generateBacklogMonth(context.from?.first_name, data, { byCommand, byDailyRoutine });

    for await (const message of messagesAllDays) {
      await sendMessage(message, { parse_mode: 'html' });
    }

  } catch(error) {
    console.log('Error: ', error);
    const messageError = generateError(error.message);
    await sendMessage(messageError, { parse_mode: 'html' });
  } 
}

// BUTTONS ONLY
/*
const backlogMonthInfo = (command) => {
  const composer = new Composer();

  composer.command(command, async (context) => {
    const message = generateBacklogInfo({}, 1);
    await context.sendMessage(message, { 
      parse_mode: 'html',
      reply_markup: {
        inline_keyboard: [
          [ { text: 'SIMPLIFICADOS', callback_data: 'short_option' }, { text: 'COMPLETOS', callback_data: 'long_option' } ]
        ]
      } 
    });
  });

  composer.on('callback_query', async (context) => {

    if(!['short_option', 'long_option'].includes(context.update.callback_query.data)) {
      return
    }
    await context.deleteMessage();

    const filter = (item) => item.VENCIMENTO && !item.STATUS.includes('PAGAMENTO');

    try {
      const data = await getListBySheetName(null, filter);
      const messages = generateBacklogMonth(context.from.first_name, data, { 
        shortInfo: context.update.callback_query.data === 'short_option', 
        byDailyRoutine: false, 
        listAll: true 
      });

      for await (const message of messages) {
        await context.sendMessage(message, { parse_mode: 'html', chat_id: getGroup().id });
      }
    } catch(error) {
      console.log('Error: ', error);
      const messageError = generateError(error.message);
      await context.sendMessage(messageError, { parse_mode: 'html', chat_id: getGroup().id });
    }
  });

  return composer;
}*/

// SCENES

const configureScenens = (bot) => {
  const scenes = [
    configureUrlContext(),
    configureGroupIdDefault(),
    configureSimpleFilter(),
    configureBacklogMonthInfoV2(),
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

    if(context.message.text.toLowerCase() === 'cancelar' || 
      !context.message.text.toLowerCase().includes('http')
    ) {
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

const configureSimpleFilter = () => {
  const [startComposer, option] = [new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const { message, buttons } = generateSimpleFilter({}, 1);

    context.wizard.state.data = { date: {} };

    await context.sendMessage(message, { 
      parse_mode: 'html',
      reply_markup: { inline_keyboard: buttons }
    });
    return context.wizard.next();
  });
  
  option.on('callback_query', async (context) => {
    const { data: dayNumber } = context.update.callback_query;
    const date = dayNumber === 'S/D' ? undefined : `${dayNumber}/${getDateNowMonthNumeric().padStart('2', '0')}/${getDateNowYear()}`;

    const { message, firstText, lastMessage } = generateSimpleFilter({ seletedDay: date ?? 'Sem Data' }, 2);

    context.answerCbQuery('Carregando...');
    await context.deleteMessage();

    try {
      const data = await getListBySheetName(
        null,
        (item) => (
          (date ? (item.VENCIMENTO && item.VENCIMENTO.includes(date)) : (!item.VENCIMENTO)) &&
          !item.STATUS.includes('PAGAMENTO') && (item.CATEGORIA || item.DESCRICAO)
        )
      );
      
      const messages = generateByCompany(data, {
        removeColumns: ['CHAVE', 'PIX', 'VENCIMENTO', 'EMPRESA'],
        firstMsg: message,
      });

      const messagesPerDate = generateBacklogMonth(context.from.first_name, data, { 
        firstText,
        firstMsg: message,
        lastMsg: lastMessage,
        shortInfo: false, 
        byDailyRoutine: false, 
        listAll: true,
        sendFirstMsg: false
      });

      for await (const message of messages) {
        await context.sendMessage(message, { parse_mode: 'html', chat_id: getGroup().id });
      }

      for await (const message of messagesPerDate) {
        await context.sendMessage(message, { parse_mode: 'html', chat_id: getGroup().id });
      }
    } catch(error) {
      console.log('Error: ', error);
      const messageError = generateError(error.message);
      await context.sendMessage(messageError, { parse_mode: 'html', chat_id: getGroup().id });
    }

    return context.scene.leave();
  })

  return new Scenes.WizardScene('simpleFilter', startComposer, option);
}

const configureBacklogMonthInfoV2 = () => {
  const [startComposer, option] = [new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const { message, buttons } = generateBacklogInfo({}, 1);

    context.wizard.state.data = { date: {} };

    await context.sendMessage(message, { 
      parse_mode: 'html',
      reply_markup: { inline_keyboard: buttons }
    });
    return context.wizard.next();
  });

  option.on('callback_query', async (context) => {
    const { data: dataQuery } = context.update.callback_query;

    context.answerCbQuery('Carregando...');
    await context.deleteMessage();

    const filter = (item) => item.VENCIMENTO && !item.STATUS.includes('PAGAMENTO');

    try {
      const data = await getListBySheetName(null, filter);
      const messages = generateBacklogMonth(context.from.first_name, data, { 
        shortInfo: dataQuery === 'short_option', 
        byDailyRoutine: false, 
        listAll: true 
      });

      for await (const message of messages) {
        await context.sendMessage(message, { parse_mode: 'html', chat_id: getGroup().id });
      }
    } catch(error) {
      console.log('Error: ', error);
      const messageError = generateError(error.message);
      await context.sendMessage(messageError, { parse_mode: 'html', chat_id: getGroup().id });
    }

    return context.scene.leave();
  });

  return new Scenes.WizardScene('backlogMonth', startComposer, option);
}

const saveUrlSheWizardScenes = (context) => {
  context.scene.enter('urlGoogle');
}

const saveGroupIdDefault = (context) => {
  context.scene.enter('groupId');
}

const saveSimpleFilterScene = (context) => {
  context.scene.enter('simpleFilter')
}

const saveBacklogMonthInfoV2 = (context) => {
  context.scene.enter('backlogMonth')
}

module.exports = { 
  about,
  botAbout,
  configureScenens,
  saveGroupIdDefault,
  saveUrlSheWizardScenes,
  hasPermission,
  commandList,
  routineInfo,
  dailyInfo,
  saveBacklogMonthInfoV2,
  saveSimpleFilterScene
}