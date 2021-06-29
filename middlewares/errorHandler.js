const sendErrorInDev = (errorObject, res) => {
  console.log('❌', errorObject);
  res.status(errorObject.statusCode).json({
    status: errorObject.status, message: errorObject.message, error: errorObject, stack: errorObject.stack
  })
}

const sendErrorInProduction = (errorObject, res) => {
  if (errorObject.isOperational) {
    res.status(errorObject.statusCode).json({
      status: errorObject.status, message: errorObject.message
    })
  } else {
    console.log('💥', err);
    res.status(errorObject.statusCode).json({
      status: errorObject.status, message: 'Something went wrong. Please try again later!'
    })
  }
}

module.exports = (errorObject, req, res, next) => {
  errorObject.statusCode = errorObject.statusCode || 500;
  errorObject.status = errorObject.status || 'error';
  
  (process.env.NODE_ENV === 'development') && sendErrorInDev(errorObject, res);
  (process.env.NODE_ENV === 'production') && sendErrorInProduction(errorObject, res);
}