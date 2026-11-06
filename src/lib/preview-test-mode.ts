import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { isPaymentPreview } from "./launch";

export const getPreviewTestMode = createIsomorphicFn()
  .server(() => isPaymentPreview(new URL(getRequest().url).hostname))
  .client(() => isPaymentPreview(window.location.hostname));