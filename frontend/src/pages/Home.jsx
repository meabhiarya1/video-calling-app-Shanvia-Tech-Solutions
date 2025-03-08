import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket } = useSocket();
  const [email, setEmail] = useState(""); // Default empty string
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!socket || !email || !room) return; // Prevent sending invalid data
      socket.emit("room:join", { email, room });
    },
    [room, email, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-white text-3xl font-medium m-4 p-4 text-center">
          Try video call...
        </h2>
        <form onSubmit={handleSubmitForm}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white">Name:</label>
            <input
              type="text"
              value={email}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your name here..."
              className="p-2 rounded-lg"
              required
            />

            <label htmlFor="room" className="text-white">Room ID:</label>
            <input
              type="text"
              value={room}
              id="room"
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room ID..."
              className="p-2 rounded-lg"
              required
            />

            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-2"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
