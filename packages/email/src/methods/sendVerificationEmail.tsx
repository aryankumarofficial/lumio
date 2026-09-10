import {transporter} from "../mailer.js";
import {pretty, render} from "@react-email/render";
import AccountActivationEmail from "../templates/AccountActivationEmail.js";
import {SendMailOptions} from "nodemailer";

interface SendVerificationEmailProps {
    name: string;
    email: string;
    link: string;
}

export const sendVerificationEmail = async ({name, email, link}: SendVerificationEmailProps) => {
    try {
        const html = await pretty(
            await render(
                <AccountActivationEmail name={name} link={link}/>
            )
        );
        const options: SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Action required: Verify your Lumio account",
            html
        }

        await transporter.sendMail(options);

    } catch (err) {
        throw new Error(
            "Failed to send Account Verification Email",
            {cause: err}
        );
    }
}