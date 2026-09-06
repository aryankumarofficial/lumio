import "dotenv/config";
import {pretty, render} from "@react-email/render";
import WelcomeEmail from "../templates/WelcomeEmail";
import {SendMailOptions} from "nodemailer";
import {transporter} from "../mailer";

interface SendWelcomeEmailProps {
    name: string;
    email: string;
}

export const sendWelcomeEmail = async ({name, email}: SendWelcomeEmailProps) => {
    try {
        const html = await pretty(
            await render(
                <WelcomeEmail name={name} dashboardLink={`${process.env.APP_URL}/notes`}/>
            )
        );

        const options: SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to the Lumio",
            html
        }

        await transporter.sendMail(options);
    } catch (err) {
        throw new Error(
            "Failed to Welcome Email",
            {cause: err}
        )
    }
}