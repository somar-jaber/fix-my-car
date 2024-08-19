const { default: mongoose } = require("mongoose");
const { CarModel } = require("../models/car");
const { WorkerModel } = require("../models/worker");


async function findMultiDocs(Model, searchArray) {
    // Getting the docs to check if we have founded all of them
    let Samples = await Model.find(
        {_id: {$in: searchArray}}
    );

    // if the lengthes are not the same so there some Ids not founded 
    if (Samples.length !== searchArray.length) {
        // the Samples is an array of jsObjects like this [ { _id: new ObjectId("") }, ... ]
        // and we want to make it just an array of id strings to compare it with searchArray 
        Samples = Samples.map((element) => {
            return element["_id"].toString();  // Note may help in the future: {...}["_id"].toString() returns only the id string with out   new ObjectId("...")  
        });

        let notFoundedIds = searchArray.filter((element) => {
            return !Samples.includes(element);
        });
        
        throw new Error(`The next workers IDs not founded: \n${notFoundedIds}`);
    }

    return Samples;
};



async function updateWorkers(newWorkersArray, oldWrokersArray, repairId, session) {
    // workers who are in the new array but not in the old one so they must be have the new repair Id
    /*
        the oldWorkersArray has ObjectsId and not the IDs strings because mongoose when save them it store them as objectIds 
        the issue with your code is that the Array.prototype.includes() method uses strict equality (===) for comparison. 
        This means that it will only return true if the element in newWorkersArray or oldWorkersArray is exactly the same as 
        the element in oldWorkersArray or newWorkersArray respectively.
        So to compare the ObjectId with the id string in berif way we will use .some() method, and it is like sayin there is at least one element in the array passes the condition in the some() method. if yes it returns true otherwise it returns false. 
        if you founded the logic a little bit complex so you can easly use the fillter method on oldWorkersArray to convert the ObjectIds to id strings.    
    */
    const differenceNew = newWorkersArray.filter((workerId) => {
        return !oldWrokersArray.some((workerObjectId) => workerObjectId.toString() === workerId);
    });

    // workers whose repair Id must be removed 
    const differenceOld = oldWrokersArray.filter((workerObjectId) => {
        return !newWorkersArray.includes(workerObjectId.toString());
    }); 
    
    // the new ones who we should add the repair to them
    let workerSamples = await findMultiDocs(WorkerModel, differenceNew);

    for (worker of workerSamples) {
        worker.repairs.push(repairId.toString());
        await worker.save({session: session});
    }
    
    // the old ones who we should remove the repair from them
    workerSamples = await findMultiDocs(WorkerModel, differenceOld);
    
    for (const worker of workerSamples) {
        worker.repairs.splice( worker.repairs.indexOf(repairId.toString()) , 1 );
        await worker.save({session: session});
    }

    return newWorkersArray;
};



async function updateCar(newCarId, oldCarId, repairId, session) {
    // Removing the repair id from the old car id
    let carSample = await CarModel.findById(oldCarId);
    if (!carSample)  throw new Error("404 Not Found : the Car id not found");
    carSample.repairs.splice(carSample.repairs.indexOf(repairId.toString()) , 1);
    carSample.save({session: session});

    // Adding the repair id to the new car id
    carSample = await CarModel.findById(newCarId);
    if (!carSample)  throw new Error("404 Not Found : the Car id not found");
    carSample.repairs.push(repairId.toString());
    carSample.save({session: session});

    return newCarId;
}



function calcFinalCost(costs) {
    final_cost = 0;
    for(JSObject of costs) {
        final_cost += JSObject.price;
    }
    return final_cost;
}



module.exports.calcFinalCost = calcFinalCost;
module.exports.findMultiDocs = findMultiDocs;
module.exports.updateWorkers = updateWorkers;
module.exports.updateCar = updateCar;