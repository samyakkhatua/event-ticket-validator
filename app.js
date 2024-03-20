// pat0XuHWHc4WJyCLY.c42c3508fea4ca46dea4ac43230bad4c69e3c6731dfaabfb1a13a280966f94a0
let html5QrCode;

const resultSection = document.getElementById('result-section');
const validationResult = document.getElementById('validation-result');
const scanAgainButton = document.getElementById('scan-again');
const loadingScreen = document.getElementById('loading-screen'); // Reference to the loading screen element

function startScanner() {
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            const cameraId = devices[0].id;
            html5QrCode = new Html5Qrcode("scanner-container");
            html5QrCode.start(
                cameraId, 
                {
                    fps: 10,
                    qrbox: 250
                },
                onScanSuccess,
                onScanFailure
            ).catch(err => console.error("Unable to start QR scanner", err));
        }
    }).catch(err => console.error("Unable to get cameras", err));
}

function showResult(data, isValid) {
    loadingScreen.classList.add('hidden'); // Ensure loading screen is hidden when showing results
    resultSection.classList.remove('hidden');
    scanAgainButton.classList.remove('hidden');
    validationResult.innerHTML = isValid ? `<h3>Valid Ticket</h3><p>Name: ${data["Name"]}</p><p>Email: ${data["Email"]}</p><p>Phone Number: ${data["Phone Number"]}</p><img src="green-tick.png" alt="Valid"/>` : `<h3>No Ticket Found</h3><img src="red-tick.png" alt="Invalid"/>`;
}

function fetchTicketInfo(ticketId) {
    loadingScreen.classList.remove('hidden'); // Show loading screen when starting to fetch ticket info
    const url = `https://api.airtable.com/v0/appHcqILrocIA2Vyh/tblSQfSCBSn5MnbY4?filterByFormula=%7BUnique+ID%7D%3D"${ticketId}"`;
    fetch(url, {
        headers: {
            Authorization: "Bearer pat0XuHWHc4WJyCLY.c42c3508fea4ca46dea4ac43230bad4c69e3c6731dfaabfb1a13a280966f94a0"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.records && data.records.length > 0) {
            showResult(data.records[0].fields, true);
        } else {
            showResult({}, false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showResult({}, false);
    });
}

function onScanSuccess(decodedText, decodedResult) {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            fetchTicketInfo(decodedText);
        }).catch(err => console.error("Error stopping the QR scanner", err));
    }
}

function onScanFailure(error) {
    console.warn(`QR error = ${error}`);
    loadingScreen.classList.add('hidden'); // Ensure loading screen is hidden if scanning fails
}

scanAgainButton.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    scanAgainButton.classList.add('hidden');
    validationResult.innerHTML = ""; // Clear previous result
    startScanner(); // Restart scanner
});

startScanner();
