const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.API_KEY_TELEGRAM);

let permissionsUsers = process.env.USERS_ID ? process.env.USERS_ID.split(';').map(id => +id) : [];
let group = {
  id: process.env.GROUP_ID || '',
  title: process.env.GROUP_NAME || 'Padrão'
}
let urlSheets = process.env.URL_SHEETS || '';

const setGroup = (data) => {
  data?.id && (group.id = data.id);
  data?.title && (group.title = data.title);
}

const getGroup = () => {
  return group;
}

const setUrlSheet = (url) => {
  urlSheets = url;
}

const getUrlSheet = () => {
  return urlSheets;
}

const setUserId = (userId) => {
  if(userId) {
    permissionsUsers.push(+userId);
  }
}

const getUsersPermissions = () => {
  return permissionsUsers;
}

module.exports = {
  bot,
  getGroup,
  setGroup,
  getUrlSheet,
  setUrlSheet,
  setUserId,
  getUsersPermissions
}

// id mary 1098025812