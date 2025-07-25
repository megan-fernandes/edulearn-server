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
import compression from "compression";
import morgan from "morgan";
import fs from "fs";
import "socket.io";
import { initSocket } from "./utility/socket";
import { consumeNotifications } from "./utility/connection";
dotenv.config();
// import https from "https"

const app: Express = express();

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

//generate a log file for every-month
const filePath = (() => {
  const logDir = `${__dirname}/Logs`;
  const currentMonthYear = new Date()
    .toLocaleString("default", {
      month: "2-digit",
      year: "numeric",
    })
    .replace("/", "-"); // Format as MM-YYYY
  const logFilePath = `${logDir}/${currentMonthYear}.log`;

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true }); // Create Logs directory if it doesn't exist
  }

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ""); // Create the log file if it doesn't exist
  }

  return logFilePath;
})();
const accessLogStream = fs.createWriteStream(filePath, { flags: "a" });

app.use(cors(corsOptions));
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
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
// mongoConnect()
//   .then(() => {
//     console.log("Connected to the database successfully!");
//     const server = app.listen(port, () => {
//       console.log(`Server started on port ${port}!!`);
//     });
//     const io = initSocket(server);
//     io.on("connection", (socket: any) => {
//       console.log(`\n=======================\nUser connected: ${socket.id}`);

//       //join a room using chatId
//       socket.on("joinRoom", (roomId: string) => {
//         socket.join(roomId);
//         console.log(`Socket ${socket.id} joined room ${roomId}`);
//       });

//       socket.on("leaveRoom", (roomId: string) => {
//         socket.leave(roomId);
//         console.log(`Socket ${socket.id} left room ${roomId}`);
//       });

//       // Handle disconnection
//       socket.on("disconnect", () => {
//         console.log(`User disconnected: ${socket.id}`);
//       });
//     });
//   })
//   .catch((error) => {
//     console.error("Failed to connect to the database:", error);
//   });
mongoConnect()
  .then(() => {
    console.log("Connected to the database successfully!");
    const server = app.listen(port, () => {
      console.log(`Server started on port ${port}!!`);
    });
    initSocket(server);
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
consumeNotifications();

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
