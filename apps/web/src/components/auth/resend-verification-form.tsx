"use client";

import React, {useCallback, useEffect, useMemo, useReducer, useRef} from 'react'
import {authApi} from "../../lib/api";
import {toast} from "sonner";
import {CircleCheck, Loader2, Mail} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@repo/ui/components/ui/card";
import {Button} from "@repo/ui/components/ui/button";
import Link from "next/link";
import {Field, FieldContent, FieldDescription, FieldError, FieldLabel} from "@repo/ui/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@repo/ui/components/ui/input-group";

interface ResendVerificationFormProps {
    email?: string
}

type FormState = "idle" | "submitting" | "success" | "error";

interface State {
    email: string
    status: FormState
    error: string | null
    cooldown: number
}

interface ResponseType {
    success: boolean;
    message: string
}

type Action =
    | { type: 'SET_EMAIL'; payload: string }
    | { type: 'SUBMIT' }
    | { type: 'SUCCESS' }
    | { type: 'ERROR'; payload: string }
    | { type: 'RESET' }
    | { type: 'TICK' }


const COOLDOWN_SECONDS = 30;

const initialState = (email: string): State => ({
    email,
    status: "idle",
    error: null,
    cooldown: 0,
})

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_EMAIL":
            return {
                ...state,
                email: action.payload,
                error: null,
            }
        case "SUBMIT":
            return {
                ...state,
                status: "submitting",
                error: null,
            }
        case "SUCCESS":
            return {
                ...state,
                status: "success",
                error: null,
                cooldown: COOLDOWN_SECONDS,
            }
        case "ERROR":
            return {
                ...state,
                status: "error",
                error: action.payload,
            }

        case "RESET":
            return {
                ...state,
                status: "idle",
                error: null,
            }
        case "TICK":
            return {
                ...state,
                cooldown: Math.max(0, state.cooldown - 1)
            }
        default:
            return state;
    }
}

function validateEmail(email: string): string | null {
    const value = email.trim();
    if (!value) return "Email is required";

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Please enter a valid email address";
    return null;
}

const ResendVerificationForm = ({email: initialEmail = ''}: ResendVerificationFormProps) => {
    const [state, dispatch] = useReducer(
        reducer,
        initialEmail,
        initialState
    );
    const mountedRef = useRef(true);
    const cooldownTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isSubmitting = state.status === "submitting";
    const isSuccess = state.status === "success";
    const isCooldownActive = state.cooldown > 0;

    const canSubmit = useMemo(() => {
        return (
            !isSubmitting &&
            !isCooldownActive &&
            validateEmail(state.email) === null
        )
    }, [state.email, isSubmitting, isCooldownActive]);

    useEffect(() => {
        // Keep track of the component lifecycle to prevent state after component unmount
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            if (cooldownTimeRef.current) {
                clearInterval(cooldownTimeRef.current);
            }
        }
    }, [])

    // countdown timer
    useEffect(() => {
        if (state.cooldown <= 0) {
            if (cooldownTimeRef.current) {
                clearInterval(cooldownTimeRef.current);
                cooldownTimeRef.current = null;
            }

            return;
        }

        cooldownTimeRef.current = setInterval(() => {
            if (mountedRef.current) {
                dispatch({type: "TICK"})
            }
        }, 1000)

        return () => {
            if (cooldownTimeRef.current) {
                clearInterval(cooldownTimeRef.current);
                cooldownTimeRef.current = null;
            }
        }

    }, [state.cooldown]);

    const handleEmailChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch({
                type: "SET_EMAIL",
                payload: event.target.value
            })
        },
        []
    )

    const handleSubmit = useCallback(async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const email = state.email.trim();
        const validationError = validateEmail(email);

        if (validationError) {
            dispatch({
                type: "ERROR",
                payload: validationError,
            })

            return;
        }

        dispatch({type: "SUBMIT"});

        try {
            const {success, message} = await authApi.requestVerification({email}) as ResponseType;
            if (!mountedRef.current) return;
            dispatch({type: "SUCCESS"});

            if (success)
                toast.success(message || "Verification email sent!");
            else toast.error(message || "Failed to send verification email");
        } catch (err) {
            if (!mountedRef.current) return;

            const message = err instanceof Error
                ? err.message
                : "Unable to Resend Verification Email";

            dispatch({
                type: "ERROR",
                payload: message
            });

            toast.error(message);
        }

    }, [state.email]);

    const handleResendAgain = useCallback(() => {
        if (state.cooldown > 0) return;

        dispatch({type: "RESET"});
    }, [state.cooldown]);

    const buttonContent = useMemo(() => {
        if (isSubmitting)
            return (
                <>
                    <Loader2 className={"size-4 animate-spin"}/>
                    Sending Verification Email...
                </>
            )
        if (isCooldownActive) return `Resend Available in ${state.cooldown}s`;
        return `Resend Verification Email`
    }, [isSubmitting, isCooldownActive, state.cooldown]);

    return (
        <Card className={"border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur-sm"}>
            <CardHeader className={"space-y-2"}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Lumio
                </p>

                {isSuccess ?
                    (
                        <>
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                <CircleCheck className="size-5 text-primary"/>
                            </div>

                            <CardTitle className="text-2xl">
                                Check your email
                            </CardTitle>

                            <CardDescription>
                                We sent a new verification link to{' '}
                                <span className="font-medium text-foreground">
                                {state.email}
                              </span>.
                            </CardDescription>
                        </>
                    ) : (<>
                            <CardTitle className="text-2xl">
                                Resend verification email
                            </CardTitle>

                            <CardDescription>
                                Your verification link may have expired. Enter your email
                                address and we&apos;ll send you a new one.
                            </CardDescription>
                        </>
                    )
                }
            </CardHeader>
            <CardContent>
                {
                    isSuccess ? (
                        <div className="space-y-5">
                            <div
                                className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                                Check your inbox and spam folder. Your new verification
                                link will expire after a limited time.
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleResendAgain}
                                disabled={isCooldownActive}
                            >
                                {isCooldownActive
                                    ? `Resend again in ${state.cooldown}s`
                                    : 'Resend again'}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                <Link
                                    href="/login"
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Back to sign in
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>

                                <FieldContent>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Mail className="size-4"/>
                                        </InputGroupAddon>

                                        <InputGroupInput
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            value={state.email}
                                            onChange={handleEmailChange}
                                            disabled={isSubmitting}
                                            aria-invalid={Boolean(state.error)}
                                        />
                                    </InputGroup>

                                    <FieldDescription>
                                        Enter the email address you used to create your
                                        account.
                                    </FieldDescription>

                                    <FieldError
                                        errors={
                                            state.error
                                                ? [{message: state.error}]
                                                : []
                                        }
                                    />
                                </FieldContent>
                            </Field>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!canSubmit}
                            >
                                {buttonContent}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Remember your password?{' '}
                                <Link
                                    href="/login"
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    )
                }
            </CardContent>
        </Card>
    )
}
export default ResendVerificationForm
