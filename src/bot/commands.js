const { Scenes, session, Composer } = require('telegraf');
const { setUrlSheet, setGroup, getUrlSheet, bot } = require('../config/data');
const { getGroup, getUsersPermissions } = require('../config/data');
const { getListBySheetName } = require('../sheets/google');
const { randomNumber, getDateNow, getDatetimeNow } = require('../config/util');

const githubLink = 'github.com/sidao-rodrigues';
const linkedinLink = 'linkedin.com/in/sidney-rodrigues-54849190/';
// console.log(context.from.id, context.update.message.chat.id)

const hasPermission = async (context, next) => {
  const message = `Olá ${context.from.first_name}, Este é meu criador 😌\n${githubLink}`;
  console.log(getUsersPermissions(), context.from.id)
  if(getUsersPermissions().includes(context.from.id) || getGroup().id === context.update.message.chat.id) {
    return next();
  }
  await context.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
}

const about = async (context) => {
  const message = `Olá ${context.from.first_name}, Tudo bem❓\nEsse bot foi criado por Sidão❗️😌😌\n\nVisite seu github: ${githubLink}\nVisite seu linkedin: ${linkedinLink}`;
  await context.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
}

const listCommands = async (context) => {
  const message = `Olá ${context.from.first_name}, esta é a lista de comandos disponíveis:\n\n`+ 
    '*Lista de Comandos*\n' + 
    '/informacoesdiaria - Saber a lista de pendência diária\n' +
    '/criador - Sobre o criador do bot\n' +
    '/urlgoogle - Definir a URL da planilha google\n' +
    '/definirgrupo - Definir o grupo principal para notificações\n' + 
    '/listacomandos - Listar comandos disponíveis no bot\n' +
    '/rotinas - Listar rotinas de notificações\n' +
    '/ajuda - Listar comandos disponíveis no bot\n';
  await context.replyWithMarkdownV2(message, { parse_mode: 'Markdown' })
}

const routines = async (context) => {
  const message = `Olá ${context.from.first_name}, a rotina de informações diárias no grupo "*${getGroup().title}*" está sendo ` +
    'de *Segunda à Sábado* nos horários de *9h* e *15h*😌';
  await context.replyWithMarkdownV2(message, { parse_mode: 'Markdown' })
}

const informations = async (context, byCommand = false) => {

  const sendMessage = async (message, options) => {
    if(!byCommand) {
      await context.sendMessage(getGroup().id, message, options);
    } else {
      await context.sendMessage(message, {
        ...options,
        chat_id: getGroup().id
      })
    }
  }

  if(!byCommand) {
    context = bot.telegram;
  }

  let allText = '',  sizePerPage = 0, data = null;
  
  const emojisNumbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  const emojis = ['😎', '🥸', '🤓', '🤗', '😼', '🧙‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '👯', '💃', '🕺'];
  const [one, two] = randomNumber(0, emojis.length -1, 2);
  const messages = [];

  try {
    data = await getListBySheetName();

    data.forEach((item, idx) => {
      const text = 
        `Item - ${idx + 1 < 10 ? (emojisNumbers[0] + '' + emojisNumbers[idx + 1]) : (emojisNumbers[String(idx + 1)[0]] + '' + emojisNumbers[String(idx + 1)[1]]) }\n` + 
        Object.entries(item).reduce((acc, [key, value], idx, item) => (`${acc}${key}: ${value}\n${idx === item.length - 1 ? '\n' : ''}`), '')
      
      if((sizePerPage + text.length) > 4096) {
        messages.push(allText);
        sizePerPage = text.length;
        allText = text;
      } else {
        sizePerPage += text.length;
        allText += text;
      }

      if(idx === data.length - 1) {
        messages.push(allText);
      }
    });

    const firstMessage = `Oiiie Pessoal ${emojis[one]}${emojis[two]}.\nSegue Informativo das pendências.\nData: *${getDatetimeNow()}*\n\n` +
      `Quantidade de Pendências: *${data?.length || 0}*\n\n${data?.length === 0 ? 'Nenhuma 🥳🥳🥳🥳🥳🥳' : ''}`;

    await sendMessage(firstMessage, { parse_mode: 'Markdown' });
    // await context.sendMessage(firstMessage, { parse_mode: 'Markdown', chat_id: getGroup().id });
    
    for await (const message of messages) {
      await sendMessage(message);
      // await context.sendMessage(message, { chat_id: getGroup().id });
    }
  } catch(err) {
    console.log(err);
    const message = 
      `Eiiita pessoal, vi aqui que ocorreu algum problema ao buscar os dados 😭😭😭😭😭\n\n\n` + 
      'Descrição do erro: ' + err.message;
    
    // await context.sendMessage(getGroup().id, message);
    await sendMessage(message);
  } 
}

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
  const [startComposer, url] = [new Composer(), new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const message = getUrlSheet() ? 
      `Olá ${context.from.first_name}❗️\n\nJá existe uma URL do Google Sheets cadastrada.\n\nInsira uma nova URL do Google Sheets para ser substituída:` : 
      `Olá ${context.from.first_name}❗️\n\nInsira uma URL do Google Sheets para ser cadastrada:`;
    
    context.wizard.state.data = {};
    
    await context.reply(message);
    return context.wizard.next();
  });

  url.on('text', async (context) => {
    const message = context.message.text ? 
      `URL Salva com sucesso❗️\n\nURL: ${context.message.text}` : 
      `URL inválida: "*${context.message.text}*"`;

    context.wizard.state.data.url = context.message.text;
    setUrlSheet(context.wizard.state.data.url);

    await context.reply(message);
    return context.scene.leave();
  });

  return new Scenes.WizardScene('urlGoogle', startComposer, url);
}

const configureGroupIdDefault = () => {
  const [startComposer, option] = [new Composer(), new Composer()];

  startComposer.on('text', async (context) => {
    const message = getGroup().id ? 
      `Olá ${context.from.first_name}❗️\n\nJá existe um grupo cadastrado "*${getGroup().title}*" para receber as notificações diárias.\n\nDeseja atualizar para esse grupo atual "*${context.update.message.chat.title}*"❓` : 
      `Olá ${context.from.first_name}❗️\nDeseja informar o grupo "*${context.update.message.chat.title}*" para receber as notificações diárias❓`;

    context.wizard.state.data = { group: {} };

    await context.replyWithMarkdownV2(message,
      { 
        parse_mode: 'Markdown', 
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Sim', callback_data: 'yes_option' }, { text: 'Não', callback_data: 'no_option' } ]
          ]
        }  
      });
    return context.wizard.next();
  });
  
  option.action('yes_option', async (context) => {
    // console.log('AQUI:', context.update.callback_query.message.chat);
    const isUpdate = !!getGroup().id;

    context.wizard.state.data.group.id = context.update.callback_query.message.chat.id;
    context.wizard.state.data.group.title = context.update.callback_query.message.chat.title;

    setGroup(context.wizard.state.data.group);

    await context.answerCbQuery(isUpdate ? 'Salvo com sucesso' : 'Atualizado com sucesso');
    await context.replyWithMarkdownV2(
      `O grupo "*${context.update.callback_query.message.chat.title}*" foi ${isUpdate ? 'atualizado' : 'salvo'} para receber as notificações diárias❗️ 😎`,
      { parse_mode: 'Markdown' }
    );
    return context.scene.leave();
  });

  option.action('no_option', async (context) => {
    await context.replyWithMarkdownV2(
      `O grupo "*${context.update.callback_query.message.chat.title}*" não foi adicionado para receber as notificações diárias❗️ 🥲`,
      { parse_mode: 'Markdown' }
    );
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
  listCommands,
  routines,
  informations
}