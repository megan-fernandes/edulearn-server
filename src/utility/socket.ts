// src/utility/socket.ts
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { allowedOrigins } from "../constants";

let io: SocketIOServer;

// // const version = process.env.VERSION || "v1"; // Default to v1 if VERSION is not set

// export const initSocket = (server: HTTPServer) => {
//   io = new SocketIOServer(server, {
//     cors: {
//       origin: [
//         `http://localhost:3000`,
//         `http://localhost:5173`,
//         `http://172.30.232.130:3000`,
//         `http://192.168.226.180:3000`,
//       ],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log(`\n=======================\nUser connected: ${socket.id}`);

//     // // Receive and broadcast message
//     // socket.on("sendMessage", ({ chatId, message }) => {
//     //   socket.to(chatId).emit("receiveMessage", message);
//     // });

//     // socket.on("disconnect", () => {
//     //   console.log(`User disconnected: ${socket.id}`);
//     // });
//   });

//   return io;
// };

export const initSocket = (httpServer: HTTPServer) => {
  io = require("socket.io")(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  return io;
};

export const getIO = () => io;
