const crontab = require('node-cron');
const { informations } = require('../bot/commands');

const mainSchedule = crontab.schedule('* 9,15 * * 1-6', async () => {
  await informations();
});

module.exports = {
  mainSchedule
}