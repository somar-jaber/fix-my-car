async function appendData(dataArray, wantedCols) {
    let dataTableBody = document.querySelector(".data-table tbody");

    for (const object of dataArray) {
        // Create a table row to catch the values
        let tr = document.createElement("tr");

        for (const key in object) {
            // Filtering unwanted fields
            if (!wantedCols.includes(key)) {
                continue;
            }

            // Only for string arrays
            if (Array.isArray(object[key]) && typeof object[key][0] !== "string") {
                continue;
            }

            let td = document.createElement("td");
            td.innerText = object[key];
            tr.appendChild(td);
        }

        // for the "extra field"
        try {
            const worker = await UI.fetchData(`/api/workers/${object.workerId}`, "GET", localStorage.getItem("token"));
            let td = document.createElement("td");
            td.innerText = worker.branch.name;
            tr.appendChild(td);
        } catch (ex) {
            // Handle the error (e.g., log it or display an error message)
            console.error("Error fetching worker data:", ex);
            tr.appendChild(td);
        }

        dataTableBody.appendChild(tr);
    }
}