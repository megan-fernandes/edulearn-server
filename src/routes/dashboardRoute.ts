import express from "express";
import { authenticateUser } from "../middleware/user";
import { instructorDashboard, studentDashboard } from "../controller/dashboardController";

const router = express();

router.get("/dashboard/instructor", authenticateUser, instructorDashboard);

router.get("/dashboard/student", authenticateUser, studentDashboard);

// router.post("/dashboard/admin", authenticateUser, adminDashboard);

export default router;
