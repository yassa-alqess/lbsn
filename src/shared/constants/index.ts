// database errors
export const DUPLICATE_ERR = "23505"
export const INVALID_UUID = "22P02"

// google api
export const GOOGLE_API = "https://www.googleapis.com/auth/spreadsheets"

// auth constants
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ""
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || ""
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m"
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d"


// mail constants
export const MAIL_HOST = process.env.MAIL_HOST || ""
export const MAIL_USER = process.env.MAIL_USER || ""
export const MAIL_PASS = process.env.MAIL_PASS || ""
export const MAIL_PORT = process.env.MAIL_PORT || ""



// paths
export const APPOINTMENTS_PATH = "/appointments"
export const USERS_PATH = "/users"
export const AUTH_PATH = "/auth"
export const LEADS_PATH = "/leads"
export const USER_PROFILES_PATH = "/profiles"
export const TICKETS_PATH = "/tickets"
export const TASKS_PATH = "/tasks"
export const TASK_SUBMISSION_PATH = "/task-submission"
export const GUESTS_PATH = "/guests"
export const SERVICES_PATH = "/services"
// export const GUEST_SERVICES_PATH = "/guest-services"


export const DOMAIN = process.env.DOMAIN || "localhost"
export const ACQUISITION_MAIL = `sales@${DOMAIN}.com`



