const asyncTryCatch = require("../middlewares/asyncTryCatch");
const authMiddleware = require("../middlewares/authMiddleware");
const {validateCar, CarModel} = require("../models/car");
const express = require("express");
const router = express.Router();


router.get("/", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    const cars = await CarModel.find().populate("branches");
    return res.send(cars);
}));


router.get("/:id", authMiddleware.authMiddleware, asyncTryCatch(async(req, res) => {
    const carSample = await CarModel.findById(req.params.id).populate("branches");
    if (!carSample)  return res.status(400).send("400 Bad Request : the car Id not found");

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

    return res.send(carSample);
}));


module.exports.router = router;