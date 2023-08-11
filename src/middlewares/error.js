const AppError = require("../error/appError");

const errorResolve = (error, req, res, next) => {
  let html = `<h1>Status: error (500)</h1>` + 
  `<p style="font-size: 20px;">Message: Internal Server erro</p>` +
  `<p style="font-size: 20px;">Stack: ${error.message}</p>`;
  
  res.set('Content-Type', 'text/html');
  
  if(error instanceof AppError) {
    html = `<h1>Status: ${error.status} (${error.statusCode})</h1>` + 
      `<p style="font-size: 20px;">Message: ${error.message}</p>` + 
      (error.obs ? `<p style="font-size: 20px;">Stack: ${error.obs}</p>` : '');
  }
  return res.send(Buffer.from(html));
};

const resourceNotFound = (req, res) => {
  res.set('Content-Type', 'text/html');
  const html = `<h1>Status: error (404)</h1>` + 
    `<p style="font-size: 20px;">Message: resource not found</p>`;
  return res.send(Buffer.from(html));
}

module.exports = {
  errorResolve, 
  resourceNotFound
}