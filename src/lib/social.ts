/** Single source for Royal Krabi social profiles (website footers + application email). Empty href = profile URL not yet supplied. */
export const socialProfiles = [
  { id: "instagram", name: "Instagram", href: "https://www.instagram.com/royalkrabithaimassage" },
  { id: "tiktok", name: "TikTok", href: "https://www.tiktok.com/@royal.krabiserenit" },
  { id: "facebook", name: "Facebook", href: "https://www.facebook.com/Royalkrabiserenitythaimassage/" },
  { id: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com/company/royal-krabi-serenity-thaimassage" },
  { id: "tripadvisor", name: "Tripadvisor", href: "https://www.tripadvisor.de/Attraction_Review-g187344-d34753495-Reviews-Royal_Krabi_Serenity_Thaimassage-Offenbach_Hesse.html" },
] as const;

export const socialHref = (name: string) => socialProfiles.find((p) => p.name === name)?.href ?? "";
