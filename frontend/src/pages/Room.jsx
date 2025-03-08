import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../providers/Socket";
import peer from "../service/peer";

const Room = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (err) {
      setError("Failed to access media devices.");
      console.error("Error accessing media devices:", err);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      try {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        console.log(`Incoming Call from: ${from}`);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
      } catch (err) {
        setError("Error handling incoming call.");
        console.error("Error handling incoming call:", err);
      }
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;

    const senders = peer.peer.getSenders().map((sender) => sender.track);

    for (const track of myStream.getTracks()) {
      if (!senders.includes(track)) {
        try {
          peer.peer.addTrack(track, myStream);
        } catch (error) {
          console.error("Error sending stream:", error);
        }
      }
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      try {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
      } catch (err) {
        setError("Error setting local description.");
        console.error("Error setting local description:", err);
      }
    },
    [sendStreams]
  );

  useEffect(() => {
    if (!peer.peer) {
      setError("Peer connection is not initialized.");
      return;
    }
    peer.peer.addEventListener("track", (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <div className="p-4 flex flex-col">
      <h4 className="text-white flex justify-center p-4 text-3xl">
        {remoteSocketId ? `You are Connected...` : "No one in room"}
      </h4>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex justify-center my-2">
        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="mx-4 px-4 m-2 py-2 bg-blue-500 text-white rounded font-bold"
          >
            Call
          </button>
        )}
        {myStream && (
          <button
            onClick={sendStreams}
            className="bg-green-500 m-2 mx-4 px-4 py-2 text-white rounded font-bold"
          >
            Send Stream
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center">
        <div className="flex flex-col justify-center w-[300px] h-[400px]">
          <h3 className="text-white mx-4 text-center font-medium text-3xl p-2 my-2">
            My Stream
          </h3>
          <video
            ref={myVideoRef}
            autoPlay
            muted
            className="border-2 border-white rounded-lg"
          />
        </div>

        <div className="flex flex-col justify-center w-[300px] h-[400px]">
          <h3 className="text-white mx-4 text-center font-medium text-3xl p-2 my-2">
            Remote Stream
          </h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="border-2 border-white rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
