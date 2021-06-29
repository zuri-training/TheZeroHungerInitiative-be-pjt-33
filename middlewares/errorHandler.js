const AppError = require('../utils/appError');

const sendErrorInDev = (errorObject, res) => {
  console.log('❌', errorObject);
  res.status(errorObject.statusCode).json({
    status: errorObject.status, message: errorObject.message, error: errorObject, stack: errorObject.stack
  })
}

const sendErrorInProduction = (errorObject, res) => {
  let details;

  // Mainly handles invalid data types. Can handle bad ObjectId
  if (errorObject.name === 'CastError') {
    errorObject = new AppError('Invalid data type provided', 400);
  }

  // Mongoose duplicate key error
  if (errorObject.name === 'MongoError' && errorObject.code === 11000) {
    let duplicateError = errorObject.message.split('dup key: ').pop();
    duplicateError = duplicateError.slice(3 - 1, duplicateError.length - 3).split(': "');
    
    details = { [duplicateError.shift()]: duplicateError.pop() }
    errorObject = new AppError('A record exists with some of your entered values', 400);
  }

  // Mongoose validation error
  if (errorObject.name === 'ValidationError') {
    details = Object.entries(errorObject.errors).reduce((previous, [key, value]) => {
      return { ...previous, [key]: value.properties.message }
    }, {});
    
    errorObject = new AppError('Validation failed. Please enter all required values correctly', 400);
  }

  res.status(errorObject.statusCode).json({
    status: errorObject.status, message: errorObject.message, details
  })
}

module.exports = (errorObject, req, res, next) => {
  errorObject.statusCode = errorObject.statusCode || 500;
  errorObject.status = errorObject.status || 'error';
  
  (process.env.NODE_ENV === 'development') && sendErrorInDev(errorObject, res);
  (process.env.NODE_ENV === 'production') && sendErrorInProduction(errorObject, res);
}