<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared brand chrome and editable spa content centralized in reusable components/data modules so all twenty routes remain visually consistent and easy to update.
- Keep massage, partial massage, duration-specific pair upgrades and literal subscription offer prices in the shared content module; derive voucher amounts and subscription regular totals from individual prices to prevent drift.
- Treat the uploaded home-page composition as the structural visual reference; use the original reception and logo assets rather than embedding the reference screenshot.
- Contact data, hours and the mailto template live only in src/lib/contact.ts; pages import them so every page shows identical details.
- Keep withdrawal contact links in the shared contact module separate from appointment templates; isolate withdrawal print styles so other legal pages remain unchanged.
- Use the shared BrandHeading for the home introduction and explicitly opted-in page headers so the brand name and gold diamond divider always share the same styling.
- Keep price-page photo mappings separate from price data and render permanent images through shared massage-card components, so presentation changes cannot alter massage prices or other pages.
- Keep native semantic gold cursor assets and the single decorative canvas in the root-mounted cursor system; native cursor fallbacks preserve precise input and reduced-motion accessibility.
- Derive the shop catalog from shared voucher and subscription data; keep per-product payment-link fields and a fail-closed sales gate separate from pricing to prevent unintended payment activation.
- Exclude Bun test files from the browser application TypeScript program because Bun's global fetch augmentation conflicts with generated Cloud fetch adapters; run the tests separately with Bun.
- Centralize interim launch copy and the public/full-site switch in the launch module; enforce the public exact-path allowlist at the server entry and root navigation boundary so draft pages cannot be opened directly while previews retain all existing routes.
- Select launch presentation from the request hostname using an isomorphic helper, never forwarded headers or a public query bypass; preview-only view selection preserves internal full-site editing without creating customer accounts.
- Protect applicant-email text with Gmail-only screen/difference wrappers and Outlook text-fill fallbacks, excluding images; use Outlook-only VML background, explicit image dimensions and fixed social cells while preserving fluid layout in other clients.

## GitHub sync
- Push site changes to github.com/Sebastian-Develop/Royal-Krabi (branch main) after each meaningful change via https://connector-gateway.lovable.dev/github with headers `Authorization: Bearer $LOVABLE_API_KEY` and `X-Connection-Api-Key: $GITHUB_API_KEY`; use Git Data API with `base_tree` and only changed files, since full-tree posts (155 entries) fail with 422.
