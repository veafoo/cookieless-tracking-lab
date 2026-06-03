# GA4 forwarding tag (server-side)

A sandboxed JavaScript snippet for a **server GTM Custom Template**. It forwards a consented
event to GA4 and stamps a first-party `impression_id` used by the
[cookieless attribution](../cookieless-attribution) query.

The server sandbox is not browser JS: you use the provided APIs
(`getAllEventData`, `sendHttpRequest`, `setResponseHeader`, etc.). The snippet below shows the
logic, kept faithful to the sandbox model.

```javascript
const getAllEventData = require('getAllEventData');
const sendHttpRequest = require('sendHttpRequest');
const generateRandom  = require('generateRandom');
const getTimestampMillis = require('getTimestampMillis');
const logToConsole   = require('logToConsole');

const event = getAllEventData();

// 1) Consent gate — drop the event if ad/analytics consent is missing.
//    (Consent travels in the event from the client; see consent-mode-v2/.)
const consent = event.consent_state || {};
if (consent.analytics_storage !== 'granted') {
  data.gtmOnSuccess();
  return;
}

// 2) First-party Impression ID — durable, cookieless join key.
//    Stamped once, server-side, so it never depends on a 3rd-party cookie.
const impressionId = event.impression_id || (getTimestampMillis() + '.' + generateRandom(1e9, 1e10));

// 3) Forward to GA4 via Measurement Protocol (only the fields we need).
const payload = {
  client_id: event.client_id,
  events: [{
    name: event.event_name,
    params: {
      campaign_id: event.campaign_id,
      impression_id: impressionId,
      value: event.value,
      currency: event.currency
    }
  }]
};

const mpUrl = 'https://www.google-analytics.com/mp/collect'
  + '?measurement_id=' + event.measurement_id
  + '&api_secret=' + data.apiSecret;

sendHttpRequest(mpUrl, (statusCode) => {
  logToConsole('GA4 MP status: ' + statusCode);
  data.gtmOnSuccess();
}, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify(payload));
```

**Notes for review / interview**

- `api_secret` comes from a **template field**, never hard-coded (kept out of the repo — see `.gitignore`).
- The consent gate runs **before** any network call; nothing leaves on denied consent.
- `impression_id` is generated server-side and echoed back, so attribution does not rely on any
  browser-stored identifier. This is the modern form of the GCLID-style key I used at ADventori.
