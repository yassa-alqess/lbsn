import path from "path"

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
export const OTT_SECRET = process.env.OTT_SECRET || ""
export const OTT_EXPIRY = process.env.OTT_EXPIRY || "3m"


// mail constants
export const MAIL_HOST = process.env.MAIL_HOST || ""
export const MAIL_USER = process.env.MAIL_USER || ""
export const MAIL_PASS = process.env.MAIL_PASS || ""
export const MAIL_PORT = process.env.MAIL_PORT || ""



// paths
export const APPOINTMENTS_PATH = "appointments"
export const USERS_PATH = "users"
export const AUTH_PATH = "auth"
export const LEADS_PATH = "leads"
export const SALES_PATH = "sales"
export const TICKETS_PATH = "tickets"
export const TASKS_PATH = "tasks"
export const GUESTS_PATH = "guests"
export const REQUESTS_PATH = "requests"
export const SERVICES_PATH = "services"
export const CATEGORIES_PATH = "categories"
export const PROFILES_PATH = "profiles"
export const TIME_SLOTS_PATH = "time-slots"
export const ROLES_PATH = "roles"
export const WARM_LEADS_PATH = "warm-leads"
export const CONTACT_US_PATH = "contact-us"
export const OVERVIEW_PATH = "overview"
export const DOWNLOAD_PATH = "download"
export const CAREERS_PATH = "careers"
export const JOBS_PATH = "jobs"
export const APPLICATIONS_PATH = "applications"


export const DOMAIN = process.env.DOMAIN;
export const ACQUISITION_MAIL = DOMAIN ? `sales@${DOMAIN}` : "";
export const MAIN_MAIL = `salesleadbull@gmail.com`
export const PASSWORD = process.env.PASSWORD || "salesleadbull@COM"


export const ENV = process.env.NODE_ENV || 'dev';
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || ""
export const DATABASE_NAME = process.env.DATABASE_NAME || ""
export const SCHEMA = process.env.SCHEMA || ""
export const REDIS_URL = process.env.REDIS_URL || ""

export const MEETING_API_URL = "https://zoom.us/v2/users/me/meetings"
export const MEETING_AUTH_API_URL = "https://zoom.us"
export const MEETING_ACCOUNT_ID = process.env.MEETING_ACCOUNT_ID || ""
export const MEETING_CLIENT_ID = process.env.MEETING_CLIENT_ID || ""
export const MEETING_CLIENT_SECRET = process.env.MEETING_CLIENT_SECRET || ""

export const LEAD_FETCH_INTERVAL = '1m'


export const FILE_URL = path.join(__dirname, '../../../upload');
export const USER_IMAGES_PATH = `${FILE_URL}/users/images`
export const TASKS_FILES_PATH = `${FILE_URL}/tasks`
export const TASK_SUBMISSIONS_FILES_PATH = `${FILE_URL}/tasks/submissions`
export const TICKETS_FILES_PATH = `${FILE_URL}/tickets`
export const APPLICATIONS_FILES_PATH = `${FILE_URL}/careers/applications`