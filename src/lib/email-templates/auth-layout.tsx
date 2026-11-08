import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { brandColors, emailSocials } from "../application-email";
import { contact } from "../contact";
import logo from "@/assets/email/email-logo.png.asset.json";
import divider from "@/assets/email/email-gold-divider.png.asset.json";

const absolute = (url: string) => url.startsWith("https://") ? url : contact.website + url;
export const authText = { color: brandColors.cream, fontSize: "16px", lineHeight: "1.7", margin: "0 0 20px" };
export const authFooter = { ...authText, fontSize: "13px" };
export const authLink = { color: brandColors.cream, textDecoration: "underline" };

/** React-only counterpart of the shared brand shell: recipient data is always escaped. */
export function AuthLayout({ title, preview, children }: { title: string; preview: string; children: React.ReactNode }) {
  return <Html lang="de" dir="ltr"><Head /><Preview>{preview}</Preview>
    <Body style={{ backgroundColor: "#ffffff", margin: "0", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <Container style={{ maxWidth: "600px", width: "100%", backgroundColor: brandColors.mahogany, padding: "28px 24px", color: brandColors.cream }}>
        <Img src={absolute(logo.url)} width="200" height="172" alt={contact.name} style={{ margin: "0 auto", maxWidth: "100%", height: "auto" }} />
        <Img src={absolute(divider.url)} width="552" height="37" alt="" style={{ width: "100%", height: "auto", margin: "18px 0 28px" }} />
        <Heading style={{ color: brandColors.cream, fontSize: "26px", fontWeight: "600", lineHeight: "1.3", textAlign: "center", margin: "0 0 24px" }}>{title}</Heading>
        {children}
        <Section style={{ borderTop: `1px solid ${brandColors.gold}`, paddingTop: "22px", marginTop: "28px" }}>
          <Text style={authText}>{contact.name}</Text>
          <Text style={authFooter}>Öffnungszeiten:<br />{contact.hoursOpen}<br />{contact.hoursClosed}<br />
            Telefon: <Link href={contact.phoneHref} style={authLink}>{contact.phone}</Link><br />
            <Link href={`mailto:${contact.email}`} style={authLink}>{contact.email}</Link>
          </Text>
          <Section style={{ textAlign: "center" }}>{emailSocials.map(social => <Link key={social.name} href={social.href || contact.website} style={{ display: "inline-block", padding: "6px" }}><Img src={social.icon} width="34" height="34" alt={social.name} /></Link>)}</Section>
          <Text style={{ ...authFooter, textAlign: "center" }}>{contact.street} · {contact.city}</Text>
        </Section>
      </Container>
    </Body>
  </Html>;
}

export function AuthAction({ href, children }: { href: string; children: React.ReactNode }) {
  return <Button href={href} style={{ backgroundColor: brandColors.gold, color: brandColors.mahogany, border: `1px solid ${brandColors.gold}`, borderRadius: "3px", padding: "14px 22px", fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>{children}</Button>;
}