const { 
  randomNumber,
  getDatetimeNow,
  getDateNowMonth,
  getAppVersion,
  getDateNow,
  getDateNowYear,
  getDateNowMonthNumeric
} = require("../config/util");

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
  return `<code><b>ITEM</b> ${idx+1 < 10 ? (emojisNumbers[0]+''+emojisNumbers[idx+1]) : (emojisNumbers[String(idx+1)[0]]+''+emojisNumbers[String(idx+1)[1]])}\n` +
    Object.entries(item).reduce((acc, [key, value], idx, obj) => {
      const removeColum = removeColumns.some(column => key.toUpperCase().includes(column));
      const isBoldValue = columnBold.includes(key) ? `<b>${verifyValue(value)}</b>` : verifyValue(value);
      if(!removeColum) {
        return `${acc}${idx < obj.length && idx !== 0 ? ' | ' : ''}${isBoldValue}${idx === obj.length - 1 ? '</code>\n\n\n' : ''}`;
      } else {
        return `${acc}${idx === obj.length - 1 ? '</code>\n\n\n' : ''}`;
      }
  }, '');
}

const mergeCompany = (item) => {
  const [key, value] = Object.entries(item)[0];
  return `\t📌 - <b>${key}</b>: <code>${String(value).padStart(3, '0')}</code>\n`;
}

// templates

const generateByCompany = (
  items,
  {
    firstMsg,
    removeColumns = ['CHAVE PIX', 'PIX', 'STATUS'],
    columnBold = 'DESCRIÇÃO',
    columnName = 'EMPRESA',
    sendFirstMsg = true,
  }
) => {

  const messages = [];
  const emojis = [
    '😎', '🥸', '🤓', '🤗', '😼', '🧙‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '👯', '💃', '🕺', '👽', 
    '👾', '🤖', '🤌', '🤹🏻‍♀️', '🤹🏻', '🤹🏻‍♂️', '🧘🏻‍♀️', '🧘🏻', '🧘🏻‍♂️', '🌞', '💤', '📣', '📢', '🔔'
  ];
  const saudations = ['Oiiie Pesssoal', 'Olá Pessoas', 'Hello Guys', 'Hii People', 'Oiiiii Gente'];
  const [one, two] = randomNumber(0, emojis.length -1, 2);
  const [oneSaudation] = randomNumber(0, saudations.length -1, 1);
  
  const data = groupByColumn(items, columnName);
  
  const firstMessage = firstMsg ?? (
    `${saudations[oneSaudation]} ${emojis[one]} ${emojis[two]}\nSegue Informativo das pendências\n\n` + 
    `Vencimento: <b>${getDatetimeNow().replace(',', ' às')}</b>\n\n` +
    `Quantidade de Pendências: <code>${items?.length || 0}</code>\n` + 
    `${items?.length === 0 ? 'Nenhuma Pendência 👏👏👏👏👏🥳🥳🥳🥳' : ''}`);

  if(sendFirstMsg) {
    messages.push(firstMessage);
  }

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
    'Descrição do erro: ' + `<code>${error}</code>`;
  return message;
}

const generateAbout = (name) => {
  const message = `Olá <b>${name}</b>, Tudo bem❓\n` + 
    `Esse bot foi criado por <a href="instagram.com/sidao_rodrigues">@Sidão</a>\n\n` + 
    `Visite-o 😌😌😌😌😌😌😌😌👇🏻\n<a href="${URLS.GITHUB}">GitHub</a>\n<a href="${URLS.LINKEDIN}">Linkedin</a>`;
  return message;
}

const generateBotAbout = (name, botName) => {
  const message = `Olá <b>${name}</b>, Tudo bem❓\n\n` +
    `Eu sou o Bot <b>${botName}</b> e ajudo nas rotinas diárias com informações muiiito importantes 🤩🤩🥰😎😎🤖\n\n` +
    `Atualmente estou na versão: <b>${getAppVersion()}</b> 👽\n` +
    'Para saber mais sobre meu criador /criador';
  return message;
}

const generateCommandList = (name, botName) => {
  const message = 
    `Olá <b>${name}</b>, esta é a lista de comandos disponíveis:\n\n`+ 
    '<b><i>Lista de Comandos</i></b>\n\n' + 
    
    '/start - Listar comandos disponíveis\n\n' +
    '/ajuda - Listar comandos disponíveis\n\n' +
    `/sobre - Sobre o <b>${botName}</b>\n\n` +
    '/criador - Sobre o meu criador\n\n' +
    '/urlgoogle - Definir URL da planilha google\n\n' +
    '/definirgrupo - Definir grupo principal das notificações\n\n' + 
    '/comandos - Listar comandos disponíveis\n\n' +
    '/rotinas - Listar horários das notificações\n\n' +
    '/informacoesdiaria - Listar pendências diária\n\n' +
    '/filtrosimples - Filtrar pendências por opções simples\n\n' +
    '/pendenciasdomes - Listar quantidade de pendências do mês\n\n';
  return message;
}

const generateRoutineInfo = (name, group) => {
  const message = 
    `Olá <b>${name}</b>, a rotina de informações diárias no grupo ` + 
    `<a href="tg://user?id=${group.id}">@${group.title}</a> está sendo ` + 
    'de <b><i>Segunda à Sábado</i></b> nos horários de ' + 
    '<b>8h</b>, <b>10h</b>, <b>12h</b>, <b>14h</b>, <b>16h</b> e <b>18h</b>😌';
  return message;
}

const generateBacklogMonth = (
  name = '', 
  items, 
  { 
    firstMsg,
    firstText,
    lastMsg,
    byCommand = false, 
    byDailyRoutine = true, 
    shortInfo = true, 
    listAll = false,
    sendFirstMsg = true,
  }
) => {
  const messages = [];
  
  const prefix = byDailyRoutine || byCommand ? '' : `Olá <b>${name}</b>, `;
  const firstMessage = firstMsg ?? (
    `📈📈📈📈📈📈📈📈📈📈📈📈📈\n\n${prefix}Segue informativo de quantidade de pendências por dia,` + 
    ` referente a planilha do mês de: <b>${getDateNowMonth()}${getDateNowYear()}</b>`);
  
  if(sendFirstMsg) {
    messages.push(firstMessage);
  }

  if(items.length > 0) {
    const data = groupByColumn(items, 'VENCIMENTO');
    let values = [];

    Object.entries(data).forEach(([key, item]) => {
      const quantityPerCompany = Object.entries(groupByColumn(item, 'EMPRESA')).map(([key, value]) => ({ [key]: value.length }));
      values.push({
        quantityPerCompany: quantityPerCompany,
        quantityPerDay: String(item.length).padStart(3, '0'),
        dateNumber: key.split('/').reverse().join(''),
        date: key,
      });
    });

    values = values.sort((a, b) => a.dateNumber > b.dateNumber ? 1 : (a.dateNumber < b.dateNumber ? - 1 : 0));

    if(shortInfo) {
      const dateNow = getDateNow().split('/').reverse().join('');
      
      if(!listAll) {
        values = values.filter(item => item.dateNumber < dateNow);
      }

      let text = firstText ?? '📅 <i><b>Vencimentos por Dias</b></i> 📅\n\n';
      values.forEach((item, idx) => {
        const dateText = `🗓️ ${item.date || 'Sem Data'}: <code>${item.quantityPerDay}</code>\n`;
  
        if((text.length + dateText.length) > 4096) {
          messages.push(text);
          text = dateText;
        } else {
          text += dateText;
        }
  
        if(idx === values.length - 1) {
          messages.push(text);
        }
      });
    } else {
      const title = firstText ?? '📅 <i><b>Vencimentos por Dias</b></i> 📅\n\n';
      messages.push(title);

      let dateText = '';
      values.forEach((item, idx) => {
        dateText += `\n🗓️ ${item.date || 'Sem Data'}: <code>${item.quantityPerDay}</code>\n`;
        
        const response = item.quantityPerCompany.reduce((acc, item) => {
          return acc + mergeCompany(item);
        }, '');

        if((dateText.length + response.length) > 4096) {
          messages.push(dateText);
          dateText = response;
        } else {
          dateText += response;
        }

        if(idx === values.length - 1) {
          messages.push(dateText);
        }

        /*let dateText = `🗓️ <pre>${item.date}: ${item.quantityPerDay}</pre>\n\n`;

        item.quantityPerCompany.forEach((i, idx) => {
          const response = mergeCompany(i);

          if((dateText.length + response.length) > 4096) {
            messages.push(dateText);
            dateText = response;
          } else {
            dateText += response;
          }

          if(idx === item.quantityPerCompany.length - 1) {
            messages.push(dateText);
          }
        });*/
      });
    }

  } else {
    const lastMessage = lastMsg ?? 'Não há pendências nesse mês 👏👏🥳🥳🤗🤗';
    messages.push(lastMessage);
  }
  return messages;
}

// scenes 

const generateURLContext = (data, step) => {
  const steps = {
    1: data.urlSheet ? 
      `Olá ${data.name}❗️\n\nJá <b>existe</b> uma URL do Google Sheets cadastrada.\n\n` + 
        `Insira uma nova URL do Google Sheets para ser substituída (para cancelar digite <code>cancelar</code>):` : 
      `Olá ${data.name}❗️\n\nInsira uma URL do Google Sheets para ser cadastrada (para cancelar digite <code>cancelar</code>):`,
    2: {
      message: data.url ? 
        `URL Salva com sucesso❗️\n\nURL: <a href="${data.url}">URL Google</a>` : 
        `URL inválida: <b>${data.url}</b>`,
      answerCbQuery: 'Operação cancelada com sucesso❗️',
    }
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

const generateBacklogInfo = (data, step) => {
  const steps = {
    1: {
      message: 'Deseja obter os dados simplificados ou completos?',
      buttons: [
        [ 
          { text: 'SIMPLIFICADOS', callback_data: 'short_option' },
          { text: 'COMPLETOS', callback_data: 'long_option' } 
        ]
      ]
    }
  };
  return steps[step] ?? generateError('Erro na geração do contexto de <b>generateBacklogInfo</b>');
}

const generateSimpleFilter = (data, step) => {

  const generateButtons = (perLine = 7) => {
    const days = 29 + (getDateNowMonthNumeric() === 2 ? 0 : 
      ([4, 6, 9, 11].includes(getDateNowMonthNumeric()) ? 1 : 2)
    );

    return Array(Math.ceil(days / perLine)).fill(0)
      .map((_, idx, arr) => {
        const buttons = [...Array(days).keys()].slice(idx * perLine, (idx + 1) * perLine)
          .map((day) => ({ text: String(day + 1).padStart(2, '0'), callback_data: String(day + 1).padStart(2, '0') }));
        
        if(idx === arr.length - 1) {
          buttons.push({ text: 'Sem Data', callback_data: 'S/D' });
        }
        return buttons;
      })
  }

  const steps = {
    1: {
      message: 
        `Filtrar pendências referente a planilha do mês de: <b>${getDateNowMonth()}${getDateNowYear()}</b>\n` +
        `Selecione um dia.`,
      buttons: generateButtons(data?.perLine)
    },
    2: {
      message: 
        `📈📈📈📈📈📈📈📈📈📈📈📈📈\n\n` +
        `Filtrando pendências pela data: <b>${data?.seletedDay}</b>.\n` +
        `Referente a planilha: <b>${getDateNowMonth()}${getDateNowYear()}</b>`,
      firstText: '📅 <i><b>Quantidade pela Data</b></i> 📅\n\n',
      lastMessage: 'Não há pendências nesse dia 👏👏🥳🥳🤗🤗'
    },
    // wrong_day: `O valor (<b>${data.wrongDay}</b>) não é valido❗️🥲\n\nPor favor, informe um dia válido (1 a 31):`,
  };
  return steps[step] ?? generateError('Erro na geração do contexto de <b>generateSimpleFilter</b>');
}

module.exports = {
  generateByCompany,
  generateBacklogMonth,
  generateAbout,
  generateBotAbout,
  generateCommandList,
  generateRoutineInfo,
  generateError,
  generateURLContext,
  generateGroupIdDefault,
  generateBacklogInfo,
  generateSimpleFilter
}