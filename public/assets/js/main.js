// async function getCars () {
//     let cars = await UI.fetchData(UI.localUrl+"/api/cars", "GET", UI.token);
//     console.log(cars);
// }

// // execute
// (
//     async function () {
//         await UI.auth("somar@gmail.com", "somarjaber");  
//         console.log(UI.token);
//         // await getCars();
//     }

// )();


let iframe = document.querySelector("iframe");
let tablesIcon = document.querySelector(".tables");
tablesIcon.addEventListener("click", async () => {
    // no need to import UI becuase the scriopt UI.js is import before this script in the htmle file so they are on the same level.
    // this will work from "views/index.html"
    await UI.redirect("./tables-page.html" , save = true);
});


let logoutIcon = document.querySelector(".logout");
logoutIcon.addEventListener("click" , () => {
    localStorage.clear();
    // similar behavior as an HTTP redirect
    window.location.replace("/");

    // // similar behavior as clicking on a link
    // window.location.href = "http://stackoverflow.com";
});


let backIcon = document.querySelector(".back");
backIcon.addEventListener("click", async () => {
    let arr = localStorage.getItem("stack");
    arr = arr.split(",");
    if (arr.length == 1)
        window.location.href = "/";
    nextUrl = arr.pop();
    localStorage.setItem("stack", arr.join(","));
    await UI.redirect(nextUrl , save = false);
});