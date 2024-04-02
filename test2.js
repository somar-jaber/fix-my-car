let pattern = /([0-9]|[0-9][0-9])\/([0-9]|[0-9][0-9])\/[0-9]/g;
pattern =  /^(0?[1-9]|[12][0-9]|3[01])\/\-[\/\-]\d{4}$/;
pattern = /(\d\d|\d)-(\d\d|\d)-\d\d\d\d/g;
pattern = /\d{1,2}-\d{1,2}-\d{4}/g;
pattern = /\d{1,2}(-|\/)\d{1,2}(-|\/)\d{4}/g;

console.log("12-04-2023 1-04-2003 02-4-2333".match(pattern));

const argon2 = require("argon2");
async function a() {
    await argon2.verify(
        "$argon2id$v=19$m=65536,t=3,p=4$LZ74pXLPFDpfEXAdiT6Nng$wcfXNg0G66eirnCYoZoLok19f63pZY6fkdQ3lTyjMqw", 
        req.body.password
    )

}

async function methodOne() {
        // getting the number of docs to check if we have founded all of them
        let workerSamples = await WorkerModel.find(
            {_id: {$in: req.body.workers}},
            {multi: true},
        );
    
        // if the lengthes are not the same so there some Ids not founded 
        if (workerSamples.length !== req.body.workers.length) {
            // the workerSample is an array of jsObjects like this [ { _id: new ObjectId("") }, ... ]
            // and we want to make it just an array of id strings to compare it with req.body.workers
            workerSamples = workerSamples.map((element) => {
                return element["_id"].toString();  // Note may help in the future: {...}["_id"].toString() returns only the id string with out   new ObjectId("...")  
            });
    
            let notFoundedIds = req.body.workers.filter((element) => {
                return !workerSamples.includes(element);
            });
            
            return res.status(404).send(`The next workers IDs not founded: \n${notFoundedIds}`);
        }
        
        // else if the lenghts are equals so we will update the docs at once
        workerSamples = await WorkerModel.updateMany(  // this does not return the document it self but an aknowledge document  
            {_id: {$in: req.body.workers} },  // to update multiple documents
            {$push : {repairs: repairSample._id} },  // pushing the repair id to repairs array  
            {multi: true},
        );
}


// 2 milliseconds
// 2 * 1000 seconds
// 2 * 1000 * 60 minutes
// 2 * 1000 * 60 * 60 hours
let date = new Date(Date.now() + 2*1000*60*60); // Date.now() is late 2 hours from the current time becuase it returns the UTC time not the local time(machine itself time)
console.log(date.toLocaleTimeString());


async function findMultiDocs(Model, searchArray) {
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
} 

a = [1,2,3,4]
b = a.splice(0,1);
console.log(a);

module.exports.findMultiDocs = findMultiDocs;