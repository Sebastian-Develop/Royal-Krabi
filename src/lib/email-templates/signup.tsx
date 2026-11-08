import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string; }
export const SignupEmail = ({ siteName, recipient, confirmationUrl }: Props) => (
  <AuthLayout title="E-Mail-Adresse bestätigen" preview={`E-Mail-Adresse für ${siteName} bestätigen.`}>
    <Text style={authText}>Bitte bestätigen Sie Ihre E-Mail-Adresse {recipient} für {siteName}.</Text>
    <AuthAction href={confirmationUrl}>E-Mail-Adresse bestätigen</AuthAction>
    <Text style={authFooter}>Falls Sie keinen Zugang angefordert haben, können Sie diese E-Mail ignorieren.</Text>
  </AuthLayout>
);
export default SignupEmail;
