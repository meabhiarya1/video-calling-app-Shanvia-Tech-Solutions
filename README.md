# Video Call App

This is a simple WebRTC-based video calling application built with React, Socket.IO, and Peer-to-Peer connections.

## Features
- Join a room using a unique Room ID.
- Real-time video and audio streaming between connected users.
- Automatic negotiation of peer connections.
- UI built with TailwindCSS.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** Node.js, Express, Socket.IO
- **WebRTC:** RTCPeerConnection for peer-to-peer video calling

## Installation
### 1. Clone the repository
```sh
git clone https://github.com/meabhiarya1/video-calling-app-Shanvia-Tech-Solutions.git
cd video-calling-app-Shanvia-Tech-Solutions

```

### 2. Install dependencies
#### Frontend
```sh
cd frontend
npm install
```
#### Backend
```sh
cd backend
npm install
```

### 3. Start the application
#### Start the backend server
```sh
cd backend
npm start
```
#### Start the frontend
```sh
cd frontend
npm start
```

## Configuration
Ensure the backend server is running before launching the frontend.
The WebRTC connection relies on `iceServers` for peer-to-peer communication. The default STUN/TURN servers used are:
```js
iceServers: [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:global.stun.twilio.com:3478",
    ],
  },
],
```
You can replace them with your own STUN/TURN servers if needed.

## Usage
1. Enter your name and a room ID to join a video call.
2. Wait for another user to join the same room.
3. Click **Call** to start the video call.
4. Use the **Send Stream** button if the video is not appearing.

## Known Issues & Fixes
- **Error: `NotFoundError: Requested device not found`**
  - Ensure your camera and microphone are connected and accessible.
- **Error: `Failed to execute 'addTrack' on 'RTCPeerConnection'`**
  - This occurs when the same track is added multiple times. Fixed by checking existing tracks before adding.

## License
This project is licensed under the MIT License.

