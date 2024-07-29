import express from "express";
import AppointmentController from "./appointments.controller";
import AppointmentService from "./appointments.service";

const appointmentRouter = express.Router();
const appointmentController = new AppointmentController(new AppointmentService());


appointmentRouter.post("/", appointmentController.makeAppointment); //make-appointment

export default appointmentRouter;