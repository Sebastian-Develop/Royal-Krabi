/** Single source for Royal Krabi social profiles (website footers + application email). Empty href = profile URL not yet supplied. */
export const socialProfiles = [
  { id: "instagram", name: "Instagram", href: "https://www.instagram.com/royalkrabithaimassage" },
  { id: "tiktok", name: "TikTok", href: "" },
  { id: "facebook", name: "Facebook", href: "https://www.facebook.com/share/1hXpHYZZo6/" },
  { id: "linkedin", name: "LinkedIn", href: "" },
  { id: "tripadvisor", name: "Tripadvisor", href: "https://www.tripadvisor.de/Attraction_Review-g187344-d34753495-Reviews-Royal_Krabi_Serenity_Thaimassage-Offenbach_Hesse.html" },
] as const;

export const socialHref = (name: string) => socialProfiles.find((p) => p.name === name)?.href ?? "";
