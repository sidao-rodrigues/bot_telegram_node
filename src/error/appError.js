class AppError extends Error {
  _status;
  _message;
  _statusCode;
  _obs;
  
  constructor(message, status = 'error', statusCode = 400, obs = '') {
    super(message);
    this._message = message;
    this._status = status;
    this._obs = obs;
    this._statusCode = statusCode;
  }

  get status() {
    return this._status;
  }

  get message() {
    return this._message;
  }

  get statusCode() {
    return this._statusCode;
  }
  
  get obs() {
    return this._obs;
  }
}

module.exports = AppError;