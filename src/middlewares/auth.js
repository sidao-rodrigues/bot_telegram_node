const AppError = require("../error/appError");

const decodeBase64 = (base64) => {
  return Buffer.from(base64, 'base64').toString('ascii');
}

const getAuthAPI = () => {
  const credentials = decodeBase64(process.env.API_AUTHORIZATION);
  const [userAPI, passwordAPI] = credentials.split(':');
  return {
    userAPI,
    passwordAPI
  };
}

const authResolve = (req, res, next) => {
  let authHeader = req.headers.authorization;
  
  if(!authHeader) {
    const apiKey = req.query.apikey;
    if(!apiKey) {
      throw new AppError('Credentials is missing', 'Unauthorized', 401, '');
    }
    authHeader = ' ' + apiKey;
  }
  
  const [, base64Credentials] = authHeader.split(' ');
  const credentials = decodeBase64(base64Credentials);
  const [user, password] = credentials.split(':');
  
  const { userAPI, passwordAPI } = getAuthAPI();
  
  if(user !== userAPI || password !== passwordAPI) {
    throw new AppError('Invalid credentials', 'Unauthorized', 401, '');
  }
  return next();
}

module.exports = authResolve;