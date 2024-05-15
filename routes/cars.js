const asyncTryCatch = require("../middlewares/asyncTryCatch");
const authMiddleware = require("../middlewares/authMiddleware");
const {validateCar, CarModel} = require("../models/car");
const express = require("express");
const router = express.Router();

router.get("/", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    let cars = await CarModel.find();

    if (!req.user.isAdmin){
        // if the car has visited the user's branch it will be included
        cars = cars.filter(car => car.branches.includes(req.user.branch));
    }
    
    cars = await CarModel.populate(cars , {
        path: 'branches',
        model: 'Branch', // if the model is not in the same file we need to mention it in the "model" filed
    });


    // // this will only show the user's branch inside the car's branches field
    // cars = await CarModel.populate(cars, {
    //     path: 'branches',
    //     model: 'Branch', // if the model is not in the same file we need to mention it in the "model" filed
    //     match: { _id: req.user.branch }  // if we turned this on , the branches array will only shows the user's branch and not all the branches as we want. if you want this on so you need to filter the cars that will have an empty branches array: "cars = cars.filter(car => car.branches.length != 0 );"  
    // });
 
    // // to exclude the cars which aren't visit the user's branch
    // cars = cars.filter(car => car.branches.length != 0 );

    return res.send(cars);
}));


router.get("/:id", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    let carSample = await CarModel.findById(req.params.id);
    if (!carSample)  return res.status(400).send("400 Bad Request : the car Id not found");
    
    // if the car didn't visit the user branch so they are not allowed to see its info
    if (!req.user.isAdmin)
        if (!carSample.branches.includes(req.user.branch))
            return res.status(403).send("403 Forbidden: You are not allowed to see this car's info");

    carSample = await CarModel.populate(carSample, {
        path: 'branches',
        model: 'Branch', // if the model is not in the same file we need to mention it in the "model" filed
    });

    return res.send(carSample);
}));


router.post("/", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    let result = validateCar(req.body);
    if (result.error)  return res.status(400).send(`400 Bad Request : ${result.error.details[0].message}`);

    const carSample = new CarModel({
        number: req.body.number,
        model: req.body.model,
        owner_phone: req.body.owner_phone,
        color: req.body.color,
        branches: [req.user.branch], // getting the acotr branch (who operated the request) 
    });

    try {
        await carSample.save();
        return res.send(carSample);
    }
    catch(exception) {
        return res.send(`mongo Error: {\n ${exception.message} } \n`);
    }
}));


router.put("/:id", authMiddleware.authMiddleware , asyncTryCatch(async(req, res) => {
    let result = validateCar(req.body);
    if (result.error)  return res.status(400).send(`400 Bad Request : ${result.error.details[0].message}`);

    const carSample = await CarModel.findById(req.params.id);
    if (!carSample)  return res.status(404).send("404 Not Found : the Car Id not found");
    
    // if the car didn't visit the user branch so they are not allowed to see its info. unless the user is admin
    if (!req.user.isAdmin)
        if (!carSample.branches.includes(req.user.branch))
            return res.status(403).send("403 Forbidden: You do not have access to this object");


    if (req.user.isAdmin) {
        carSample.set({
            number: req.body.number || carSample.number,
            model: req.body.model || carSample.model,
            owner_phone: req.body.owner_phone || carSample.owner_phone,
            color: req.body.color || carSample.color,
            branches: req.body.branches || carSample.branches,
            visit_times: req.body.visit_times || carSample.visit_times,
        });
    } else {
        carSample.set({
            number: req.body.number || carSample.number,
            model: req.body.model || carSample.model,
            owner_phone: req.body.owner_phone || carSample.owner_phone,
            color: req.body.color || carSample.color,
            // the visit_times will be increased when a repair object being added and it releated to this car. So the increament comes from the repairs routes 
        });
    }

    try {
        await carSample.save();
        return res.send(carSample);
    }
    catch (exception) {
        return res.send(`mongo Error: {\n ${exception.message} } \n`);
    }
}));


router.delete("/:id", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    const carSample = await CarModel.findByIdAndRemove(req.params.id);
    if (!carSample) return res.status(404).send("404 Not Found : the car Id not found");

    // if the car didn't visit the user branch so they are not allowed to see its info. unless the user is admin
    if (!req.user.isAdmin)
        if (!carSample.branches.includes(req.user.branch))
            return res.status(403).send("403 Forbidden: You do not have access to this object");

    return res.send(carSample);
}));


module.exports.router = router;