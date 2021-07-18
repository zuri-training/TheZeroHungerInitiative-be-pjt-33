const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary');
const socketio = require('socket.io');
const compression = require('compression');
const { formatDistanceToNow } = require('date-fns');
// The dotenv should be immediately cofig, before the logger because it reading from the env variable
const dotenv = require('dotenv').config();
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const sessionStore = new session.MemoryStore;


const logger = require('./utils/logger');
const {addConnectedUser, removeConnectedUser, getCurrentUser} = require('./utils/socketHelper');
const MongoDBConnection = require('./database');
const AppError = require('./utils/appError');
const errorHandler = require('./middlewares/errorHandler');
const swaggerDocumentation = YAML.load('./documentation/index.yaml');

// Routes
const donationRoute = require('./routes/donationRoute');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute');
const conversationRoute = require('./routes/conversationRoute');
const viewRoute = require('./routes/viewRoute');


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

    // EJS helpers
    this.app.locals.helpers = {
      capitalise: ([first, ...rest]) => first.toUpperCase() + rest.join(''),
      formatDate: value => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(value);
      },
      formatDateToNow: date => {
        return formatDistanceToNow(date, { addSuffix: true, includeSeconds: true })
      },
      reformatDate: value => {
        const dateSplit = value.split(' ');
        const date = Number(dateSplit[!!{} + !!{}]);
        const ordinal = n => n < 11 || n > 13 ? [`${n}st`, `${n}nd`, `${n}rd`, `${n}th`][Math.min((n - 1) % 10, 3)] : `${n}th`;

        dateSplit[+[]] += ','; dateSplit[!!{} + !!{}] = ordinal(date);

        return dateSplit.join(' ');
      }
    }

    // Parsing request body
    this.parsingBody();
   
    //Http security
    this.httpSecurity();

    // Enable gZip compression
    this.app.use(compression());
    
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
    this.io = socketio(this.server);
    
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
        //console.log("addConnectedUser", this.users);
        console.log(this.users);
        // Send all the connected user to the client
        socket.emit("getConnectedUser", this.users);
      });
      
      socket.on("sendMessage", ({senderId, receiverId, message}) => {
        const user = getCurrentUser(this.users, receiverId);
        console.log(senderId, receiverId, message);
        if(user !== undefined) {
          this.io.to(user.socketId).emit("getMessage", {senderId, message});
        }/* else {
          this.io.emit("userNotOnline", {senderId, receiverId, message});
          console.log("user undefined");
          console.log({senderId, receiverId, message});
          console.log(user);
        }*/
      /*this.io.to(user.socketId).emit("getMessage", {senderId, message});*/
      });
      
      // When a user disconnected
      socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
        const user = removeConnectedUser(this.users, socket.id);
        //console.log("user", user);
        this.io.emit("getConnectedUser", user);
      });
    });
  }
  
  parsingBody() {
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    this.app.use(cookieParser('mRDBxaV8qQADd9FvQe8japFYRmhyyf'));
    this.app.use(cors({origin:"*", credentials:true}));

    // Express session middleware
    this.app.use(session({
      cookie: { maxAge: 60000 },
      store: sessionStore,
      secret: 'mRDBxaV8qQADd9FvQe8japFYRmhyyf',
      saveUninitialized: true,
      resave: true
    }));
    this.app.use(flash());

    this.app.use((req, res, next) => {
      res.locals.successMessage = req.flash('successMessage');
      res.locals.errorMessage = req.flash('errorMessage');
      res.locals.infoMessage = req.flash('infoMessage');
      res.locals.session = req.session;
      
      next();
    });
  }
  
  httpSecurity() {
    // Http Header
    this.app.use('/api/v1', helmet());
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
