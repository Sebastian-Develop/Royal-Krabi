import * as React from "react";
import { Text } from "@react-email/components";
import { AuthLayout, AuthAction, authText, authFooter } from "./auth-layout";

interface Props { token: string; }
export const ReauthenticationEmail = ({ token }: Props) => (
  <AuthLayout title="Identität bestätigen" preview={`Ihr Sicherheitscode für Royal Krabi.`}>
    <Text style={authText}>Verwenden Sie den folgenden Sicherheitscode, um Ihre Identität zu bestätigen:</Text>
    <Text style={{ ...authText, fontFamily: "Arial, sans-serif", fontSize: "28px", fontWeight: "700", textAlign: "center" }}>{token}</Text>
    <Text style={authFooter}>Falls Sie diesen Code nicht angefordert haben, können Sie diese E-Mail ignorieren. Geben Sie den Code nicht an andere Personen weiter.</Text>
  </AuthLayout>
);
export default ReauthenticationEmail;
