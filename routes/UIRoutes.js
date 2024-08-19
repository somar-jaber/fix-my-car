const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const path = require('path');
const  router = express.Router();

/* UI routes */
// these roots will be called from the index.html. for that the links starts by "./" because they are in the same level with index.html


// It is forbidden to use "../" but we need to go up one file so we have to manipulate the __dirname
let dir = __dirname.split("\\");
dir = dir.slice(0, dir.length-1).join("\\");


// for cars tabel
router.get("/cars", authMiddleware, (req, res) => {
    let filePath = path.join(__dirname, '..', '/views/cars/index.html'); 
    res.sendFile(filePath);  
});

router.get("/cars/insert.html", authMiddleware, (req, res) => {
    res.sendFile("./views/cars/insert.html" , {root: dir});  
});

router.get("/cars/update.html", authMiddleware, (req, res) => {
    res.sendFile("./views/cars/update.html" , {root: dir});  
});


// for workers table
router.get("/workers", authMiddleware, (req, res) => {
    res.sendFile("./views/workers/index.html" , {root: dir});  
});

router.get("/workers/insert.html", authMiddleware, (req, res) => {
    res.sendFile("./views/workers/insert.html" , {root: dir});  
});

router.get("/workers/update.html", authMiddleware, (req, res) => {
    res.sendFile("./views/workers/update.html" , {root: dir});  
});


// for branches table
router.get("/branches", authMiddleware, (req, res) => {
    res.sendFile("./views/branches/index.html" , {root: dir});  
});

router.get("/branches/insert.html", authMiddleware, (req, res) => {
    res.sendFile("./views/branches/insert.html" , {root: dir});  
});

router.get("/branches/update.html", authMiddleware, (req, res) => {
    res.sendFile("./views/branches/update.html" , {root: dir});  
});


// for users table
router.get("/users", authMiddleware, (req, res) => {
    res.sendFile("./views/users/index.html" , {root: dir});  
});

router.get("/users/insert.html", authMiddleware, (req, res) => {
    res.sendFile("./views/users/insert.html" , {root: dir});  
});

router.get("/users/update.html", authMiddleware, (req, res) => {
    res.sendFile("./views/users/update.html" , {root: dir});  
});


// for repairs table
router.get("/repairs", authMiddleware, (req, res) => {
    res.sendFile("./views/repairs/index.html" , {root: dir});  
});

router.get("/repairs/insert.html", authMiddleware, (req, res) => {
    res.sendFile("./views/repairs/insert.html" , {root: dir});  
});

router.get("/repairs/update.html", authMiddleware, (req, res) => {
    res.sendFile("./views/repairs/update.html" , {root: dir});  
});



module.exports.router = router;