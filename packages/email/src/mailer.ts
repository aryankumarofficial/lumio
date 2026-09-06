import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

if (!user || !pass) {
    console.log("CREDS: ", {user, pass})
    throw new Error("MISSING AUTH CREDENTIALS!");
}

console.log({
    cwd: process.cwd(),
    hasEmailUser: Boolean(process.env.EMAIL_USER),
    hasEmailPassword: Boolean(process.env.EMAIL_PASSWORD),
});

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user,
        pass,
    }
});

(async () => {
    try {
        await transporter.verify();
        console.log("SMTP authenticated successfully.");
    } catch (err) {
        throw new Error("Failed to Connect SMTP Server")
    }
})()