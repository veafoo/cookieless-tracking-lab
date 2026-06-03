# Cookieless attribution (BigQuery)

Last-touch attribution **without third-party cookies**, using a durable **Impression ID**
stamped server-side (see [`sgtm/`](../sgtm)) instead of a cross-site identifier.

This is the method I built at ADventori before Google's equivalent: every ad impression carries
its own ID; conversions reference the impression they came from; attribution is then a join on
that ID inside a time window — no cookie, no cross-site tracking.

## The idea

```
impressions:  impression_id · campaign_id · ts        (one row per served impression)
conversions:  conversion_id · impression_id · ts · value
```

A conversion may not always carry its originating `impression_id` directly (e.g. cross-device,
or the click landed without it). When it does, attribution is exact. When it doesn't, we fall
back to a **last-touch within an N-day window** on a durable, privacy-safe signal — never a
third-party cookie.

## Files

- [`impression_id_attribution.sql`](./impression_id_attribution.sql) — BigQuery. Exact join on
  `impression_id` when present, last-touch fallback within a 30-day window otherwise.

## Why it holds up in 2026

- No reliance on `_ga` / third-party cookies → survives ITP, cookie deprecation, consent denial.
- The join key is **first-party and minimal** → data-minimization friendly (RGPD).
- Deterministic where the ID is present; transparent, auditable fallback where it isn't.
