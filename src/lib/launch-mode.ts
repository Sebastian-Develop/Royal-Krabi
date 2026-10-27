import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { isPublicComingSoon } from "./launch";

/** No RPC or public bypass endpoint is necessary for this request-scoped mode. */
export const getPublicLaunchMode = createIsomorphicFn()
  .server(() => isPublicComingSoon(new URL(getRequest().url).hostname))
  .client(() => isPublicComingSoon(window.location.hostname));