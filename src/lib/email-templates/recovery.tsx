import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { siteName: string; confirmationUrl: string; }
export const RecoveryEmail = ({ siteName, confirmationUrl }: Props) => (
  <AuthLayout title="Passwort zurücksetzen" preview={`Passwort für ${siteName} zurücksetzen.`}>
    <Text style={authText}>Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts für {siteName} erhalten. Über den folgenden Link können Sie ein neues Passwort festlegen.</Text>
    <AuthAction href={confirmationUrl}>Neues Passwort festlegen</AuthAction>
    <Text style={authFooter}>Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.</Text>
  </AuthLayout>
);
export default RecoveryEmail;
