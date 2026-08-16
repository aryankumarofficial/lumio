import {VerificationType} from "@repo/db"

export interface ValidVerificationInput {
    token: string;
    type: VerificationType;
}