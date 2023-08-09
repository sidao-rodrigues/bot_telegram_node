const { getSheetGoogle } = require("../config/axios");
const { convertCsvToJson, getDateNow } = require("../config/util");

const getListBySheetName = (name) => {
  return getSheetGoogle(name)
    .then(async ({ data }) => {
      const json = await convertCsvToJson(data.toString());
      const response = json.filter(item => {
        return item.VENCIMENTO && item.VENCIMENTO === getDateNow() && !item.STATUS.includes('PAGAMENTO');
        //return item.VENCIMENTO && item.VENCIMENTO === '10/08/2023' && 
        // return item.STATUS.includes('PAGAMENTO') //getDateNow();
      })
      return response;
    });
}

module.exports = {
  getListBySheetName
}