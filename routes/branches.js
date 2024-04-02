const asyncTryCatch = require("../middlewares/asyncTryCatch");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {validateBranch, BranchModel} = require("../models/branch");
const express = require("express");
const router = express.Router();


router.get("/", authMiddleware, asyncTryCatch(async(req, res) => {
    const branches = await BranchModel.find();
    return res.send(branches);
}));


router.get("/:id", authMiddleware, asyncTryCatch(async(req, res) => {
    const branchSample = await BranchModel.findById(req.params.id);
    if (!branchSample) return res.status(404).send("404 Not Found: the branch id is not founded");
    return res.send(branchSample);
}));


router.post("/", authMiddleware, asyncTryCatch(async(req, res) => {
    let result = validateBranch(req.body);
    if (result.error) return res.status(404).send(`404 Bad Request: ${result.error.details[0].message}`);

    const branchSample = new BranchModel({
        name: req.body.name,
        location: req.body.location,
    });

    try {
        await branchSample.save();
        return res.send(branchSample);
    }
    catch (exception) {
        return res.send(`mongo Error: {\n ${exception.message} } \n`);
    }
}));


router.put("/:id", authMiddleware, asyncTryCatch(async(req, res) => {
    let result = validateBranch(req.body);
    if (result.error) return res.status(400).send(`400 Bad Request: ${result.error.details[0].message}`); 

    const branchSample = await BranchModel.findById(req.params.id);
    if(!branchSample) return res.status(404).send("404 Not Found: the branch Id is not founded");

    branchSample.set({
        // the pipelines(||) to make the user able to send only the fields that they want to update. 
        name: req.body.name || branchSample.name, 
        location: req.body.location ?? branchSample.location,
    });

    try {
        await branchSample.save();
        return res.send(branchSample);
    }
    catch (exception) {
        return res.send(`mongo Error: {\n ${exception.message} } \n`);
    }
}));


router.delete("/:id", authMiddleware, asyncTryCatch(async(req, res) => {
    const branchSample = await BranchModel.findByIdAndRemove(req.params.id);
    if (!branchSample)
        return res.status(404).send("404 Not found");
    return res.send(branchSample);
}));


module.exports.router = router;