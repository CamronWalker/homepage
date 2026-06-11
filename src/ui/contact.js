/**
 * src/ui/contact.js
 * Scraper-safe contact reveal — assembles email + phone from char-code arrays
 * so plain-text crawlers cannot harvest the values.
 * Ported from design-handoff/project/site.js lines 712–720.
 */

function fromCodes(arr) {
  return arr.map(function (c) { return String.fromCharCode(c); }).join("");
}

// camronwalker@gmail.com
var EMAIL = fromCodes([99,97,109,114,111,110,119,97,108,107,101,114,64,103,109,97,105,108,46,99,111,109]);
// 801.875.2600
var PHONE_DISP = fromCodes([56,48,49,46,56,55,53,46,50,54,48,48]);
// +18018752600
var PHONE_TEL  = fromCodes([43,49,56,48,49,56,55,53,50,54,48,48]);

export function initContact() {
  var ce = document.getElementById("c-email");
  if (ce) {
    ce.textContent = EMAIL;
    ce.setAttribute("href", "mailto:" + EMAIL);
  }

  var cp = document.getElementById("c-phone");
  if (cp) {
    cp.textContent = PHONE_DISP;
    cp.setAttribute("href", "tel:" + PHONE_TEL);
  }
}
