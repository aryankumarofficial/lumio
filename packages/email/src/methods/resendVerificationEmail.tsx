import {SendMailOptions} from "nodemailer";
import {pretty, render} from "@react-email/render";
import ResendVerificationEmail from "../templates/ResendVerificationEmail.js";
import {transporter} from "../mailer.js";

interface ResendVerificationEmailProps {
    name: string;
    email: string;
    link: string;
}

export const resendVerificationEmail = async ({email, name, link}: ResendVerificationEmailProps) => {
    try {
        const html = await pretty(
            await render(
                <ResendVerificationEmail name={name} link={link}/>
            )
        );
        const options: SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your new Lumio verification link',
            html
        }
        await transporter.sendMail(options);

    } catch (err) {
        throw new Error(
            "Failed to resend account Verification Email",
            {cause: err}
        )
    }
}