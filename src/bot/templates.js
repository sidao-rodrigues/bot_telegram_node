const { randomNumber, getDatetimeNow } = require("../config/util");

const URLS = {
  LINKEDIN: 'linkedin.com/in/sidney-rodrigues-54849190',
  GITHUB: 'instagram.com/sidao_rodrigues'
};

const verifyValue = (value) => {
  return value?.trim() ? value.trim() : '❌'; 
}

const groupByColumn = (items, columnName) => {
  return items.reduce((acc, item) => ({
    ...acc,
    [item[columnName]]: [...(acc[item[columnName]] || []), item]
  }), {});
}

const mergeItem = (item, idx, columnBold, removeColumns) => {
  const emojisNumbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  return `<pre><b>ITEM</b> ${idx+1 < 10 ? (emojisNumbers[0]+''+emojisNumbers[idx+1]) : (emojisNumbers[String(idx+1)[0]]+''+emojisNumbers[String(idx+1)[1]])}\n` +
    Object.entries(item).reduce((acc, [key, value], idx, obj) => {
      const removeColum = removeColumns.some(column => key.toUpperCase().includes(column));
      const isBoldValue = columnBold.includes(key) ? `<b>${verifyValue(value)}</b>` : verifyValue(value);
      if(!removeColum) {
        return `${acc}${idx < obj.length && idx !== 0 ? ' | ' : ''}${isBoldValue}${idx === obj.length - 1 ? '</pre>\n\n\n' : ''}`;
      } else {
        return `${acc}${idx === obj.length - 1 ? '</pre>\n\n\n' : ''}`;
      }
  }, '');
}

// templates

const generateByCompany = (items, removeColumns = ['CHAVE PIX', 'PIX', 'STATUS'], columnBold = 'DESCRIÇÃO', columnName = 'EMPRESA') => {

  const messages = [];
  const emojis = [
    '😎', '🥸', '🤓', '🤗', '😼', '🧙‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '👯', '💃', '🕺', '👽', 
    '👾', '🤖', '🤌', '🤹🏻‍♀️', '🤹🏻', '🤹🏻‍♂️', '🧘🏻‍♀️', '🧘🏻', '🧘🏻‍♂️', '🌞', '💤', '📣', '📢', '🔔'
  ];
  const saudations = ['Oiiie Pesssoal', 'Olá Pessoas', 'Hello Guys', 'Hii People', 'Oiiiii Gente'];
  const [one, two] = randomNumber(0, emojis.length -1, 2);
  const [oneSaudation] = randomNumber(0, saudations.length -1, 1);
  
  const data = groupByColumn(items, columnName);
  
  const firstMessage = 
    `${saudations[oneSaudation]} ${emojis[one]} ${emojis[two]}\nSegue Informativo das pendências\n\n` + 
    `Vencimento: <b>${getDatetimeNow().replace(',', ' às')}</b>\n\n` +
    `Quantidade de Pendências: <code>${items?.length || 0}</code>\n` + 
    `${items?.length === 0 ? 'Nenhuma Pendência 👏👏👏👏👏🥳🥳🥳🥳' : ''}`;

  messages.push(firstMessage);

  if(items?.length > 0) {
    let aux = 0;
    Object.entries(data).forEach(([key, item]) => {
      let text = `<b>${columnName}</b> - <b><i>${key}</i></b>\n\n`;

      item.forEach((i, idx) => {
        const response = mergeItem(i, aux++, columnBold, removeColumns);

        if((text.length + response.length) > 4096) {
          messages.push(text);
          text = response;
        } else {
          text += response;
        }

        if(idx === item.length - 1) {
          messages.push(text);
        }
      });
    });
  }
  return messages;
}

const generateError = (error) => {
  const message = 
    `Eiiita pessoal, vi aqui que ocorreu algum problema ao buscar os dados ou realizar algum processamento 😭😭😭😭😭\n\n\n` + 
    'Descrição do erro: ' + `<pre>${error}</pre>`;
  return message;
}

const generateAbout = (name) => {
  const message = `Olá <b>${name}</b>, Tudo bem❓\n` + 
    `Esse bot foi criado por <a href="instagram.com/sidao_rodrigues">@Sidão</a>\n\n` + 
    `Visite-o 😌😌😌😌😌😌😌😌👇🏻\n<a href="${URLS.GITHUB}">GitHub</a>\n<a href="${URLS.LINKEDIN}">Linkedin</a>`;
  return message;
}

const generateCommandList = (name) => {
  const message = 
    `Olá <b>${name}</b>, esta é a lista de comandos disponíveis:\n\n`+ 
    '<b><i>Lista de Comandos</i></b>\n\n' + 
    
    '/informacoesdiaria - Listar pendências diária\n\n' +
    '/criador - Sobre meu criador\n\n' +
    '/urlgoogle - Definir URL da planilha google\n\n' +
    '/definirgrupo - Definir grupo principal das notificações\n\n' + 
    '/comandos - Listar comandos disponíveis\n\n' +
    '/rotinas - Listar horários das notificações\n\n' +
    '/ajuda - Listar comandos disponíveis\n\n';
  return message;
}

const generateRoutineInfo = (name, group) => {
  const message = 
    `Olá <b>${name}</b>, a rotina de informações diárias no grupo ` + 
    `<a href="tg://user?id=${group.id}">@${group.title}</a> está sendo ` + 
    'de <b><i>Segunda à Sábado</i></b> nos horários de <b>9h</b> e <b>15h</b>😌';
  return message;
}

// scenes 

const generateURLContext = (data, step) => {
  const steps = {
    1: data.urlSheet ? 
      `Olá ${data.name}❗️\n\nJá <b>existe</b> uma URL do Google Sheets cadastrada.\n\nInsira uma nova URL do Google Sheets para ser substituída:` : 
      `Olá ${data.name}❗️\n\nInsira uma URL do Google Sheets para ser cadastrada:`,
    2: data.url ? 
      `URL Salva com sucesso❗️\n\nURL: <a href="${data.url}">URL Google</a>` : 
      `URL inválida: <b>${data.url}</b>`,
  }
  return steps[step] ?? generateError('Erro na geração do contexto de <b>generateURLContext</b>');
} 

const generateGroupIdDefault = (data, step) => {
  const steps = {
    1: data.group?.id ? 
      `Olá ${data.name}❗️\n\nJá existe um grupo cadastrado <a href="tg://user?id=${data.group.id}">@${data.group.title}</a> ` +
        `para receber as notificações diárias.\n\nDeseja atualizar para esse grupo atual <b>${data.newGroup.title}</b>` + 
        `(<a href="tg://user?id=${data.newGroup.id}">@${data.newGroup.title}</a>)❓` : 
      `Olá ${data.name}❗️\nDeseja informar o grupo <b>${data.newGroup.title}</b>` +
        `(<a href="tg://user?id=${data.newGroup.id}">@${data.newGroup.title}</a>) para receber as notificações diárias❓`,
    yes_option: {
      message: `O grupo <b>${data.newGroup.title}</b>(<a href="tg://user?id=${data.newGroup.id}">@${data.newGroup.title}</a>) ` + 
        `foi ${data.isUpdate ? 'atualizado' : 'salvo'} para receber as notificações diárias❗️ 😎`,
      answerCbQuery: data.isUpdate ? 'Salvo com sucesso' : 'Atualizado com sucesso'
    },
    no_option: `O grupo <b>${data.newGroup.title}</b>(<a href="tg://user?id=${data.newGroup.id}">@${data.newGroup.title}</a>) ` +
      `não foi adicionado para receber as notificações diárias❗️ 🥲`,
  }
  return steps[step] ?? generateError('Erro na geração do contexto de <b>generateGroupIdDefault</b>');
}

module.exports = {
  generateByCompany,
  generateAbout,
  generateCommandList,
  generateRoutineInfo,
  generateError,
  generateURLContext,
  generateGroupIdDefault
}