require('dotenv').config();
const { initTelegraf } = require('./bot/telegraf');
const { app } = require('./config/app');
const { mainSchedule } = require('./crontab/cronjob');


app.listen(process.env.API_PORT || 8080, async () => {
  console.log(`Server started on port ${process.env.API_PORT || 8080}`);
  await initTelegraf()
    .then(() => {
      mainSchedule.start();
    });
})