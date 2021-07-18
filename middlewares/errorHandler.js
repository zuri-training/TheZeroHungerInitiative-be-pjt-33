const AppError = require('../utils/appError');

const sendErrorInDev = (errorObject, res) => {
  console.log('❌', errorObject);
  res.status(errorObject.statusCode).json({
    status: errorObject.status, message: errorObject.message, error: errorObject, stack: errorObject.stack
  })
}

const sendErrorInProduction = (errorObject, res) => {
  let details;

  // Handles bad Mongo ObjectId
  if (errorObject.name === 'CastError') {
    errorObject = new AppError('Requested resource not found!', 400);
  }

  // Mongoose duplicate key error
  if (errorObject.name === 'MongoError' && errorObject.code === 11000) {
    let duplicateError = errorObject.message.split('dup key: ').pop();
    duplicateError = duplicateError.slice(3 - 1, duplicateError.length - 3).split(': "');
    
    details = { [duplicateError.shift()]: duplicateError.pop() }
    errorObject = new AppError('A record exists with some of your entered values', 400);
  }

  // Mongoose validation & assertion errors
  if (errorObject.name === 'ValidationError') {
    const errorArray = Object.entries(errorObject.errors);

    try {
      errorObject = new AppError('Validation failed. Please enter all required values correctly', 400);

      details = errorArray.reduce((previous, [key, value]) => {
        return { ...previous, [key]: value.properties.message }
      }, {});
    } catch (error) {
      errorObject = new AppError('Assertion failed. Please enter valid values', 400);

      details = errorArray.reduce((previous, [key, value]) => {
        return { ...previous, [key]: {
          'reason': value.reason.code,
          'value': value.details,
          'valueType': value.valueType,
          'requiredType': value.kind
        } }
      }, {})
    }
  }

  // Error connecting to external services [Cloudinary for now]
  // (Google SMTP Server & Paystack gets handles already)
  if (errorObject?.error) {
    // (errorObject?.error.hostname === 'api.cloudinary.com')

    if (errorObject?.error.code === 'ENOTFOUND' && errorObject?.error?.hostname) {
      errorObject = new AppError('An error occured while connecting to a required external service', 500);
    }
  }

  res.status(errorObject.statusCode || 500).json({
    status: errorObject.status || 'failure', message: errorObject.message || 'Internal server error', details
  })
}

module.exports = (errorObject, req, res, next) => {
  errorObject.statusCode = errorObject.statusCode || 500;
  errorObject.status = errorObject.status || 'error';
  
  (process.env.NODE_ENV === 'development') && sendErrorInDev(errorObject, res);
  (process.env.NODE_ENV === 'production') && sendErrorInProduction(errorObject, res);
}