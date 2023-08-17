const { getSheetGoogle } = require("../config/axios");
const { convertCsvToJson, getDateNow } = require("../config/util");

const getListBySheetName = async (name, filter) => {
  return getSheetGoogle(name)
    .then(async ({ data }) => {
      const json = await convertCsvToJson(data.toString());
      const filterBy = filter || ((item) => {
        return item.VENCIMENTO && item.VENCIMENTO === getDateNow() && !item.STATUS.includes('PAGAMENTO');
      });
      const response = json.filter(filterBy);
      // const response = json.filter(item => {
      //   return item.VENCIMENTO && item.VENCIMENTO === getDateNow() && !item.STATUS.includes('PAGAMENTO');
      //   //return item.VENCIMENTO && item.VENCIMENTO === '10/08/2023' && 
      // })
      return response;
    });
}

module.exports = {
  getListBySheetName
}