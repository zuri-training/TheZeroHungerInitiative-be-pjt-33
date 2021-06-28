const { createLogger, addColors, format, transports } = require('winston');

/*
  1) All the levels in the below object is used to control the logging output. just like priority. 
  
  2) where we create the logger itself below, if we supply warn for example to the level property on that object, in our code everyplace we use .info, .debug and .warn to log to the console will be log, except that of error.
  
  3)like i have said it's like PRIORITIZE.
  info < debug < warn < error
*/
const customConfig = {
  levels: {
    error: 0,
    info: 1,
    warn: 2,
    debug: 3,
  },
  colors: {
    error: 'white redBG',
    info: 'black blueBG',
    warn: 'yellowBG',
    debug: 'greenBG'
  }
};

// This is the format our logs will be seen in the console and then save to the logger.log file
const myFormat =  format.printf(info => `${info.level}: ${info.message}: ${info.timestamp}`);

const level = (() => {
  const env = process.env.NODE_ENV;
  return env === "development" ? "debug" : "error";
})();

// Telling Winston to add colour
addColors(customConfig.colors);

const logger = createLogger({
  level,
  levels: customConfig.levels,
  format: format.combine(
    format.colorize({all: true}),
    format.simple(),
    format.timestamp(),
    myFormat
  ),
  transports:[
    new transports.Console(),
    new transports.File({
      level: "error",
      filename: './logger/logs.log',
      format: format.combine(
        format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        format.align(),
        myFormat
      )
    })
  ]
});

module.exports = logger;
