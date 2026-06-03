/*
 * Consent Mode v2 — initialization
 * Load this in <head> BEFORE GTM, gtag, or any measurement tag.
 *
 * Principle: deny everything by default, then update only on an explicit
 * user choice coming from the CMP. Nothing is granted before consent.
 */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// 1) Defaults — denied before anything loads.
//    functionality_storage / security_storage stay granted (strictly necessary).
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',          // v2
  ad_personalization: 'denied',    // v2
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500             // ms — let the CMP signal arrive before tags fire
});

// Optional: scope the strict defaults to the EEA/UK and be more open elsewhere.
// gtag('consent', 'default', { region: ['FR','DE','ES','IT','PT','GB'], ad_storage: 'denied', ... });

// Redact ads click identifiers until consent is granted.
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true); // keep gclid through redirects without cookies

/* ------------------------------------------------------------------ */
/* 2) Generic path — call this from your CMP's "save choices" callback. */
/* ------------------------------------------------------------------ */
function applyConsent({ ads = false, personalization = false, analytics = false }) {
  gtag('consent', 'update', {
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: personalization ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied'
  });
}

/* ------------------------------------------------------------------ */
/* 3) IAB TCF path — derive the signals from the TCF consent string.    */
/*    The TC string is the source of truth, not a custom cookie.        */
/* ------------------------------------------------------------------ */
function bindTcfConsent() {
  if (typeof window.__tcfapi !== 'function') return;

  window.__tcfapi('addEventListener', 2, function (tcData, success) {
    if (!success) return;
    if (tcData.eventStatus !== 'useractioncomplete' && tcData.eventStatus !== 'tcloaded') return;

    const p = tcData.purpose && tcData.purpose.consents ? tcData.purpose.consents : {};
    // TCF purpose -> Google signal mapping
    applyConsent({
      ads: !!p[1],                       // store/access information on a device
      personalization: !!(p[3] && p[4]), // create/select personalised ads profiles
      analytics: !!(p[7] || p[8] || p[9])// measure ad/content performance, audience insights
    });
  });
}

bindTcfConsent();
