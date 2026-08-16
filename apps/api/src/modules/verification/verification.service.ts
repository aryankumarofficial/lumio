import {createVerification} from "./verification.repository.js";
import {GenerateVerification} from "./verifiaction.type.js";
import {signToken} from "../../lib/jwt.js";

export const sendAccountVerification = async (payload: GenerateVerification) => {
    const token = signToken(payload);
    const newVerification = await createVerification({
        type: "email_verification",
        userId: payload.userId,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${token}&uid=${payload.userId}`
    return {verificationUrl, newVerification};
}