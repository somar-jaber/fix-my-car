// let tables = document.querySelectorAll(".tables div").forEach(function(div) {
//     div.addEventListener('click', function() {
//         // Remove 'selected' from all '.tbales' elements
//         document.querySelectorAll(".tables div").forEach(function(otherDiv) {
//             otherDiv.classList.remove('selected');
//         });

//         // Add 'selected' to the clicked div
//         this.classList.add('selected');

//         // Log the class name of the clicked div
//         console.log(this.className);
//     });
// });

var tables = document.querySelectorAll(".tables div").forEach((div) => {
    div.addEventListener('click', async () => {
        tableName = div.className.split()[0];
        console.log(tableName);
        await UI.redirect(`/${tableName}`);
        // this will be used by the CRUD-page.html as a title and it will be removed directly after the CRUD page is loaded
        localStorage.setItem("tableName", tableName);
        localStorage.setItem("pageNumber", 1);
    });
});
