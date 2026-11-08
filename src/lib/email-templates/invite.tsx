import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { siteName: string; siteUrl: string; confirmationUrl: string; }
export const InviteEmail = ({ siteName, confirmationUrl }: Props) => (
  <AuthLayout title="Ihre Einladung" preview={`Ihre Einladung zu ${siteName}.`}>
    <Text style={authText}>Sie wurden eingeladen, einen Zugang zu {siteName} einzurichten. Über den folgenden Link können Sie die Einladung annehmen.</Text>
    <AuthAction href={confirmationUrl}>Einladung annehmen</AuthAction>
    <Text style={authFooter}>Falls Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail ignorieren.</Text>
  </AuthLayout>
);
export default InviteEmail;
