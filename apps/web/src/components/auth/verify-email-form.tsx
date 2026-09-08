"use client";
import {useEffect, useReducer} from "react";
import {authApi} from "../../lib/api";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@repo/ui/components/ui/card";
import {CircleCheck, CircleX, Loader2, Mail} from "lucide-react";
import {Button} from "@repo/ui/components/ui/button";
import Link from "next/link";
import ResendVerificationForm from "./resend-verification-form";

interface VerifyEmailFormProps {
    token?: string;
}

type Status = 'verifying' | 'success' | 'error';

interface State {
    status: Status;
    message: string | null;
}

interface ResponseType {
    success: boolean;
    message: string;
}

type Action =
    | { type: 'SUCCESS', payload: string }
    | { type: 'ERROR', payload: string }

const initialState: State = {
    status: "verifying",
    message: null,
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SUCCESS":
            return {
                status: "success",
                message: action.payload,
            }
        case "ERROR":
            return {
                status: "error",
                message: action.payload,
            }
        default:
            return state
    }
}

export default function VerifyEmailForm({token}: VerifyEmailFormProps) {
    const [state, dispatch] = useReducer(
        reducer,
        initialState,
    );
    useEffect(() => {
        if (!token) {
            dispatch({
                type: "ERROR",
                payload: "Verification token is missing"
            })

            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const {success, message} = (await authApi.verifyAccount({token: token!})) as ResponseType;

                if (cancelled) return;

                if (!success) {
                    dispatch({
                        type: "ERROR",
                        payload: "Failed to verify Account"
                    })
                }

                dispatch({
                    type: "SUCCESS",
                    payload: "Your email has been verified successfully."
                })

                toast.success(message || "Account has been verified successfully.");
            } catch (err) {
                if (cancelled) return;
                console.error((err as Error).message);
                const message = err instanceof Error
                    ? err.message
                    : 'This verification Link is invalid or has expired';
                dispatch({
                    type: "ERROR",
                    payload: "Failed to verify Account",
                })

                toast.error(message || "Failed to verify Account");
            }

        })();

        return () => {
            cancelled = true;
        }

    }, [token]);

    if (state.status === "verifying") {
        return (
            <Card className={"border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur"}>
                <CardHeader>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Lumio
                    </p>

                    <CardTitle className="text-2xl">
                        Verifying your email
                    </CardTitle>

                    <CardDescription>
                        Please wait while we verify your email address.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-8 animate-spin text-primary"/>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (state.status === "success") {
        return (
            <Card className="border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur">
                <CardHeader className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Lumio
                    </p>

                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <CircleCheck className="size-5 text-primary"/>
                    </div>

                    <CardTitle className="text-2xl">
                        Email verified
                    </CardTitle>

                    <CardDescription>
                        {state.message}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/login">
                            Continue to sign in
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={"space-y-6"}>
            <Card className="border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur">
                <CardHeader className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Lumio
                    </p>

                    <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                        <CircleX className="size-5 text-destructive"/>
                    </div>

                    <CardTitle className="text-2xl">
                        Verification failed
                    </CardTitle>

                    <CardDescription>
                        {state.message ??
                            'This verification link is invalid or has expired.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                        <Mail className="mb-2 size-4"/>
                        You can request a new verification link using the
                        form below.
                    </div>
                </CardContent>
            </Card>

            <ResendVerificationForm/>

            <p className="text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="text-primary underline-offset-4 hover:underline"
                >
                    Back to sign in
                </Link>
            </p>
        </div>
    )
}