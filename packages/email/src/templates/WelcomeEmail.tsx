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

interface WelcomeEmailProps {
    name: string;
    dashboardLink: string;
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

export default function WelcomeEmail({
                                         name,
                                         dashboardLink,
                                     }: WelcomeEmailProps) {
    return (
        <Html lang="en">
            <Head />

            <Preview>
                Welcome to Lumio — your account is ready
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
                        <Text
                            style={{
                                margin: "0 0 12px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: colors.primary,
                            }}
                        >
                            EMAIL VERIFIED ✓
                        </Text>

                        <Heading
                            style={{
                                margin: "0 0 16px",
                                fontSize: "28px",
                                lineHeight: "36px",
                                fontWeight: 700,
                                color: colors.text,
                            }}
                        >
                            Welcome to Lumio, {name}!
                        </Heading>

                        <Text
                            style={{
                                margin: "0 0 20px",
                                fontSize: "16px",
                                lineHeight: "26px",
                                color: colors.muted,
                            }}
                        >
                            Your email address has been verified and your
                            Lumio account is now fully activated.
                        </Text>

                        <Text
                            style={{
                                margin: "0 0 28px",
                                fontSize: "16px",
                                lineHeight: "26px",
                                color: colors.muted,
                            }}
                        >
                            You're all set. Head over to Lumio and start
                            exploring your account.
                        </Text>

                        <Button
                            href={dashboardLink}
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
                            Open Lumio
                        </Button>

                        <Text
                            style={{
                                margin: "32px 0 0",
                                fontSize: "14px",
                                lineHeight: "22px",
                                color: colors.muted,
                            }}
                        >
                            Thanks for choosing Lumio. We're glad to have
                            you here.
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

WelcomeEmail.PreviewProps = {
    name: "Aryan",
    dashboardLink: "https://lumio.example.com/dashboard",
} satisfies WelcomeEmailProps;