import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/Socket";
import peer from "../service/peer";

const Room = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeededIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", {
        to: from,
        ans,
      });
    },
    [socket]
  );

  const handleNegoNeededFinal = useCallback(async ({ ans }) => {
    try {
      if (!ans) {
        throw new Error("Received an invalid answer for negotiation.");
      }
      await peer.setLocalDescription(ans);
      console.log("Negotiation finalized successfully.");
    } catch (error) {
      console.error("Error finalizing negotiation:", error);
    }
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoNeededFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoNeededFinal);
    };
  }, [
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoNeededFinal,
    socket,
  ]);

  return (
    <div className="p-4 flex flex-col">
      <h4 className="text-white flex justify-center p-4 text-3xl">
        {remoteSocketId ? `You are Connected...` : "No one in room"}
      </h4>

      {/* buttons */}
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
            className=" bg-green-500 m-2 mx-4 px-4 py-2 text-white rounded font-bold"
          >
            Send Stream
          </button>
        )}
      </div>

      {/* my stream and remote stream */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
        {/* My Stream */}
        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg w-full md:w-[320px] h-[420px] shadow-lg border border-gray-700">
          <h3 className="text-white text-center font-semibold text-2xl p-2">
            My Stream
          </h3>
          <div className="w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            {myStream ? (
              <ReactPlayer
                url={myStream}
                playing
                muted
                className="w-full h-full"
              />
            ) : (
              <p className="text-gray-400">No video</p>
            )}
          </div>
        </div>

        {/* Remote Stream */}
        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg w-[320px] h-[420px] shadow-lg border border-gray-700">
          <h3 className="text-white text-center font-semibold text-2xl p-2">
            Remote Stream
          </h3>
          <div className="w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            {remoteStream ? (
              <ReactPlayer
                url={remoteStream}
                playing
                className="w-full h-full"
              />
            ) : (
              <p className="text-gray-400">Waiting for remote stream...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
