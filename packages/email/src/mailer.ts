import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

if (!user || !pass) {
    console.log("CREDS: ", {user, pass})
    throw new Error("MISSING AUTH CREDENTIALS!");
}

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user,
        pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
});
