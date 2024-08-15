// Import the IPFS client
const ipfsClient = window.IpfsHttpClient;

// Connect to the local IPFS node
const ipfs = ipfsClient('http://localhost:5001');

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');
    const cidDisplay = document.getElementById('cid');

    if (fileInput.files.length === 0) {
        status.innerText = 'Please select a file to upload.';
        return;
    }

    const file = fileInput.files[0];
    status.innerText = 'Uploading...';

    try {
        const added = await ipfs.add(file);
        status.innerText = 'File uploaded successfully!';
        cidDisplay.innerHTML = `CID: <a href="https://ipfs.io/ipfs/${added.cid}" target="_blank">${added.cid}</a>`;
    } catch (error) {
        console.error('Error uploading file:', error);
        status.innerText = 'Error uploading file.';
    }
}
