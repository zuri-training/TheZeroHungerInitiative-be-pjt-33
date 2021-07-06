const mongoose = require('mongoose');

class MongoDBConnection {
  constructor(logger) {
    this.logger = logger;
    this.dbUrl = process.env.DB;
    this.devDb = process.env.DEV_DB;
    this.logger.info('Initializing MongoDB connection');
  }
  
  async connect() {
    try {
      const { connection } = await mongoose.connect(process.env.NODE_ENV === 'production' ? this.dbUrl : this.devDb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
      
      this.logger.info(`🛢 | Mongoose connected successfully to ${connection.host}`)
    } catch (e) {
      console.log('💥', e);
      return this.logger.error(`💥, ${e}`);
    }
      this.logger.info('Initialized MongoDB connection');
  }
}

module.exports = MongoDBConnection;