class UI {
    constructor() {}

    // properties
    /*
        localUrl = "http://127.0.0.1:3000";
        remoteUrl = "https://somar-jaber.serv00.net";
    */
    static url = "/";
    static pageSize = 10;

    // methods
    static async fetchData(url, method, token, dataToSend = {}) {
        method = method.toUpperCase();
        return await fetch(url, {  // http://127.0.0.2:3000/api/auth
            method: method,
            headers: {
                'Content-Type': 'application/json',  // Specify that you're sending JSON data
                'x-auth-token': token,
        },
            // mode: "no-cors",
            body: method != "GET"? JSON.stringify(dataToSend): null,  // Convert your data object to a JSON string
        })
            .then((response) => {
                if (!response.ok) {
                    // If the status is not 200, try to get the error message from the response
                    return response.text().then(text => {
                        throw new Error(`HTTP error! \nStatus: ${response.status}, \nMessage: ${text}`);
                    });
                }

                // Check if the response contains JSON data
                if (response.headers.get('content-type').includes('application/json')) {
                    return response.json();
                } else {
                    // If not JSON, return the response as plain text
                    return response.text();
                }

            })  // i have removed the catch method because i want to handle every setiuation differently from thier methods  
    }  // fetchData


    static async auth (email , password) {
        let token = await this.fetchData("/api/auth", "POST", null, {email: email, password: password});
        localStorage.setItem("token", token)
        return true;
    }  // auth


    static async redirect(url , save = false) {
       // Get the JWT from wherever it's stored
        var token = localStorage.getItem('token');

        // Create a new XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // Configure it: GET-request for the URL 
        xhr.open('GET', url, true);

        // Set the x-auth-token header
        xhr.setRequestHeader('x-auth-token', token);

        if (save) {
            let arr = localStorage.getItem("stack");
            arr = arr.split(",");
            console.log(arr);
            arr.push(url);
            localStorage.setItem("stack", arr.join(","));
        }
        
        // Send the request over the network
        xhr.send();

        // This will run after the response is received
        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP response status
                // // Handle error
                // console.error('Error: ' + xhr.status);
                // return;
            }

            // Get the response body
            var response = xhr.response;

            // Insert the response in the iframe
            var iframeDoc;
            try {
                iframeDoc = document.querySelector('.frame').contentWindow.document;
            }
            catch (ex) {
                iframeDoc = window.top.document.querySelector('.frame').contentWindow.document;
            }
            iframeDoc.open();
            iframeDoc.write(response);
            iframeDoc.close();
        };

        xhr.onerror = function() {
            // console.error('Request failed');
        };

    }  // redirect

    static createDropMenu(dataUrl, menuQuery, apperanceElement, fieldName, fieldValue, actionFunction, hideHiddenP = false) {
        // dataUrl : it is the url of the wanted data to be fetched. the data must be an array on josn objects
        // menuQuery : it is the string which will be puted in the querySelector method
        // apperanceElement : it is the element which the menu will appear when it be clicked
        // fieldName : it is the field name which will be added to the menu and is inside a JSON object
        // fieldValue : it is the value which will be returned when the user clicks on the fieldName in the menu
        
        // adding the drop menu for the Branches field
        let branchesField = document.querySelector(apperanceElement);
        branchesField.addEventListener("focus", async (event) => {
            let dropMenu = document.querySelector(menuQuery);
            dropMenu.classList.add("active");
            dropMenu.innerHTML = "";

            let array = await UI.fetchData(dataUrl, "GET", localStorage.getItem("token"));
            for (let JSObject of array) {
                // the shown paragraph is to be adde to the menu and it will contains the hidden paragraph.
                // the hidden paragraph is to contains a value will be returned when the user clicks on its parent paragraph(the shown paragraph). 
                let shownParagraph = document.createElement("p");
                let hiddenParagraph = document.createElement("p");
                hiddenParagraph.classList.add("hiddenParagraph");

                shownParagraph.innerText = JSObject[fieldName];
                hiddenParagraph.innerText = JSObject[fieldValue];

                if (hideHiddenP)  hiddenParagraph.style["display"] = "none";

                shownParagraph.appendChild(hiddenParagraph);
                dropMenu.appendChild(shownParagraph);
            }

            // adding the functionallity of returning a field value from an added element in the menu 
            document.querySelectorAll(`${menuQuery} > p`).forEach(element => {
                element.addEventListener("click", () => {
                    actionFunction(element.firstElementChild.innerText);
                });
            });
        });

        // Close the dropdown menu if the user clicks outside of it
        window.addEventListener("click" , function(event) {
            // when we click on anything but the input field the menu should be closed
            if (!event.target.matches(apperanceElement)) {
                let dropMenu = document.querySelector(menuQuery);
                dropMenu.classList.remove("active");
            }
        });
    }  // createDropMenu

}; // UI class 
