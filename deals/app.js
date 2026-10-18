const PIN = "3121";
let code = "";
let idx = 0;
const KEY = "pt-deal-stack-v4";
const PLACEHOLDER = "/assets/deal-placeholder.svg";

const DEALS = [
  {
    id: "main",
    address: "725 S Main St",
    city: "Santa Ana, CA 92701",
    price: 825000,
    beds: "2 retail + house",
    sqft: "1,842",
    link: "https://www.redfin.com/CA/Santa-Ana/725-S-Main-St-92701/home/145383963",
    photo: "",
    rent: 6500,
    rehab: 175000,
    rehab_note: "Heavy / destroyed - estimate only until contractor bid",
    down: 165000,
    loan: 660000,
    pi: 4502,
    tax_ins_mo: 825,
    piti: 5327,
    buffer: 1300,
    cf: -127,
    carry_months: 6,
    rate: 7.25,
    verdict: "PASS - NEEDS BID",
    why: "Super destroyed. Rehab not optional. Current CF number assumes finished rents and is incomplete until rehab bid + carry costs are locked."
  }
];

function el(id){ return document.getElementById(id); }
function money(n){
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const x = Number(n);
  const s = x < 0 ? "-" : "";
  return s + "$" + Math.round(Math.abs(x)).toLocaleString();
}
function loadStack(){
  try { return JSON.parse(localStorage.getItem(KEY) || '{"yes":[],"no":[],"maybe":[]}'); }
  catch(e){ return {yes:[], no:[], maybe:[]}; }
}
function saveStack(s){ localStorage.setItem(KEY, JSON.stringify(s)); paintStack(); }
function paintDots(){
  for (let i=0;i<4;i++) el("d"+i).classList.toggle("on", i < code.length);
}
function setErr(m){ el("err").textContent = m || ""; }
function unlock(){
  sessionStorage.setItem("pt-ops", "1");
  el("gate").classList.add("hidden");
  el("room").classList.remove("hidden");
  el("sticky").classList.remove("hidden");
  paintAll();
}
function tryPin(){
  if (code.length < 4) { setErr("Need 4 digits"); return; }
  if (code === PIN) unlock();
  else { setErr("Wrong PIN"); code=""; paintDots(); }
}
function press(k){
  setErr("");
  if (k === "clear") { code=""; paintDots(); return; }
  if (k === "del") { code = code.slice(0,-1); paintDots(); return; }
  if (code.length >= 4) return;
  code = code + String(k);
  paintDots();
  if (code.length === 4) setTimeout(tryPin, 40);
}
function photoUrl(d){
  return (d.photo && String(d.photo).trim()) ? d.photo : PLACEHOLDER;
}
function allInCash(d){
  // down + rehab + rough carry (piti * months while empty)
  const carry = (d.piti || 0) * (d.carry_months || 0);
  return (d.down || 0) + (d.rehab || 0) + carry;
}
function paintTabs(){
  const tabs = el("tabs");
  if (!DEALS.length) { tabs.innerHTML = ""; return; }
  tabs.innerHTML = DEALS.map(function(d,i){
    return '<button type="button" class="tab'+(i===idx?' active':'')+'" data-i="'+i+'">'+(i+1)+'. '+d.address.split(' ').slice(0,3).join(' ')+'</button>';
  }).join("");
  tabs.querySelectorAll('[data-i]').forEach(function(btn){
    btn.onclick = function(){ idx = Number(btn.getAttribute('data-i')); paintAll(); };
  });
}
function paintCard(){
  el("prog").textContent = DEALS.length ? ((idx+1)+" / "+DEALS.length) : "0 deals";
  if (!DEALS.length) {
    el("mount").innerHTML = '<div class="empty-card"><h2>No cash-flow deals right now</h2><p>Only deals with real cash-flow potential will show here.</p></div>';
    el("sticky").classList.add("hidden");
    return;
  }
  el("sticky").classList.remove("hidden");
  const d = DEALS[idx];
  const pos = d.cf >= 0;
  const cashIn = allInCash(d);
  const src = photoUrl(d);
  el("mount").innerHTML =
    '<article class="card">' +
      '<div class="hero">' +
        '<div class="badge">'+d.verdict+'</div>' +
        '<img src="'+src+'" alt="" loading="eager" onerror="this.onerror=null;this.src=\''+PLACEHOLDER+'\';" />' +
      '</div>' +
      '<div class="body">' +
        '<p class="price">'+money(d.price)+'</p>' +
        '<div class="addr">'+d.address+'<small>'+d.city+' · '+d.beds+' · '+d.sqft+' sf</small></div>' +
        '<div class="money">' +
          '<h3>Money wrap</h3>' +
          '<div class="line"><span>20% down</span><b>'+money(d.down)+'</b></div>' +
          '<div class="line"><span>Loan</span><b>'+money(d.loan)+'</b></div>' +
          '<div class="line"><span>P&I @ '+d.rate+'%</span><b>'+money(d.pi)+'/mo</b></div>' +
          '<div class="line"><span>Tax+ins</span><b>'+money(d.tax_ins_mo)+'/mo</b></div>' +
          '<div class="line"><span>PITI</span><b>'+money(d.piti)+'/mo</b></div>' +
          '<div class="line"><span>Rehab estimate</span><b>'+money(d.rehab||0)+'</b></div>' +
          '<div class="line"><span>Carry while empty</span><b>'+money((d.piti||0)*(d.carry_months||0))+' ('+(d.carry_months||0)+' mo)</b></div>' +
          '<div class="line"><span>Cash in all-in rough</span><b>'+money(cashIn)+'</b></div>' +
          '<div class="line"><span>Rent if finished</span><b>'+money(d.rent)+'/mo</b></div>' +
          '<div class="line"><span>20% buffer</span><b>'+money(d.buffer)+'/mo</b></div>' +
          '<div class="cf '+(pos?'pos':'neg')+'"><span>CF if finished/leased</span><span>'+money(d.cf)+'/mo</span></div>' +
          '<div class="note">Rehab note: '+(d.rehab_note||'n/a')+'. CF ignores destroyed condition until bid is real.</div>' +
        '</div>' +
        '<p class="why">'+d.why+'</p>' +
      '</div>' +
    '</article>';
  el("listing").href = d.link;
}
function vote(kind){
  if (!DEALS.length) return;
  const d = DEALS[idx];
  const s = loadStack();
  ["yes","no","maybe"].forEach(function(k){ s[k] = s[k].filter(function(x){ return x.id !== d.id; }); });
  s[kind].unshift({id:d.id, address:d.address, price:d.price, link:d.link, cf:d.cf, verdict:d.verdict});
  saveStack(s);
  idx = (idx + 1) % DEALS.length;
  paintAll();
}
function paintStack(){
  const s = loadStack();
  function block(title, arr){
    return '<h3 style="margin:.55rem 0 .25rem;font-size:.88rem">'+title+'</h3>' +
      (arr.length ? arr.map(function(x){
        return '<div class="item"><div><b>'+x.address+'</b><div style="color:var(--muted)">'+money(x.price)+' · '+ (x.verdict||'') +'</div></div><a href="'+x.link+'" target="_blank" rel="noopener">View</a></div>';
      }).join('') : '<div class="empty">Empty</div>');
  }
  el("stackBody").innerHTML = block("Interested", s.yes||[]) + block("Maybe", s.maybe||[]) + block("Passed", s.no||[]);
}
function paintAll(){ paintTabs(); paintCard(); paintStack(); }
function boot(){
  el("pad").addEventListener("click", function(e){
    const b = e.target.closest("button[data-k]");
    if (!b) return;
    press(b.getAttribute("data-k"));
  });
  window.addEventListener("keydown", function(e){
    if (!el("room").classList.contains("hidden")) return;
    if (e.key >= "0" && e.key <= "9") press(e.key);
    if (e.key === "Backspace") press("del");
    if (e.key === "Enter") tryPin();
    if (e.key === "Escape") press("clear");
  });
  el("btnNo").onclick = function(){ vote("no"); };
  el("btnMaybe").onclick = function(){ vote("maybe"); };
  el("btnYes").onclick = function(){ vote("yes"); };
  el("prev").onclick = function(){ if(!DEALS.length) return; idx=(idx-1+DEALS.length)%DEALS.length; paintAll(); };
  el("next").onclick = function(){ if(!DEALS.length) return; idx=(idx+1)%DEALS.length; paintAll(); };
  el("resetBtn").onclick = function(){ localStorage.removeItem(KEY); paintAll(); };
  if (sessionStorage.getItem("pt-ops") === "1") unlock(); else paintDots();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
