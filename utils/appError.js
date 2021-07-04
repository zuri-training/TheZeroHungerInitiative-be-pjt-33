class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'failure' : 'error';
    this.isOperational = true;
    if (process.env.NODE_ENV === 'development') Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;