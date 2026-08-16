import {Router} from "express";
import {requestVerificationLinkController} from "./verification.conroller.js";

export const verificationRoutes: Router = Router();

verificationRoutes.post("/request", requestVerificationLinkController);
