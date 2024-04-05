const winston = require('winston');
require('winston-mongodb');
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const morgan = require("morgan");

// EX : mongodb://[username:password@]host1[:port1],host2[:port2],...[,hostN[:portN]][/<database>][?options]
let connectionString = "mongodb://mo2695_fixMyCar:5626258bncv564somarJ@91.185.189.19:27017/mo2695_fixMyCar";


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
    console.log("We hve got an Unhandled Exception");
    logger.error('Uncaught Exception:', err);
});

// handle unhandled promise rejections
process.on('unhandledRejection', function(err) {
    console.log("We hve got an Unhandled Rejection");
    logger.error('Unhandled Rejection:', err);
});



if (!config.get("jwtPrivateKey")) {
    console.error("Fatal Error: jwtPrivateKey is not defined");
    process.exit(1);
}

mongoose.connect(connectionString, {useNewUrlParser: true})
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => {console.log("Couldn't connect to mongoDB, Error:\n", err)});

// middlewares
app.use(express.json({extended: true}));
app.use(morgan('tiny'));


// routes
const users = require("./routes/users");
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));