const {calcFinalCost} = require("./helperFunctions");
const { default: mongoose } = require("mongoose");
const {validateRepair, RepairModel} = require("../models/repair");
const { WorkerModel } = require("../models/worker");
const { CarModel } = require("../models/car");
const {authMiddleware} = require("../middlewares/authMiddleware");
const {findMultiDocs, updateWorkers, updateCar} = require("./helperFunctions");
const asyncTryCath = require("../middlewares/asyncTryCatch");
const express = require("express");
const router = express.Router();


let counter = 1;


router.get("/", authMiddleware, asyncTryCath(async(req, res) => {
    const repairs = await RepairModel.find();
    return res.send(repairs);
}));



router.get("/:id", authMiddleware, asyncTryCath(async(req, res) => {
    const repairSample = await RepairModel.findById(req.params.id);
    if (!repairSample)  return res.status(404).send("404 Not Found: the repair Id not found");
    return res.send(repairSample);
}));



router.post("/", authMiddleware, async(req, res) => {
    const result = validateRepair(req.body);
    if (result.error) return res.status(400).send(`400 Bad Request : ${result.error.details[0].message}`);  

    const repairSample = new RepairModel({
        id_number: new Date(Date.now()).toLocaleTimeString() + " - " + counter++ ,
        description: req.body.description,
        costs: req.body.costs,
        date: new Date(Date.now()).toLocaleString(),
        workers: req.body.workers,
        car: req.body.car,
        publishedFrom: req.user.branch,
        final_cost: calcFinalCost(req.body.costs),
    });

    /* Car */
    let carSample = await CarModel.findById(req.body.car);
    if (!carSample)  return res.status(404).send("404 Not Found : the Car Id not founded");
    /* Do not write  
        carSample.set({
            repairs: carSample.repairs.push(repairSample._id.toString()),
        })
        because the push method applys the change directly and then you are assigning the array itself to 'repairs' which will cause a validation error  
    */
    carSample.repairs.push(repairSample._id.toString()); // to send just the id string not the ObjectId itself
    carSample.visit_times += 1;
    if (!carSample.branches.includes(req.user.branch.toString()))  // to check that the value is not already existed 
        carSample.branches.push(req.user.branch.toString());        


    /* Workers */
    let workerSamples = await findMultiDocs(WorkerModel, repairSample.workers);
    // the updating fot workers docs will happend in the try catch


    // Start a mongoose session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Modify each 'worker' object in 'workerSamples' (by using for..of  not for..in)
        for (const worker of workerSamples) { 
            worker.repairs.push(repairSample._id.toString());
            await worker.save({session: session});  // Save the changes for each 'worker' object
        }
        await carSample.save({seesion: session});
        await repairSample.save({session: session})
            .then( doc => console.log("Document saved wiht _id: ", doc._id) )
            .catch( err => console.log("Error saving the document: ", err) );

        // if all operations succeed, commit the transaction
        await session.commitTransaction();

        // do not put 'return' becuase we need to reach the "finally" block
        res.send(repairSample);
    }
    catch (exception) {
        // If any operation fails, abort the transaction
        await session.abortTransaction();
        console.log(exception);
        res.status(500).send(`Something failed. 500 internal server error: \n${exception}`);
    }
    finally {
        session.endSession();
    }
});



router.put("/:id", authMiddleware, asyncTryCath(async (req, res) => {
    const result = validateRepair(req.body);
    if (result.error) return res.status(400).send(`400 Bad Request : ${result.error.details[0].message}`);

    // starting mongoose session
    const session = await mongoose.startSession();
    session.startTransaction();

    const repairSample = await RepairModel.findById(req.params.id);
    if (!repairSample) return res.status(404).send("404 Not Found : the Repair Id not found"); 

    if ( req.user.isAdmin ) {
        repairSample.set({
            id_number: req.body.id_number || repairSample.id_number,
            description: req.body.description || repairSample.description,
            costs: req.body.costs || repairSample.costs,
            date: req.body.date || repairSample.date,
            workers: await updateWorkers(req.body.workers, repairSample.workers, repairSample._id, session) || repairSample.workers,
            car: await updateCar(req.body.car, repairSample.car, repairSample._id) || repairSample.car,
            publishedFrom: req.body.publishedFrom || repairSample.publishedFrom,
            final_cost: req.body.final_cost || calcFinalCost(req.body.costs),
        });
    }
    else {
        repairSample.set({
            description: req.body.description || repairSample.description,
            costs: req.body.costs || repairSample.costs,
            date: req.body.date || repairSample.date,
            workers: await updateWorkers(req.body.workers, repairSample.workers, repairSample._id, session) || repairSample.workers,  
            car: await updateCar(req.body.car, repairSample.car, repairSample._id) || repairSample.car,
            final_cost: req.body.final_cost || calcFinalCost(req.body.costs),
            // we have excluded the publishedFrom and id_number pathes
        });
    }

    try {
        await repairSample.save({session: session});
        await session.commitTransaction();
        res.send(repairSample);
    }
    catch (exception) {
        await session.abortTransaction();
        console.log(exception);
        res.status(500).send(`Something failed. 500 internal server error: \n${exception}`);
    }
    finally {
        session.endSession();
    }

}));



router.delete("/:id", authMiddleware, asyncTryCath(async(req, res) => {
    const repairSample = await RepairModel.findById(req.params.id);
    if (!repairSample) return res.status(404).send("404 Not Found : the repair Id not found");

    const carSample = await CarModel.findById(repairSample.car);
    if (!carSample) return res.status(404).send("404 Not Found : the Car Id is not founded");

    // remove the repair id from the array 
    carSample.repairs.splice(carSample.repairs.indexOf(repairSample._id.toString()) , 1);  // the first element is the index of the target and the second element is how many elements you want to delete  
    // carSample.visit_times -= 1;
    

    let workerSamples = await findMultiDocs(WorkerModel, repairSample.workers);
    // the updating on the workers will happend in the try catch

    // starting mongoose session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (const worker of workerSamples) {
            worker.repairs.splice(worker.repairs.indexOf(repairSample._id.toString()) , 1);
            await worker.save({session: session});
        }
        await carSample.save({session: session});
        await repairSample.deleteOne({session: session})  // ({session: session});

        await session.commitTransaction();
        res.send(repairSample);
    }
    catch (exception) {
        await session.abortTransaction();
        console.log(exception);
        res.status(500).send(`Something failed. 500 internal server error: \n${exception.message}`); 
    }
    finally {
        session.endSession();
    }
}));



/*
router.post("/test", async(req, res) => {
    id = "65f1a5c71b982fd17b03f414";
    let workerSamples = await WorkerModel.find(
        {_id: {$in: req.body.workers} } 
    );

    try {
        // Modify each 'worker' object in 'workerSamples'
        for (const worker of workerSamples) {
            worker.repairs.push(id);
            await worker.save(); // Save the changes for each 'worker' object
        }

        return res.send(workerSamples);
    }
    catch(exception) {
        console.log(exception);
        return res.status(500).send(`Internal Server Error: ${exception}`);
    }
});
*/


module.exports.router = router;