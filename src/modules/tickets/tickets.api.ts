import upload from "../../config/storage/multer.config";
import express from "express";
import TicketController from "./tickets.controller";
import TicketService from "./tickets.service";
const ticketRouter = express.Router();
const ticketController = new TicketController(new TicketService());

ticketRouter.post("/addTicket", upload("tickets")!.single("file"), ticketController.addTicket);
ticketRouter.post("/getTickets", ticketController.getTickets);
ticketRouter.post("/resolveTicket", ticketController.resolveTicket);

export default ticketRouter;