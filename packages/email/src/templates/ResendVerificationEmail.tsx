import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "react-email";
import * as React from "react";

interface ResendVerificationEmailProps {
    name: string;
    link: string;
}

const colors = {
    background: "#f6f8fb",
    card: "#ffffff",
    primary: "#635bff",
    text: "#171717",
    muted: "#667085",
    border: "#e4e7ec",
};

const fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function ResendVerificationEmail({
                                                    name,
                                                    link,
                                                }: ResendVerificationEmailProps) {
    return (
        <Html lang="en">
            <Head />

            <Preview>
                Your new Lumio verification link
            </Preview>

            <Body
                style={{
                    margin: 0,
                    padding: "40px 16px",
                    backgroundColor: colors.background,
                    fontFamily,
                }}
            >
                <Container
                    style={{
                        maxWidth: "560px",
                        margin: "0 auto",
                        backgroundColor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <Section
                        style={{
                            padding: "28px 32px",
                            borderBottom: `1px solid ${colors.border}`,
                        }}
                    >
                        <Text
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: 700,
                                color: colors.text,
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Lumio
                        </Text>
                    </Section>

                    {/* Content */}
                    <Section style={{ padding: "40px 32px" }}>
                        <Heading
                            style={{
                                margin: "0 0 16px",
                                fontSize: "28px",
                                lineHeight: "36px",
                                fontWeight: 700,
                                color: colors.text,
                            }}
                        >
                            Verify your email
                        </Heading>

                        <Text
                            style={{
                                margin: "0 0 16px",
                                fontSize: "16px",
                                lineHeight: "26px",
                                color: colors.text,
                            }}
                        >
                            Hi {name},
                        </Text>

                        <Text
                            style={{
                                margin: "0 0 28px",
                                fontSize: "16px",
                                lineHeight: "26px",
                                color: colors.muted,
                            }}
                        >
                            You requested a new verification link for your
                            Lumio account. Click the button below to verify
                            your email address.
                        </Text>

                        <Button
                            href={link}
                            style={{
                                display: "inline-block",
                                padding: "13px 22px",
                                backgroundColor: colors.primary,
                                color: "#ffffff",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Verify Email
                        </Button>

                        <Text
                            style={{
                                margin: "28px 0 0",
                                fontSize: "13px",
                                lineHeight: "20px",
                                color: colors.muted,
                            }}
                        >
                            If you didn't request a new verification link,
                            you can safely ignore this email.
                        </Text>

                        <Text
                            style={{
                                margin: "24px 0 0",
                                paddingTop: "20px",
                                borderTop: `1px solid ${colors.border}`,
                                fontSize: "12px",
                                lineHeight: "18px",
                                color: colors.muted,
                                wordBreak: "break-all",
                            }}
                        >
                            If the button doesn't work, copy and paste this
                            link into your browser:
                            <br />
                            {link}
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section
                        style={{
                            padding: "20px 32px",
                            backgroundColor: "#fafafa",
                            borderTop: `1px solid ${colors.border}`,
                        }}
                    >
                        <Text
                            style={{
                                margin: 0,
                                fontSize: "12px",
                                color: colors.muted,
                                textAlign: "center",
                            }}
                        >
                            © {new Date().getFullYear()} Lumio. All rights
                            reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

ResendVerificationEmail.PreviewProps = {
    name: "Aryan",
    link: "https://lumio.example.com/verify/xyz789",
} satisfies ResendVerificationEmailProps;