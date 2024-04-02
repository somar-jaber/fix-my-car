const {RepairModel} = require("./models/repair.js");
const {CarModel, validateCar} = require("./models/car");
const {WorkerModel, validateWorker} = require("./models/worker");
const mongoose = require("mongoose");
const argon2 = require("argon2");


mongoose.connect("mongodb://127.0.0.1:27017/fix_my_car?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.4", {useNewUrlParser: true})
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => {console.log("Couldn't connect to mongoDB, Error:\n", err)});



async function addCar() {
    const carSample = new CarModel({
        number: "123456",
        model: "Ferrari",
        color: "white",
        owner_phone: ["0932307188"],
    });

    try {
        await carSample.save();
        console.log(carSample);
    }
    catch (exception) {
        console.log(`Error: ${exception.message}`);
    }
}


async function getAllCars() {
    const cars = await CarModel.find();
    console.log(cars);
}


async function addRepair() {
    const repairSample = new RepairModel({
        description: "not moving",
        costs: [{serviceName: "gas", price: 4000}, {serviceName: "glass", price: 2000}]
    });

    try {
        await repairSample.save();
        console.log(repairSample);
    } 
    catch(exception) {
        console.log(exception.message);
    }
}


// addCar();
// getAllCars();
// let a = validateCar({number: "1234", model: "Mercides", owner_phone: ["0932307188"], color: "white", visit_times: 2});

// let a = validateWorker({f_name: "jonathan", l_name:"jaber", birthdate: "27/2/2004", hiredate: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),  role: "electrical engineer", salary: 120, phone: ["0932307188"] });  
// console.log(a);

// addRepair();


// anonymous function
/*
    Note that if you don’t place the anonymous function inside the parentheses (), you’ll get a syntax error. 
    The parentheses () make the anonymous function an expression that returns a function object.
    To call the expression put the parenthess () after it to call it.
*/
( async function() {
    try {
        const hash = await argon2.hash("password");
        console.log("The hashed password: ", hash);

        // decoding the password:
        if (await argon2.verify(hash, "password"))
            console.log(true);
        else
            console.log(false);

    } 
    catch(exception) {
        console.log(exception.message);
    }

} )();