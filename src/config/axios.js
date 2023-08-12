const axios = require('axios');
const { getDateNowMonth, getTokeURL } = require('./util');

const getSheetGoogle = async (name) => {
  const sheetName = name ?? getDateNowMonth();
  const url = `https://docs.google.com/spreadsheets/d/${getTokeURL()}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  return axios(url, { responseType: 'blob' });
}

const reloadRenderUrl = async () => {
  const url = (process.env.URL_CLOUD ? `${process.env.URL_CLOUD}/info?apikey=${process.env.API_AUTHORIZATION}` : '') || 
    'https://baconipsum.com/api/?type=all-meat&paras=1&start-with-lorem=1';
  return axios(url);
}

module.exports = {
  getSheetGoogle,
  reloadRenderUrl
}