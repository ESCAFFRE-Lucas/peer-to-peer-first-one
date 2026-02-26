let localStream;
let peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
}).catch(error => {
    console.error('Error accessing media devices.', error);
});

const peer = new Peer({
    host: '10.31.37.225',
    port: 9000,
    path: '/peerjs'
});

function generatePeerId() {
    const peerId = Math.random().toString(36).substring(2, 10);
    document.getElementById('peer-id').value = peerId;
    return peerId;
}

peer.on('open', id => {
    document.getElementById('peer-id').value = id;
});

function connectButton() {
    console.log('Connect button clicked');
    const peerId = document.getElementById('connect-id').value;
    if (peerId) {
        connectToPeer(peerId);
    } else {
        alert('Please enter a peer ID to connect.');
    }
}

document.getElementById('disconnect-button').addEventListener('click', () => {
    for (let peerId in peers) {
        peers[peerId].close();
    }
    peers = {};
    document.getElementById('remote-video-container').innerHTML = '';
});

document.getElementById('mute-button').addEventListener('click', () => {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
    document.getElementById('mute-button').textContent = localStream.getAudioTracks()[0].enabled ? 'Mute' : 'Unmute';
});

document.getElementById('stop-video-button').addEventListener('click', () => {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
    document.getElementById('stop-video-button').textContent = localStream.getVideoTracks()[0].enabled ? 'Stop Video' : 'Start Video';
});

peer.on('call', call => {
    call.answer(localStream);
    handleIncomingCall(call);
});

function connectToPeer(peerId) {
    const call = peer.call(peerId, localStream);
    handleIncomingCall(call);
    peers[peerId] = call;
}

function handleIncomingCall(call) {
    call.on('stream', remoteStream => {
        addVideoStream(call.peer, remoteStream);
    });

    call.on('close', () => {
        document.getElementById(call.peer).remove();
        delete peers[call.peer];
    });

    call.on('error', err => {
        console.error('Call failed:', err);
        alert('Call failed.');
    });
}

function addVideoStream(peerId, stream) {
    if (document.getElementById(peerId)) {
        return;
    }

    const videoWrapper = document.createElement('div');
    videoWrapper.id = peerId;
    videoWrapper.className = 'video-wrapper';

    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `Peer: ${peerId}`;

    videoWrapper.append(video);
    videoWrapper.append(label);

    document.getElementById('remote-video-container').append(videoWrapper);
}
