// pat0XuHWHc4WJyCLY.c42c3508fea4ca46dea4ac43230bad4c69e3c6731dfaabfb1a13a280966f94a0
let html5QrCode;
const cameraSelect = document.getElementById('camera-select');
const resultSection = document.getElementById('result-section');
const validationResult = document.getElementById('validation-result');
const scanAgainButton = document.getElementById('scan-again');
const loadingScreen = document.getElementById('loading-screen');

// Starts the QR scanner using the selected camera
function startScanner(cameraId) {
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

// Populates the camera selection dropdown and sets up the change event listener
function populateCameraSelect(devices) {
    devices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.id;
        option.text = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
    });

    cameraSelect.addEventListener('change', () => {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                startScanner(cameraSelect.value);
            }).catch(err => console.error("Error stopping the QR scanner", err));
        }
    });
}

// Shows or hides the loading screen
function showLoadingScreen(show) {
    if (show) {
        loadingScreen.classList.remove('hidden');
    } else {
        loadingScreen.classList.add('hidden');
    }
}

// Fetches ticket info and displays the result
function fetchTicketInfo(ticketId) {
    showLoadingScreen(true); // Show loading screen
    validationResult.innerHTML = "<p>Searching...</p>";
    const url = `https://api.airtable.com/v0/appHcqILrocIA2Vyh/tblSQfSCBSn5MnbY4?filterByFormula=%7BUnique+ID%7D%3D"${ticketId}"`;
    fetch(url, {
        headers: {
            Authorization: "Bearer pat0XuHWHc4WJyCLY.c42c3508fea4ca46dea4ac43230bad4c69e3c6731dfaabfb1a13a280966f94a0"
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoadingScreen(false); // Hide loading screen
        if (data.records && data.records.length > 0) {
            showResult(data.records[0].fields, true);
        } else {
            showResult({}, false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showLoadingScreen(false); // Hide loading screen
        showResult({}, false);
    });
}

// Shows the result section with the validation result
function showResult(data, isValid) {
    resultSection.classList.remove('hidden');
    scanAgainButton.classList.remove('hidden');
    validationResult.innerHTML = isValid ? `<h3>✅ Valid Ticket</h3><p>Name: ${data["Name"]}</p><p>Email: ${data["Email"]}</p><p>Phone Number: ${data["Phone Number"]}</p>` : `<h3>❌ No Ticket Found</h3>`;
}

// Handles successful QR scans
function onScanSuccess(decodedText, decodedResult) {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            fetchTicketInfo(decodedText);
        }).catch(err => console.error("Error stopping the QR scanner", err));
    }
}

// Handles QR scan failures
function onScanFailure(error) {
    console.warn(`QR error = ${error}`);
}

// Sets up the "Scan Again" button
scanAgainButton.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    scanAgainButton.classList.add('hidden');
    validationResult.innerHTML = ""; // Clear previous result
    startScanner(cameraSelect.value); // Restart scanner with the currently selected camera
});

Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        populateCameraSelect(devices);
        // Attempt to find a back camera by default
        const backCamera = devices.find(camera => camera.label.toLowerCase().includes('back') || camera.label.toLowerCase().includes('rear'));
        const defaultCameraId = backCamera ? backCamera.id : devices[0].id;
        startScanner(defaultCameraId); // Start scanner with the default back camera or the first camera if not found
    }
}).catch(err => console.error("Unable to get cameras", err));
