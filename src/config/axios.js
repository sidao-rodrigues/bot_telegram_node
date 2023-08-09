const { getDateNowMonth, getTokeURL } = require('./util');
const axios = require('axios');

const getSheetGoogle = async (name) => {
  const sheetName = name ?? getDateNowMonth();
  const url = `https://docs.google.com/spreadsheets/d/${getTokeURL()}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  return axios(url, { responseType: 'blob' });
}

module.exports = {
  getSheetGoogle
}