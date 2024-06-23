const winston = require('winston');
require('winston-mongodb');
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

// to connect locally : let connectionString = "mongodb://127.0.0.1:27017/fix_my_car?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.4"
// EX : mongodb://[username:password@]host1[:port1],host2[:port2],...[,hostN[:portN]][/<database>][?options]
// let connectionString = "mongodb://127.0.0.1:27017/fix_my_car?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.4"
let connectionString = "mongodb://mo2695_fixmycar:5626258bncv564somarJ@91.185.189.19:27017/mo2695_fixmycar";


// Create a new logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logFile.log' }),
        new winston.transports.MongoDB({ db: connectionString, level: 'silly' }),
        new winston.transports.Console({colorize: true, prettyPrint: true}),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'FatalErrors.log' })
    ],
    exitOnError: false // do not exit on handled exceptions
});

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
    console.log("We have got an Unhandled Exception");
    logger.error('Uncaught Exception:', err);
});

// handle unhandled promise rejections
process.on('unhandledRejection', function(err) {
    console.log("We have got an Unhandled Rejection");
    logger.error('Unhandled Rejection:', err);
});



if (!config.get("jwtPrivateKey")) {
    console.error("Fatal Error: jwtPrivateKey is not defined");
    process.exit(1);
}

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => {console.log("Couldn't connect to mongoDB, Error:\n", err)});

// middlewares
app.use(cors());
app.use(express.json({extended: true}));
app.use(morgan('tiny'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


// routes
const users = require("./routes/users");
app.options('*', cors()) // include before other routes
app.use("/api/users", users.router);

const auth = require("./routes/auth");
app.use("/api/auth", auth.router);

const branches = require("./routes/branches");
app.use("/api/branches/", branches.router);

const workers = require("./routes/workers");
app.use("/api/workers", workers.router);

const cars = require("./routes/cars");
app.use("/api/cars", cars.router);

const repairs = require("./routes/repairs");
app.use("/api/repairs", repairs.router);

const loggingMiddleware = require("./middlewares/loggingMiddleware");
app.use(loggingMiddleware);

app.get("/", (req, res) => {
    res.send("Welcome to fix-my-car webApp");  
});

app.get("/api", (req, res) => {
    res.send("fix-my-car API");
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));