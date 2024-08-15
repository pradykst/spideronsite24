const screenShareButton = document.getElementById('screenShareButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let screenStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

// WebSocket connection for signaling
const signalingSocket = new WebSocket('ws://localhost:8080');

signalingSocket.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingSocket.send(JSON.stringify({ answer }));
    } else if (data.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

async function startScreenShare() {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];

        // Replace the video track in the peer connection
        const sender = peerConnection.getSenders().find(s => s.track.kind === videoTrack.kind);
        sender.replaceTrack(videoTrack);

        // Update the local video element to show the screen
        localVideo.srcObject = screenStream;

        // Handle screen sharing stop event
        videoTrack.onended = () => {
            stopScreenShare();
        };
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
}

function stopScreenShare() {
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);

    // Update the local video element to show the camera
    localVideo.srcObject = localStream;

    // Stop all tracks in the screen stream
    screenStream.getTracks().forEach(track => track.stop());
}

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(servers);

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            signalingSocket.send(JSON.stringify({ candidate: event.candidate }));
        }
    };

    // Create an offer and set local description
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send the offer to the remote peer
    signalingSocket.send(JSON.stringify({ offer }));
}

screenShareButton.addEventListener('click', () => {
    if (screenStream) {
        stopScreenShare();
        screenStream = null;
        screenShareButton.textContent = 'Share Screen';
    } else {
        startScreenShare();
        screenShareButton.textContent = 'Stop Sharing';
    }
});

// Start the call when the page loads
startCall();