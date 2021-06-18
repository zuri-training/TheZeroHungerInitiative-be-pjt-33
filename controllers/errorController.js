const sendErrorInDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack
  });
}

const sendErrorInProd = (err, res) => {
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  console.log("💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: "Something went wrong 😱, try again later!!!"
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  
  if(process.env.NODE_ENV === "development") {
    sendErrorInDev(err, res);
  }
  if(process.env.NODE_ENV === "production") {
    sendErrorInProd(err, res);
  }
};