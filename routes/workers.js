const asyncTryCath = require("../middlewares/asyncTryCatch");
const workersController = require("../controllers/workersController.js");
const { WorkerModel, validateWorker } = require("../models/worker.js");
const { authMiddleware } = require("../middlewares/authMiddleware");
const express = require("express");
const router = express.Router();


router.get("/", authMiddleware, asyncTryCath(workersController.getAll));

router.get("/:id", authMiddleware, asyncTryCath(workersController.getOne));

router.post("/", authMiddleware, asyncTryCath(workersController.post));

router.put("/:id", authMiddleware, asyncTryCath(workersController.put));

router.delete("/:id", authMiddleware, asyncTryCath(workersController.delete));


module.exports.router = router;