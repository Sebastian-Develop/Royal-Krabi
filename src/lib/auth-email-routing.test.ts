import { expect, test } from "bun:test";
import { launch, shouldRedirectDuringLaunch } from "./launch";

test("managed auth email endpoints remain reachable when the public launch gate is on", () => {
  const original = launch.publicComingSoon;
  try {
    launch.publicComingSoon = true;
    for (const path of ["/lovable/email/auth/webhook", "/lovable/email/auth/preview"]) {
      expect(shouldRedirectDuringLaunch(new URL(path, "https://royalkrabi-thaimassage.de"))).toBe(false);
    }
    expect(shouldRedirectDuringLaunch(new URL("/checkout", "https://royalkrabi-thaimassage.de"))).toBe(true);
  } finally {
    launch.publicComingSoon = original;
  }
});