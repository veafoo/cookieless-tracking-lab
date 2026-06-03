# Consent Mode v2

Since March 2024, Google requires **Consent Mode v2** to keep using EEA/UK traffic for ad
personalization and measurement. v2 adds two signals on top of the original four:

| Signal | Controls |
|--------|----------|
| `ad_storage` | Cookies/identifiers for advertising |
| `analytics_storage` | Cookies/identifiers for analytics |
| **`ad_user_data`** *(v2)* | Whether user data may be **sent** to Google for ads |
| **`ad_personalization`** *(v2)* | Whether data may be used for **remarketing/personalization** |
| `functionality_storage` | Site functionality (preferences) |
| `security_storage` | Security, fraud prevention |

## The rule that matters

**Default everything to `denied` before any tag loads.** Then `update` only after the user
acts in the CMP. Anything granted before consent is a breach — and the single most common
mistake I see in audits.

`wait_for_update` holds tags briefly so the CMP signal arrives before they fire; if consent is
granted, tags run normally; if denied, Google's *conversion modeling* fills the gap from
consented traffic, so you don't lose all measurement.

## Files

- [`consent-init.js`](./consent-init.js) — the default block (loads **first**, before GTM/gtag)
  and a CMP-acceptance handler that issues the `update`.

## Wiring order (non-negotiable)

```
1. consent-init.js        → gtag('consent','default', … 'denied')   ← head, before everything
2. CMP loads, user acts
3. CMP callback           → gtag('consent','update', … per choice)
4. GTM / tags fire (gated on consent state)
```

## TCF note

With an IAB **TCF** CMP, the consent string (`__tcfapi`) is the source of truth. Map TCF
purposes to the Google signals rather than reading a custom cookie:
Purpose 1 → storage, Purposes 3/4 → `ad_personalization`/`ad_user_data`, Purposes 7/8/9 →
`analytics_storage` / ads measurement. `consent-init.js` shows both a generic and a TCF path.
