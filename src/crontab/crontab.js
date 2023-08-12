const crontab = require('node-cron');
const { dailyInfo } = require('../bot/commands');

let job = null;
let crontabExpression = process.env.CRONTAB_EXPRESSION || '0 8,10,12,14,16,18 * * 1-6';//'* 9,15 * * 1-6';

const initSchedule = () => {
  console.log('Init crontab', crontabExpression);
  job = crontab.schedule(crontabExpression, async () => {
    const dateUTC = (new Date()).toLocaleString('pt-BR', { timeZoneName: 'longOffset', timeZone: 'America/Sao_Paulo' });
    console.log('CALL: ', (new Date().toLocaleString('pt-BR')), ' <> UTC: ', dateUTC);
    await dailyInfo();
  }, {
    timezone: 'America/Sao_Paulo'
  });
  startSchedule();
}

const startSchedule = () => {
  console.log('Start job...');
  job?.start();
}

const stopSchedule = () => {
  console.log('Stoped job...');
  job?.stop();
}

const setNewExpressionSchedule = (expression) => {
  stopSchedule();
  crontabExpression = expression;
  initSchedule();
}

module.exports = {
  initSchedule,
  startSchedule,
  stopSchedule,
  setNewExpressionSchedule
}