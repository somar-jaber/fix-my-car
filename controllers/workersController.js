const {validateWorker, WorkerModel} = require("../models/worker");
const {BranchModel} = require("../models/branch");
const {UserModel} = require("../models/user");

module.exports.getAll = async(req, res) => {
    const pageNumber = parseInt(req.query.pageNumber); 
    const pageSize = parseInt(req.query.size); 

    let workers = await WorkerModel.find()
        .skip((pageNumber -1) * pageSize)
        .limit(pageSize);

    if (!req.user.isAdmin)
        workers = workers.filter(worker => worker.branch == req.user.branch);

    workers = await WorkerModel.populate(workers, {
        path: "branch",
        model: "Branch",
        select: "name -_id"
    });
    return res.send(workers);
};


module.exports.getOne = async(req, res) => {
    let workerSample = await WorkerModel.findById(req.params.id);
    if (!workerSample)  return res.status(404).send(`404 Not found: Invalid Worker Id`);

    if (!req.user.isAdmin)
        if (workerSample.branch != req.user.branch)
            return res.status(403).send("403 Forbidden: You do not have access to this worker object");

    // const branchSample = await BranchModel.findById(workerSample.branch);
    // if (!branchSample)  return res.status(404).send("404 Not Found : invalid Branch Id");

    // // Convert Mongoose document to a plain object so we can add fields
    // workerSample = workerSample.toObject();
    // workerSample.branch_name = branchSample.name;
    workers = await WorkerModel.populate(workerSample, {
        path: "branch",
        model: "Branch",
        select: "name _id"
    });

    return res.send(workerSample);
};


module.exports.post = async(req, res) => {
    let result = validateWorker(req.body);
    if (result.error) return res.status(400).send(`400 Bad Request: ${result.error.details[0].message}`);

    let workerObject;
    if (req.user.isAdmin)
    {
        workerObject = {
            f_name: req.body.f_name,
            l_name: req.body.l_name,
            birthdate: req.body.birthdate,
            hiredate: req.body.hiredate,
            role: req.body.role,
            salary: req.body.salary,
            phone: req.body.phone,
            branch: req.body.branch || req.user.branch,
        };
    }
    else {
        workerObject = {
            f_name: req.body.f_name,
            l_name: req.body.l_name,
            birthdate: req.body.birthdate,
            hiredate: req.body.hiredate,
            role: req.body.role,
            salary: req.body.salary,
            phone: req.body.phone,
            branch: req.user.branch,
        };
    }

    // checking if the branch is exists
    const branchSample = await BranchModel.findById(workerObject.branch);
    if (!branchSample) return res.status(404).send("404 Not Found : the Branch Id is not exist");

    const workerSample = new WorkerModel(workerObject);

    try {
        await workerSample.save();
        return res.send(workerSample);
    } 
    catch(exception) {
        return res.status(400).send(`mongo Error: {\n ${exception.message} } \n`);
    }
};


module.exports.put = async (req, res) => {
    let result = validateWorker(req.body);
    if (result.error)  return res.status(400).send(`400 Bad Request: ${result.error.details[0].message}`);

    const workerSample = await WorkerModel.findById(req.params.id);
    if (!workerSample) return res.status(404).send("404 Not Found: the worker Id not found");

    if (!req.user.isAdmin)
        if (workerSample.branch != req.user.branch)
            return res.status(403).send("403 Forbidden: You do not have access to this worker object");

    workerSample.set({
        // the pipelines(||) to make the user able to send only the fields that they want to update.
        f_name: req.body.f_name || workerSample.f_name,
        l_name: req.body.l_name || workerSample.l_name,
        birthdate: req.body.birthdate || workerSample.birthdate,
        hiredate: req.body.hiredate || workerSample.hiredate,
        role: req.body.role || workerSample.role,
        salary: req.body.salary || workerSample.salary,
        phone: req.body.phone || workerSample.phone,
        branch: req.body.branch || workerSample.branch,
        // repairs are automated , to add or remove one of them delete or add the worker name in a repair object(record).
    });

    // checking if the branch is exists
    const branchSample = await BranchModel.findById(workerSample.branch);
    if (!branchSample) return res.status(404).send("404 Not Found : the Branch Id is not exist");

    try {
        await workerSample.save();
        return res.send(workerSample);
    }
    catch (exception) {
        return res.status(400).send(`mongo Error: {\n ${exception.message} } \n`);
    }
};


module.exports.delete = async(req, res) => {
    const workerSample = await WorkerModel.findById(req.params.id);
    if (!workerSample)  return res.status(404).send("404 Not Found : worker not found");

    if (!req.user.isAdmin)
        if (workerSample.branch != req.user.branch)
            return res.status(403).send("403 Forbidden: You do not have access to this worker object");

    // Forcing Referential Integrity 
    if (workerSample.repairs.length > 0)  return res.status(400).send("400 Bad Request : Worker can't be deleted because it has Repairs releated to it.");
    if (workerSample.role.toLowerCase() == "user") {
        let users = await UserModel.find();
        for (let i = 0; i < users.length; i++)
            if (users[i].workerId.toString() == workerSample._id)  return res.status(400).send("400 Bad Request : Worker can't be deleted because it is a User.");
    }
    await workerSample.deleteOne();
    return res.send(workerSample);
};