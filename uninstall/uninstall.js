// Chrome opens this page when Video Speed Controller is removed. Report one
// anonymous "uninstall" to the license server: the step name, the version and,
// from 1.6.1, the install's stage and age bucket (from this page's address).
// No install id, nothing else. The server keeps daily per-country totals only.
(function () {
  var EVENT_URL = 'https://vsc-license.vercel.app/api/event';
  var SENT_KEY = 'vscUninstallSentAt';
  var STAGES = ['paid', 'trial', 'after_trial', 'locked', 'old', 'free'];
  var AGES = ['d0', 'd1', 'd2_7', 'd8_30', 'd31p', 'unknown'];
  try {
    var last = Number(localStorage.getItem(SENT_KEY)) || 0;
    if (Date.now() - last < 24 * 60 * 60 * 1000) return; // a reload, not another removal
  } catch (e) { /* storage blocked: send anyway */ }

  var q = new URLSearchParams(location.search);
  var v = q.get('v') || '';
  var s = q.get('s') || '';
  var a = q.get('a') || '';
  var body = JSON.stringify({
    event: 'uninstall',
    v: /^\d{1,3}(\.\d{1,4}){1,3}$/.test(v) ? v : '',
    stage: STAGES.indexOf(s) >= 0 ? s : 'unknown',
    age: AGES.indexOf(a) >= 0 ? a : 'unknown',
  });
  var sent = false;
  try {
    // text/plain needs no CORS preflight; the server parses the JSON anyway.
    sent = navigator.sendBeacon(EVENT_URL, new Blob([body], { type: 'text/plain' }));
  } catch (e) { /* fall through */ }
  if (!sent) {
    try { fetch(EVENT_URL, { method: 'POST', body: body, mode: 'no-cors', keepalive: true }); } catch (e) { return; }
  }
  try { localStorage.setItem(SENT_KEY, String(Date.now())); } catch (e) { /* no-op */ }
})();
