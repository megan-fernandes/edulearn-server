import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import authRoute from "./routes/authRoute";
import courseRoute from "./routes/courseRoute";
import chapterRoute from "./routes/chapterRoute";
import lectureRoute from "./routes/lectureRoute";
import enrollmentRoute from "./routes/enrollmentRoute";
import dashboardRoute from "./routes/dashboardRoute";
import chatRoute from "./routes/chatRoute";
import paymentRoute from "./routes/paymentRoute";
import { mongoConnect } from "../config/dbConfig"; // Import the database connection function
import { allowedOrigins, baseRoute, port } from "./constants";
// import csrf from "csurf";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import helmet from "helmet";
import "socket.io";
// import http from "http";
import { initSocket } from "./utility/socket";
dotenv.config();

const app: Express = express();
// const server = http.createServer(app);
// Initialize socket.io and set up a basic connection event
// const io = initSocket(server);
// io.on("connection", (socket) => {
//   console.log("A user connected");
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// const version = process.env.VERSION || "v1"; // Default to v1 if VERSION is not set

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin === null ||
      origin == "null"
    ) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  credentials: true, // Allow cookies & authentication header
  optionsSuccessStatus: 200,
};

// Use body-parser for general JSON parsing, but exclude Stripe webhook route
app.use((req, res, next) => {
  if (req.originalUrl.includes("/payment/success")) {
    next(); // Skip body-parser for Stripe webhook route
  } else {
    app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
    bodyParser.json({ limit: "20mb" })(req, res, next);
  }
});

app.use(cors(corsOptions));
app.disable("x-powered-by");
app.use(helmet());
// //CSRF Token and cookie parsing

// app.use(
//   csrf({
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//     },
//   })
// );

// app.get("/csrf-token", (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

//passport for oauth
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Databse Connection
mongoConnect()
  .then(() => {
    console.log("Connected to the database successfully!");
    const server = app.listen(port, () => {
      console.log(`Server started on port ${port}!!`);
    });
    const io = initSocket(server);
    io.on("connection", (socket: any) => {
      console.log(`\n=======================\nUser connected: ${socket.id}`);

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
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

//routes
app.use(baseRoute, authRoute);
app.use(baseRoute, dashboardRoute);
app.use(baseRoute, courseRoute);
app.use(baseRoute, chapterRoute);
app.use(baseRoute, lectureRoute);
app.use(baseRoute, enrollmentRoute);
app.use(baseRoute, chatRoute);
app.use(baseRoute, paymentRoute);

// app.listen(port, () => {
//   console.log("server started!!");
// });
