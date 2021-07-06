const path = require('path');
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
const {addConnectedUser, removeConnectedUser, getCurrentUser} = require("./utils/socketHelper");
const MongoDBConnection = require("./database");
const AppError = require("./utils/appError");
const errorHandler = require("./middlewares/errorHandler");
const swaggerDocumentation = YAML.load("./documentation/index.yaml");

// Routes
const donationRoute = require("./routes/donationRoute");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const conversationRoute = require("./routes/conversationRoute");
const viewRoute = require("./routes/viewRoute");


class App {
  constructor() {
    this.logger = logger;
    this.logger.info(`Starting application...`);
    // Used to store online users with their "id" and "socketId"
    this.users = [];
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
    
    this.app.enable("trust proxy");
    
    // Setting view engine to ejs
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.use(express.static(path.join(__dirname, 'public')));

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
    this.app.use(errorHandler);
    this.logger.info(`Initialized Application`);
    
    // Handling Exception
    this.exception();
  }

  start() {
    // Connecting to MongoDB
    this.db.connect();
    
    this.server.listen(this.port, () => {
      this.logger.info(`Now listening on port ${this.port}. in ${this.environment} mode`);
    });
    
    //this.io = socketio(this.server);
    this.io = socketio(this.server, {
      cors: {
        origin: "http://localhost:8158",
      }
    });
    
    this.startTime();
    
    // Calling socket io method
    this.socketIoDefinition();
  }
  
  socketIoDefinition() {
    this.io.on("connection", (socket) => {
      console.log(`a user connected ${socket.id}`);
      
      // When a user connected
      socket.on('sendConnectedUser', (userId) => {
        // Add connected user into the user array
        addConnectedUser(this.users, userId, socket.id);
        console.log(this.users);
        // Send all the connected user to the client
        socket.emit("getConnectedUser", this.users);
      });
      
      socket.on("sendMessage", ({senderId, receiverId, message}) => {
        const user = getCurrentUser(this.users, receiverId);
        console.log(user);
        if(user !== undefined) {
          this.io.to(user.socketId).emit("getMessage", {senderId, message});
        }
      /*this.io.to(user.socketId).emit("getMessage", {senderId, message});*/
      });
      
      // When a user disconnected
      socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
        const user = removeConnectedUser(this.users, socket.id);
        console.log(user);
        this.io.emit("getConnectedUser", user);
      });
    });
  }
  
  parsingBody() {
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    this.app.use(cookieParser());
    this.app.use(cors({origin:"*", credentials:true}));
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
    
    this.app.use("/", viewRoute);
    this.app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocumentation));
    this.app.use("/api/v1/users", userRoute);
    this.app.use("/api/v1/donate", donationRoute);
    this.app.use("/api/v1/message", messageRoute);
    this.app.use("/api/v1/conversation", conversationRoute);
    
    
    // 404 Not Found. must be the last route
    this.app.all("*", (req, res, next) => {
      const message = `Can't find ${req.originalUrl} on this server`;
      next(new AppError(message, 404));
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
  
  unexpectedErrorHandler(error) {
    logger.error(error);
    this.exitHandler();
  };
  
  exitHandler() {
    if (this.server) {
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
  
  exception() {
    process.on('uncaughtException', (err) => {
      logger.info('💥 UNCAUGHT EXCEPTION! Shutting down...');
      this.unexpectedErrorHandler(err);
    });
    
    process.on('unhandledRejection', (err) => {
      logger.info('💥 UNHANDLED REJECTION! Shutting down...');
      this.unexpectedErrorHandler(err);
    });
    
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down');
      if (this.server) {
        this.server.close(() => logger.info('process Terminated'));
      }
    });
  }
  
  startTime() {
    this.logger.info(`server started in ${process.uptime()}.`);
    return process.uptime();
  }
}

// Instance of this class
new App().start();
