import { AppointmentPayload } from "@/shared/interfaces/appointment";

export default class AppointmentService {
    public async makeAppointment(appointmentPayload: AppointmentPayload) {
        //once it's verified by the admin and there was a meeting
        //store user in the database
        //send mail to the user with random password
    }
} 