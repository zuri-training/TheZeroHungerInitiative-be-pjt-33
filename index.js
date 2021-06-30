const http = require('http');
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const socketio = require('socket.io');
// The dotenv should be immediately cofig, before the logger because it reading from the env variable
const dotenv = require("dotenv").config();
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");


const logger = require("./utils/logger");
const MongoDBConnection = require("./database");
const AppError = require("./utils/appError");
const globalErrorHandling = require("./controllers/errorController");
const swaggerDocumentation = YAML.load("./documentation/index.yaml");

// Routes
const donationRoute = require("./routes/donationRoute");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const conversationRoute = require("./routes/conversationRoute");


class App {
  constructor() {
    this.logger = logger;
    this.logger.info(`Starting application...`);
    this.init();
    this.db = new MongoDBConnection(this.logger);
  }
  
  init() {
    this.logger.info("Initializing express app...");
    this.environment = process.env.NODE_ENV;
    this.port = process.env.PORT;

    this.app = express();
    
    // Setting up socket.io
    this.server = http.createServer(this.app);
    this.io = socketio(this.server);
    
    // Calling socket io method
    this.socketIoDefinition();
    
    this.app.enable("trust proxy");
    
    // Parsing request body
    this.parsingBody();
    
    //Http security
    this.httpSecurity();
    
    // configure cloudinary
    //this.configureCloudinary();
    
    // Testing Middleware
    this.app.use((req, res, next) => {
      this.logger.info("Testing Middleware");
      next();
    });
    //this.app.set("app", this);
    
    // Mounting roues
    this.mountingRoutes();
    
    // This must be the last Middleware, used for handling global error
    this.app.use(globalErrorHandling);
    this.logger.info(`Initialized Application`);
  }

  start() {
    this.server.listen(this.port, () => {
      this.logger.info(`Now listening on port ${this.port}. in ${this.environment}`);
    });
    this.startTime();
    
    // Connecting to MongoDB
    this.db.connect();
  }
  
  socketIoDefinition() {
    this.io.on("connection", (socket) => {
      console.log("a user connected");
    });
  }
  
  parsingBody() {
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    this.app.use(cookieParser());
    this.app.use(cors());
  }
  
  httpSecurity() {
    // Http Header
    this.app.use(helmet());
    // Mongoose sanitize
    this.app.use(mongoSanitize());
    // Xss attack
    this.app.use(xss());
    this.app.use(morgan("dev"));
  }
  
  mountingRoutes() {
    // Documentation routes
    this.app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocumentation));
    
    this.app.use("/api/v1/users", userRoute);
    this.app.use("/api/v1/donate", donationRoute);
    this.app.use("/api/v1/message", messageRoute);
    this.app.use("/api/v1/conversation", conversationRoute);
    
    
    // 404 Not Found. must be the last route
    this.app.all("*", (req, res, next) => {
      const message = `Can't find ${req.originalUrl} on this server`;
      next(new AppError(message, 400));
    });
  }
  
  configureCloudinary() {
    cloudinary.config({ 
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY, 
      api_secret: process.env.API_SECRET,
      secure: true
    });
  }

  startTime() {
    this.logger.info(`server started in ${process.uptime()}.`);
    return process.uptime();
  }
}

// Instance of this class
new App().start();
