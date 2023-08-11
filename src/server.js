require('dotenv').config();
const { initTelegraf } = require('./bot/telegraf');
const { app } = require('./config/app');
const { initSchedule } = require('./crontab/crontab');

app.listen(process.env.API_PORT || 8080, async () => {
  console.log(`Server started on port ${process.env.API_PORT || 8080}`);
  await initTelegraf();
});

initSchedule();