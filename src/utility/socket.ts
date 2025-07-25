// // src/utility/socket.ts
// import { Server as SocketIOServer } from "socket.io";
// import { Server as HTTPServer } from "http";
// import { allowedOrigins } from "../constants";

// let io: SocketIOServer;

// export const initSocket = (httpServer: HTTPServer) => {
//   io = require("socket.io")(httpServer, {
//     cors: {
//       origin: allowedOrigins,
//       credentials: true,
//     },
//   });
//   return io;
// };

// export const getIO = () => io;

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { allowedOrigins } from "../constants";

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer) => {
  io = require("socket.io")(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  const userSocketMap = new Map();
  io.on("connection", (socket: any) => {
    console.log(`\n=======================\nUser connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
      console.log("User Registered::", userId);
      userSocketMap.set(userId, socket.id);
      socket.join(userId); // Use rooms to send to specific users
      console.log(userSocketMap);
    });

    //join a room using chatId
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;
