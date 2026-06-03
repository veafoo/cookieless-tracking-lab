# Cookieless Tracking Lab

Working reference implementations for **server-side tagging, Consent Mode v2, and cookieless
attribution** — the three problems every advertiser is fighting in 2025–2026 as third-party
cookies disappear and consent enforcement tightens.

This is a hands-on lab, not a slide deck. Each module is a small, self-contained, documented
piece you can read, run, and adapt.

## Why this exists

I spent nine years at [ADventori](https://www.adventori.com/) building the data and tracking
layer behind large advertiser accounts (Renault, Nissan, Volkswagen, GMF, P&G…). Two things I
built back then are now mainstream concerns:

- a **proprietary server-side collection system** — before Google shipped server-side GTM;
- a **cookieless attribution method based on an Impression ID** (a GCLID-style identifier),
  built before Google's own equivalent.

This repo re-expresses that work in today's standard tools and keeps it current. It's also my
answer to a fair question: *after time away from the field, are you still up to date?* The code
here is dated 2026 and speaks for itself.

## Modules

| Module | What it covers |
|--------|----------------|
| [`consent-mode-v2/`](./consent-mode-v2) | Google Consent Mode v2 done right: `denied`-by-default, the four v2 signals (`ad_user_data`, `ad_personalization`, `ad_storage`, `analytics_storage`), `wait_for_update`, and wiring an IAB TCF CMP to the consent state. |
| [`sgtm/`](./sgtm) | Server-side GTM: why and how. Architecture, first-party data flow, a GA4 server client, and a forwarding tag — the modern form of the proprietary server-side system I built at ADventori. |
| [`cookieless-attribution/`](./cookieless-attribution) | Last-touch attribution **without cookies**, in BigQuery, using a durable Impression ID instead of a third-party identifier. |

## Stack

BigQuery / SQL · server-side GTM · gtag / Consent Mode v2 · JavaScript · IAB TCF.

## Author

**Radwan Mezzi** — tracking & server-side data architect, ex-ADventori (9 years), DPO.
Designed and deployed an IAB TCF CMP end to end; built ADventori's pre-GTM server-side
collection and its cookieless Impression ID attribution.

- GitHub: [@veafoo](https://github.com/veafoo)
- LinkedIn: [radwan-mezzzi](https://linkedin.com/in/radwan-mezzzi)

## License

MIT — see [LICENSE](./LICENSE).
