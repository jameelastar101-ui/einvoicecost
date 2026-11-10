(function(){
  var C = {"kind": "other", "name": "other software", "topMsg": "Hi, I have a question about UAE e-invoicing for my accounting software.", "ctaMsg": "Hi, I use another accounting software: [software name]. Please send me the e-invoicing price."};
  var fmt = function(n){ return Math.round(n).toLocaleString("en-US"); };
  var wa = function(t){ return "https://wa.me/971508759256?text=" + encodeURIComponent(t); };
  var $ = function(id){ return document.getElementById(id); };
  var fee = function(n){ return n <= 500 ? 500 : 500 + 0.75 * (n - 500); };
  var zoho = function(n){ if (n <= 0) return 0; if (n >= 10000) return n * 0.27;
    var r = n >= 5000 ? 0.30 : n >= 1000 ? 0.33 : 0.37, cap = n >= 5000 ? 2700 : n >= 1000 ? 1500 : 330; return Math.min(n * r, cap); };
  $("topWa").href = wa(C.topMsg);
  var n = 500;
  var touched = false;
  $("dockWa").href = wa("Hi, I need help with UAE e-invoicing.");
  function set(id, v){ var el = $(id); if (el) el.textContent = v; }
  function links(msg, dockHtml){
    ["finalWa","helpWa"].forEach(function(id){ var el = $(id); if (el) el.href = wa(msg); });
    // Bottom bar stays a generic CTA until the visitor enters their invoice count
    if (touched && dockHtml){
      $("dockFy").classList.remove("cta"); $("dockFy").innerHTML = dockHtml;
      $("dockWa").href = wa(msg); $("dockWa").textContent = "Let's discuss";
    }
  }
  function render(){
    if (C.kind === "need"){
      var big = n > 10000, y = fee(n), fy = C.asp + C.setup + y;
      set("fy", big ? "Ask us" : fmt(fy)); set("ny", big ? "Ask us" : fmt(y));
      links(big ? "Hi, I use " + C.name + " and send about " + fmt(n) + " invoices a year. Please send me the e-invoicing price."
                : "Hi, I use " + C.name + ", about " + fmt(n) + " invoices a year. Your site shows AED " + fmt(fy) + " for the first year and AED " + fmt(y) + " a year after. I'd like to discuss more.",
            "<small>" + C.name + " · first year</small>" + (big ? "Ask us" : "AED " + fmt(fy)));
    } else if (C.kind === "zoho"){
      var z = zoho(n);
      set("fy", fmt(z)); set("ny", fmt(z + 1500));
      links("Hi, I use Zoho Books, about " + fmt(n) + " invoices a year. I'd like you to set up e-invoicing for AED 1,500. I'd like to discuss more.", null);
    } else if (C.kind === "own"){
      links(C.ctaMsg, null);
    }
  }
  var inv = $("inv");
  if (inv){
    inv.addEventListener("input", function(e){ var raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 7); touched = true; n = raw === "" ? 0 : parseInt(raw, 10); render(); });
    inv.addEventListener("blur", function(e){ e.target.value = fmt(n); });
  }
  var big = $("bigWa"); if (big) big.href = wa("Hi, I use " + C.name + " and send more than 10,000 invoices a year. Please send me the e-invoicing price.");
  var form = $("priceForm");
  if (form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var sw = $("fSw").value.trim() || "[software name]", ni = $("fInv").value.trim() || "[number]", nm = $("fName").value.trim();
      var msg = "Hi" + (nm ? ", I'm " + nm : "") + ". I use " + sw + " and send about " + ni + " invoices a year. Please send me the e-invoicing price.";
      window.open(wa(msg), "_blank", "noopener");
    });
    links(C.ctaMsg, null);
    document.querySelectorAll("[data-sw]").forEach(function(a){
      a.href = wa("Hi, I use " + a.getAttribute("data-sw") + ". Please send me the e-invoicing price.");
    });
  }
  var cur = document.querySelector('.gscroll [aria-current="page"]');
  if (cur && cur.parentNode.scrollWidth > cur.parentNode.clientWidth) cur.parentNode.scrollLeft = cur.offsetLeft - 60;
  render();
})();
