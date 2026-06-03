-- Cookieless last-touch attribution on a durable Impression ID (BigQuery, Standard SQL)
--
-- Tables (illustrative schema):
--   `lab.impressions` : impression_id STRING, campaign_id STRING, fp_signal STRING, ts TIMESTAMP
--   `lab.conversions` : conversion_id STRING, impression_id STRING, fp_signal STRING, value FLOAT64, ts TIMESTAMP
--
-- fp_signal = a durable, privacy-safe first-party signal (e.g. a server-side first-party id),
--             used ONLY as a fallback when the conversion did not carry its impression_id.
--             It is never a third-party cookie.
--
-- Attribution window for the fallback path:
DECLARE window_days INT64 DEFAULT 30;

WITH
-- 1) Exact path: the conversion already references its originating impression.
exact_match AS (
  SELECT
    c.conversion_id,
    c.impression_id,
    i.campaign_id,
    c.value,
    'exact_impression_id' AS attribution_method
  FROM `lab.conversions` c
  JOIN `lab.impressions` i USING (impression_id)
  WHERE c.impression_id IS NOT NULL
),

-- 2) Fallback path: no impression_id on the conversion → last impression before the
--    conversion, on the same first-party signal, within the window.
fallback_ranked AS (
  SELECT
    c.conversion_id,
    i.impression_id,
    i.campaign_id,
    c.value,
    ROW_NUMBER() OVER (
      PARTITION BY c.conversion_id
      ORDER BY i.ts DESC                       -- last touch
    ) AS rn
  FROM `lab.conversions` c
  JOIN `lab.impressions` i
    ON  i.fp_signal = c.fp_signal
    AND i.ts <= c.ts
    AND i.ts >= TIMESTAMP_SUB(c.ts, INTERVAL window_days DAY)
  WHERE c.impression_id IS NULL
),
fallback_match AS (
  SELECT
    conversion_id, impression_id, campaign_id, value,
    'last_touch_fallback' AS attribution_method
  FROM fallback_ranked
  WHERE rn = 1
),

attributed AS (
  SELECT * FROM exact_match
  UNION ALL
  SELECT * FROM fallback_match
)

-- 3) Campaign-level result: conversions and value credited per campaign, by method.
SELECT
  campaign_id,
  attribution_method,
  COUNT(*)              AS conversions,
  ROUND(SUM(value), 2)  AS attributed_value
FROM attributed
GROUP BY campaign_id, attribution_method
ORDER BY attributed_value DESC;
