import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { siteName: string; confirmationUrl: string; }
export const MagicLinkEmail = ({ siteName, confirmationUrl }: Props) => (
  <AuthLayout title="Ihr Anmeldelink" preview={`Ihr sicherer Anmeldelink für ${siteName}.`}>
    <Text style={authText}>Über den folgenden Link können Sie sich bei {siteName} anmelden.</Text>
    <AuthAction href={confirmationUrl}>Anmelden</AuthAction>
    <Text style={authFooter}>Falls Sie diesen Link nicht angefordert haben, können Sie diese E-Mail ignorieren.</Text>
  </AuthLayout>
);
export default MagicLinkEmail;
