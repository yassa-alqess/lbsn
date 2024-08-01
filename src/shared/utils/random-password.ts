import crypto from 'crypto'
export default function generateRandomPassword(length = 8) {

    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}