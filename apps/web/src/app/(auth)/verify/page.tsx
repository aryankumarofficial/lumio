import React from 'react'
import VerifyEmailForm from "../../../components/auth/verify-email-form";

interface VerifyPageProps {
    searchParams: Promise<{
        token?: string;
    }>
}

async function VerifyPage({searchParams}: VerifyPageProps) {
    const {token} = await searchParams;
    return (
        <VerifyEmailForm token={token}/>
    )
}

export default VerifyPage
