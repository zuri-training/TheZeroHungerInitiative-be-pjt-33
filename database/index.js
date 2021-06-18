const mongoose = require("mongoose");

class MongoDBConnection {
  constructor(logger) {
    this.logger = logger;
    this.dbUrl = process.env.DB;
    this.logger.info("Initializing MongoDB connection");
  }
  
  async connect() {
    try {
      await mongoose.connect(this.dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
      
      this.logger.info("Db connection successful");
    } catch (e) {
      console.log("💥", e);
      return this.logger.error(`💥, ${e}`);
    }
      this.logger.info("Initialized MongoDB connection");
  }
}

module.exports = MongoDBConnection;