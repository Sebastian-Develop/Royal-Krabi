import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { siteName: string; oldEmail: string; email: string; newEmail: string; confirmationUrl: string; }
export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: Props) => (
  <AuthLayout title="E-Mail-Änderung bestätigen" preview={`E-Mail-Änderung für ${siteName} bestätigen.`}>
    <Text style={authText}>Sie haben eine Änderung Ihrer E-Mail-Adresse bei {siteName} angefordert{oldEmail ? ` von ${oldEmail}` : ""}{newEmail ? ` zu ${newEmail}` : ""}. Bitte bestätigen Sie diese Änderung.</Text>
    <AuthAction href={confirmationUrl}>Änderung bestätigen</AuthAction>
    <Text style={authFooter}>Falls Sie diese Änderung nicht angefordert haben, sichern Sie bitte Ihren Zugang.</Text>
  </AuthLayout>
);
export default EmailChangeEmail;
