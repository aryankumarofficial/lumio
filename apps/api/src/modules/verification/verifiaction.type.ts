import {VerificationType} from "@repo/db"

export interface ValidVerificationInput {
    token: string;
    type: VerificationType;
}

export interface GenerateVerification {
    userId:string;
    email:string;
}