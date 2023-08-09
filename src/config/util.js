const csvToJson = require('csvtojson');

const getTokeURL = () => {
  const url = process.env.URL_SHEETS || '';
  return url.substring((url.match('/d/')?.index + 3), url.match('/edit')?.index);
}

const getDateNowMonth = () => {
  const date = new Date();
  return date.toLocaleDateString('pt-br', { month: 'long' }).toUpperCase();
}

const getDateNow = () => {
  const date = new Date();
  return date.toLocaleDateString('pt-br');
}

const getDatetimeNow = () => {
  const date = new Date();
  return date.toLocaleString('pt-br');
}

const randomNumber = (min = 1, max = 1, quantity = 1) => {
  const random = () => Math.floor(Math.random() * (max - min + 1)) + min;
  return [...Array(quantity).keys()].map(i => random())
}

const csvJSON = (csvStr) => {
  const lines = csvStr.split('\n');
  const csv = [];
  const headers = lines[0].split(',').map(item => item.replaceAll('"', ''));

  for (const line of lines) {
    const obj = {};
    const currentline = line.split(',').map(item => item.replaceAll('"', ''));

    for(let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    csv.push(obj);
  }
  return csv;
}

const convertCsvToJson = async (csv, trimColumn = true, options = {}) => {
  const json = await csvToJson(options).fromString(csv);

  return trimColumn ? json.map(item => (
    Object.entries(item).reduce((acc, [key, value]) => ({
      ...acc, [key.trim().split(' ')[0]]: value }), {})
  )) : json;
}

module.exports = {
  getDateNowMonth,
  getDateNow,
  getTokeURL,
  convertCsvToJson,
  randomNumber,
  getDatetimeNow
}