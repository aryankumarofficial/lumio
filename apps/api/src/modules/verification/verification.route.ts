import {Router} from "express";
import {requestVerificationLinkController, verifyAccountController} from "./verification.conroller.js";

export const verificationRoutes: Router = Router();

verificationRoutes.post("/request", requestVerificationLinkController);

verificationRoutes.post("/account", verifyAccountController)