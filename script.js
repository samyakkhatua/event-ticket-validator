function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    fetchTicketInfo(decodedText); // Proceed to fetch ticket info
}

// function fetchTicketInfo(ticketId) {
//     fetch('https://hook.eu1.make.com/9wr22eohmwba32gumauyqskta5nm9iv4', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ ticketId: ticketId }),
//     })
//     .then(response => response.json())
//     .then(data => {
//         // Assuming the first object in the array is the one we want
//         const headers = data[0].headers;
//         const response = {};
//         headers.forEach(header => {
//             response[header.key] = header.value;
//         });
//         updatePopup(response);
//         console.log(response);
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });
// }

function fetchTicketInfo(ticketId) {
    fetch('https://hook.eu1.make.com/9wr22eohmwba32gumauyqskta5nm9iv4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId: ticketId }),
    })
    .then(response => {
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json(); // If JSON, parse it and proceed
        } else {
            console.error("Oops, we haven't got JSON!");
            return response.text().then(text => {
                throw new Error("Server didn't send JSON: " + text);
            });
        }
    })
    .then(data => {
        // Assuming the response is the expected JSON structure
        const headers = data[0].headers;
        const response = {};
        headers.forEach(header => {
            response[header.key] = header.value;
        });
        updatePopup(response);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


function updatePopup(data) {
    let userInfoHtml = `Name: ${data.name}<br>`;
    userInfoHtml += `Phone Number: ${data.phnumber}<br>`;
    userInfoHtml += `Email: ${data.email}`;
    document.getElementById('user-info').innerHTML = userInfoHtml;
    
    // Since the response does not specify if the ticket is valid, displaying a green tick by default
    // Modify this logic based on how you determine ticket validity
    document.getElementById('status-icon').innerHTML = '✅'; 
    document.getElementById('popup').style.display = 'flex';
    document.getElementById('popup').style.flexDirection = 'column';
    document.getElementById('popup').style.alignItems = 'center';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

var html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
