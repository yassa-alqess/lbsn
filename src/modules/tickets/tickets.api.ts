import upload from "../../config/storage/multer.config";
import express from "express";
import TicketController from "./tickets.controller";
import TicketService from "./tickets.service";
const ticketRouter = express.Router();
const ticketController = new TicketController(new TicketService());

ticketRouter.get("/", ticketController.getTickets); //get-tickets
ticketRouter.post("/", upload("tickets")!.single("file"), ticketController.addTicket); //add-ticket
ticketRouter.post("/resolve-ticket", ticketController.resolveTicket); //resolve-ticket

export default ticketRouter;