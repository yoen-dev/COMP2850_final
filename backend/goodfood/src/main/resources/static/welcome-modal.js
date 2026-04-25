/**
 * NourishWell — Welcome Onboarding v3
 * Complete redesign: progress bar top, step tag + title + subtitle header,
 * scrollable content area, fixed footer with back/next.
 * Fixed 600×540 card, no jumping.
 */
(function(){
'use strict';
function profileKey(){var u=(typeof NW!=='undefined'&&NW.auth)?NW.auth.userId:'';return u?'nw-'+u+'-profile':'nw-user-profile';}
function getProfile(){try{return JSON.parse(localStorage.getItem(profileKey()));}catch(e){return null;}}
function saveProfile(p){localStorage.setItem(profileKey(),JSON.stringify(p));}
function isProfileComplete(p){return p&&p.gender&&p.heightCm&&p.weightKg&&p.activityLevel&&p.goal&&p.dateOfBirth;}
function calcAge(d){var b=new Date(d),t=new Date(),a=t.getFullYear()-b.getFullYear(),m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return Math.max(a,1);}
function calcBMI(w,h){return+(w/((h/100)*(h/100))).toFixed(1);}
function bmiCat(b){return b<18.5?'Underweight':b<25?'Normal':b<30?'Overweight':'Obese';}
/** Calculate Basal Metabolic Rate using Mifflin-St Jeor equation */
function calcBMR(w,h,a,g){return g==='female'?10*w+6.25*h-5*a-161:10*w+6.25*h-5*a+5;}
var ACT={sedentary:1.2,lightly_active:1.375,moderately_active:1.55,very_active:1.725};
var ACT_L={sedentary:'Sedentary',lightly_active:'Lightly Active',moderately_active:'Moderately Active',very_active:'Very Active'};
var GOAL_OFF={lose:-500,maintain:0,gain:300};
var GOAL_L={lose:'Lose Weight',maintain:'Maintain Weight',gain:'Gain Muscle'};
function calcMacros(t,g){var s={lose:{p:.30,c:.40,f:.30},maintain:{p:.25,c:.50,f:.25},gain:{p:.35,c:.40,f:.25}}[g]||{p:.25,c:.50,f:.25};return{pG:Math.round(t*s.p/4),cG:Math.round(t*s.c/4),fG:Math.round(t*s.f/9),pP:Math.round(s.p*100),cP:Math.round(s.c*100),fP:Math.round(s.f*100)};}
function calcEx(p){if(!p.wantsExercise)return{kcal:0,mins:0,text:''};var b={lose:400,maintain:300,gain:200}[p.goal]||300,m={light:.6,moderate:1,intense:1.4}[p.exerciseIntensity]||1,k=Math.round(b*m),r={light:5,moderate:8,intense:12}[p.exerciseIntensity]||8,mn=Math.round(k/r),a={light:'walking, yoga, or stretching',moderate:'jogging, cycling, or swimming',intense:'running, HIIT, or weight training'}[p.exerciseIntensity]||'';return{kcal:k,mins:mn,text:mn+' min of '+a};}
function computeAll(p){var a=calcAge(p.dateOfBirth),bmi=calcBMI(p.weightKg,p.heightCm),bmr=calcBMR(p.weightKg,p.heightCm,a,p.gender),tdee=Math.round(bmr*(ACT[p.activityLevel]||1.55)),tgt=Math.max(1200,tdee+(GOAL_OFF[p.goal]||0));return{age:a,bmi:bmi,bmiCat:bmiCat(bmi),bmr:Math.round(bmr),tdee:tdee,target:tgt,macros:calcMacros(tgt,p.goal),exercise:calcEx(p)};}

// ── Apply ──
function applyToDashboard(p){if(!p)return;var s=computeAll(p);window._nwDailyTarget=s.target;
document.querySelectorAll('span').forEach(function(el){if(el.textContent.match(/\d+\s*kg\s*·/)||el.id==='profile-summary-line'){el.id='profile-summary-line';el.innerHTML=p.weightKg+' kg · '+(ACT_L[p.activityLevel]||'')+' · BMI '+s.bmi+' <span style="color:var(--ink-f)">('+s.bmiCat+')</span>';}});
if(typeof window.updateDonut==='function')window.updateDonut();
if(typeof window._nwUpdateCalorieTrend==='function')window._nwUpdateCalorieTrend();
var ml=document.getElementById('mp-target-label');if(ml)ml.textContent=s.target.toLocaleString()+' kcal';
window._nwExerciseTarget=p.wantsExercise?s.exercise.kcal:0;
var er=document.getElementById('exercise-recommendation');
if(!er){var ec=document.querySelector('.cc-title');if(ec&&ec.textContent.includes('Exercise')){var pa=ec.closest('.chart-card');if(pa){er=document.createElement('div');er.id='exercise-recommendation';er.style.cssText='padding:10px 16px;background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:8px;margin-top:10px;font-size:11px;color:var(--ink-m)';pa.appendChild(er);}}}
if(er){if(p.wantsExercise){er.innerHTML='<strong style="color:var(--teal)">Daily goal:</strong> ~'+s.exercise.kcal+' kcal · '+s.exercise.text;er.style.display='block';}else er.style.display='none';}
var mc=document.getElementById('macro-recommendation');
if(!mc){var ic=document.getElementById('insights-container');if(ic){mc=document.createElement('div');mc.id='macro-recommendation';mc.style.cssText='background:var(--white);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 4px 16px rgba(10,20,16,0.04)';ic.parentNode.insertBefore(mc,ic);}}
if(mc){var m=s.macros;mc.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;gap:6px"><span>🥗</span> Daily Nutrition Targets</div><div style="display:flex;gap:12px;flex-wrap:wrap">'+mC('Protein',m.pG+'g',m.pP+'%','#d4956a')+mC('Carbs',m.cG+'g',m.cP+'%','#2f8f7f')+mC('Fat',m.fG+'g',m.fP+'%','#7aaad4')+'</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);margin-top:8px">'+s.target.toLocaleString()+' kcal · '+(GOAL_L[p.goal]||'')+'</div>';}
applyToSettings(p,s);}
function mC(l,g,pc,c){return'<div style="flex:1;min-width:80px;background:var(--paper);border-radius:10px;padding:10px 12px;text-align:center"><div style="font-size:18px;font-weight:800;color:'+c+'">'+g+'</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:var(--ink-f);margin-top:2px">'+l+' · '+pc+'</div></div>';}

// ── Settings ──
function applyToSettings(p,s){var m={'settings-gender':p.gender,'settings-dob':p.dateOfBirth,'settings-height':p.heightCm,'settings-weight':p.weightKg,'settings-activity':p.activityLevel,'settings-goal':p.goal,'settings-calorie-target':s?s.target:''};Object.keys(m).forEach(function(id){var e=document.getElementById(id);if(e)e.value=m[id];});var b=document.getElementById('settings-bmi-display');if(b&&s){b.textContent='BMI: '+s.bmi+' ('+s.bmiCat+') · BMR: '+s.bmr+' · TDEE: '+s.tdee;b.style.color=(s.bmi>=18.5&&s.bmi<25)?'var(--teal)':'var(--amber)';}}
function patchSettings(){var hp=document.querySelector('#overlay-personal .settings-inner');if(!hp)return;var cards=hp.querySelectorAll('div[style*="border-radius:16px"]');var hc=null;cards.forEach(function(c){if(c.textContent.includes('Height (cm)'))hc=c;});if(!hc)return;var g=hc.querySelector('div[style*="grid-template-columns"]');if(!g)return;var inp=g.querySelectorAll('input, select');if(inp[0])inp[0].id='settings-height';if(inp[1])inp[1].id='settings-weight';if(inp[2]){inp[2].id='settings-activity';inp[2].innerHTML='<option value="sedentary">Sedentary</option><option value="lightly_active">Lightly Active</option><option value="moderately_active">Moderately Active</option><option value="very_active">Very Active</option>';}if(inp[3]){inp[3].id='settings-calorie-target';inp[3].readOnly=true;inp[3].style.background='var(--paper)';inp[3].title='Auto-calculated';}
var gD=document.createElement('div');gD.innerHTML='<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Gender</div><select id="settings-gender" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)"><option value="male">Male</option><option value="female">Female</option><option value="other">Prefer not to say</option></select>';g.insertBefore(gD,g.firstChild);
var dD=document.createElement('div');dD.innerHTML='<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Date of Birth</div><input type="date" id="settings-dob" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none">';g.insertBefore(dD,g.children[1]);
var goD=document.createElement('div');goD.innerHTML='<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Goal</div><select id="settings-goal" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)"><option value="lose">Lose Weight</option><option value="maintain">Maintain Weight</option><option value="gain">Gain Muscle</option></select>';var cf=inp[3]?inp[3].parentElement:null;if(cf)g.insertBefore(goD,cf);
var bD=document.createElement('div');bD.style.cssText='grid-column:1/-1;padding:12px 14px;background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:10px;font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600';bD.id='settings-bmi-display';bD.textContent='BMI: —';g.appendChild(bD);
var btn=hc.querySelector('button');if(btn)btn.addEventListener('click',function(e){e.preventDefault();var p=readSP();if(p){saveProfile(p);applyToDashboard(p);if(typeof showToast==='function')showToast('Profile updated','#1e6b5e');}});
['settings-gender','settings-dob','settings-height','settings-weight','settings-activity','settings-goal'].forEach(function(id){var e=document.getElementById(id);if(e){e.addEventListener('change',recalcS);e.addEventListener('input',recalcS);}});}
function readSP(){var old=getProfile()||{};return{displayName:old.displayName||'',gender:(document.getElementById('settings-gender')||{}).value||'other',dateOfBirth:(document.getElementById('settings-dob')||{}).value||'2000-01-01',heightCm:parseFloat((document.getElementById('settings-height')||{}).value)||170,weightKg:parseFloat((document.getElementById('settings-weight')||{}).value)||70,activityLevel:(document.getElementById('settings-activity')||{}).value||'moderately_active',goal:(document.getElementById('settings-goal')||{}).value||'maintain',wantsExercise:old.wantsExercise||false,exerciseIntensity:old.exerciseIntensity||'moderate'};}
function recalcS(){var p=readSP();if(!p.dateOfBirth||!p.heightCm||!p.weightKg)return;var s=computeAll(p);var c=document.getElementById('settings-calorie-target');if(c)c.value=s.target;var b=document.getElementById('settings-bmi-display');if(b){b.textContent='BMI: '+s.bmi+' ('+s.bmiCat+') · BMR: '+s.bmr+' · TDEE: '+s.tdee;b.style.color=(s.bmi>=18.5&&s.bmi<25)?'var(--teal)':'var(--amber)';}}

// ══════════════════════════════════════════════════════════════
// MODAL UI — v3 Complete Redesign
// ══════════════════════════════════════════════════════════════
var STEPS=5,cur=1,_un='',_ini='';
// ── Bug fix: persist input data across steps ──
var _draft={displayName:'',gender:null,dateOfBirth:'',heightCm:'',weightKg:'',activityLevel:null,goal:null,wantsExercise:null,exerciseIntensity:null};
function saveCurrent(){
if(cur===1){var n=document.getElementById('wm-name');if(n)_draft.displayName=n.value.trim();}
else if(cur===2){_draft.gender=SV('wg');var d=document.getElementById('wm-dob');if(d)_draft.dateOfBirth=d.value;var h=document.getElementById('wm-h');if(h)_draft.heightCm=h.value;var w=document.getElementById('wm-w');if(w)_draft.weightKg=w.value;}
else if(cur===3){_draft.activityLevel=SV('wa');_draft.goal=SV('wgo');}
else if(cur===4){_draft.wantsExercise=SV('we');_draft.exerciseIntensity=SV('wei');}
}
function restoreCurrent(){
if(cur===1){var n=document.getElementById('wm-name');if(n&&_draft.displayName)n.value=_draft.displayName;}
else if(cur===2){if(_draft.gender){var g=document.querySelector('#wg .wm3-o[data-val="'+_draft.gender+'"]');if(g){document.querySelectorAll('#wg .wm3-o').forEach(function(x){x.classList.remove('on');});g.classList.add('on');}}var d=document.getElementById('wm-dob');if(d&&_draft.dateOfBirth)d.value=_draft.dateOfBirth;var h=document.getElementById('wm-h');if(h&&_draft.heightCm)h.value=_draft.heightCm;var w=document.getElementById('wm-w');if(w&&_draft.weightKg)w.value=_draft.weightKg;setTimeout(V2,20);}
else if(cur===3){if(_draft.activityLevel){var a=document.querySelector('#wa .wm3-o[data-val="'+_draft.activityLevel+'"]');if(a){document.querySelectorAll('#wa .wm3-o').forEach(function(x){x.classList.remove('on');});a.classList.add('on');}}if(_draft.goal){var go=document.querySelector('#wgo .wm3-o[data-val="'+_draft.goal+'"]');if(go){document.querySelectorAll('#wgo .wm3-o').forEach(function(x){x.classList.remove('on');});go.classList.add('on');}}setTimeout(V3,20);}
else if(cur===4){if(_draft.wantsExercise){var we=document.querySelector('#we .wm3-o[data-val="'+_draft.wantsExercise+'"]');if(we){document.querySelectorAll('#we .wm3-o').forEach(function(x){x.classList.remove('on');});we.classList.add('on');}if(_draft.wantsExercise==='yes'){var exd=document.getElementById('wm-exd');if(exd)exd.style.display='block';if(_draft.exerciseIntensity){var ei=document.querySelector('#wei .wm3-o[data-val="'+_draft.exerciseIntensity+'"]');if(ei){document.querySelectorAll('#wei .wm3-o').forEach(function(x){x.classList.remove('on');});ei.classList.add('on');}}}}setTimeout(V4,20);}
}
function injectStyles(){if(document.getElementById('nw-wm-css'))return;var s=document.createElement('style');s.id='nw-wm-css';
s.textContent='\
#nw-welcome-overlay{position:fixed;inset:0;z-index:99999;background:rgba(10,20,16,0.6);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .4s}\
#nw-welcome-overlay.visible{opacity:1}\
#nw-wm{background:#fff;border-radius:20px;width:600px;max-width:94vw;height:540px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(10,20,16,0.28),0 0 0 1px rgba(30,107,94,0.06);transform:translateY(14px) scale(0.97);transition:transform .4s cubic-bezier(.16,1,.3,1);overflow:hidden}\
#nw-welcome-overlay.visible #nw-wm{transform:none}\
.wm3-bar{height:3px;background:var(--fog,#dce6e0)}.wm3-bar-fill{height:100%;background:linear-gradient(90deg,#1e6b5e,#2f8f7f);border-radius:0 2px 2px 0;transition:width .4s cubic-bezier(.16,1,.3,1)}\
.wm3-head{padding:24px 32px 0;flex-shrink:0}\
.wm3-tag{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--teal,#1e6b5e);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}\
.wm3-title{font-family:"Instrument Serif",serif;font-size:26px;font-style:italic;color:var(--ink,#0a1410);line-height:1.15;margin-bottom:4px}\
.wm3-sub{font-size:13px;color:var(--ink-f,#6b8878);line-height:1.5}\
.wm3-body{flex:1;overflow-y:auto;padding:18px 32px 20px}\
.wm3-foot{padding:14px 32px 20px;border-top:1px solid var(--fog,#dce6e0);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#fff}\
.wm3-fl{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--ink-f)}\
.wm3-fr{display:flex;gap:10px}\
.wm3-back{padding:10px 20px;border:1px solid var(--border,#d4dfd8);border-radius:10px;background:#fff;color:var(--ink-m);font-size:13px;font-weight:600;cursor:pointer;font-family:"Bricolage Grotesque",sans-serif;transition:all .15s}\
.wm3-back:hover{border-color:var(--ink-m);color:var(--ink)}\
.wm3-next{padding:10px 28px;border:none;border-radius:10px;background:var(--ink,#0a1410);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:"Bricolage Grotesque",sans-serif;transition:all .15s}\
.wm3-next:hover{background:var(--teal,#1e6b5e)}\
.wm3-next:disabled{opacity:.3;cursor:not-allowed}\
.wm3-label{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:block}\
.wm3-input{width:100%;padding:12px 16px;border:1.5px solid var(--border,#d4dfd8);border-radius:10px;font-family:"Bricolage Grotesque",sans-serif;font-size:14px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s;background:#fff}\
.wm3-input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(30,107,94,0.08)}\
.wm3-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}\
.wm3-field{margin-bottom:16px}\
.wm3-opts{display:grid;gap:10px}.wm3-opts.c2{grid-template-columns:1fr 1fr}.wm3-opts.c3{grid-template-columns:1fr 1fr 1fr}\
.wm3-o{border:1.5px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:#fff;text-align:center}\
.wm3-o:hover{border-color:var(--teal-l);background:var(--teal-lll)}\
.wm3-o.on{border-color:var(--teal);background:var(--teal);color:#fff}\
.wm3-o-em{font-size:22px;margin-bottom:4px}\
.wm3-o-lb{font-size:13px;font-weight:700}\
.wm3-o-ds{font-size:10px;opacity:.6;margin-top:3px;line-height:1.4}\
.wm3-o.on .wm3-o-ds{opacity:.85}\
.wm3-av{display:flex;align-items:center;gap:18px;padding:18px 20px;background:var(--paper);border-radius:14px;margin-bottom:18px}\
.wm3-av-pic{width:56px;height:56px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0}\
.wm3-av-name{font-size:17px;font-weight:700;color:var(--ink)}\
.wm3-av-hint{font-size:11px;color:var(--ink-f);line-height:1.5;margin-top:3px}\
.wm3-hero{background:linear-gradient(135deg,#0a1410,#1a3a30);border-radius:16px;padding:24px;text-align:center;color:#fff;margin-bottom:16px}\
.wm3-hero-big{font-size:42px;font-weight:800;font-family:"Bricolage Grotesque",sans-serif;line-height:1}\
.wm3-hero-lbl{font-family:"JetBrains Mono",monospace;font-size:9px;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;margin-top:6px}\
.wm3-hero-row{display:flex;justify-content:center;gap:28px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.1)}\
.wm3-hero-stat{text-align:center}.wm3-hero-stat-n{font-size:20px;font-weight:700}.wm3-hero-stat-l{font-family:"JetBrains Mono",monospace;font-size:8px;color:rgba(255,255,255,.45);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}\
.wm3-macros{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}\
.wm3-macro{background:var(--paper);border-radius:12px;padding:14px;text-align:center}\
.wm3-macro-v{font-size:22px;font-weight:800}\
.wm3-macro-l{font-family:"JetBrains Mono",monospace;font-size:8px;color:var(--ink-f);margin-top:3px}\
.wm3-ex{background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:12px;padding:14px 16px;margin-bottom:14px}\
.wm3-ex b{color:var(--teal)}\
';document.head.appendChild(s);}

function buildModal(){
if(document.getElementById('nw-welcome-overlay'))return;
injectStyles();
_un=(typeof NW!=='undefined'&&NW.auth)?NW.auth.name:'User';
_ini=_un.split(' ').map(function(w){return w[0]||'';}).join('').toUpperCase().substring(0,2);
_draft.displayName=_un;
var ov=document.createElement('div');ov.id='nw-welcome-overlay';
ov.innerHTML='<div id="nw-wm"><div class="wm3-bar"><div class="wm3-bar-fill" id="wm-bar" style="width:20%"></div></div><div class="wm3-head"><div class="wm3-tag" id="wm-tag"></div><div class="wm3-title" id="wm-title"></div><div class="wm3-sub" id="wm-sub"></div></div><div class="wm3-body" id="wm-body"></div><div class="wm3-foot"><div class="wm3-fl" id="wm-fl"></div><div class="wm3-fr" id="wm-fr"></div></div></div>';
document.body.appendChild(ov);
cur=1;render();
requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('visible');});});}

var SC={
1:{tag:'Step 1 of 5 — Your Profile',title:'Hi there!',sub:'Let\'s confirm how you\'d like to appear on NourishWell.'},
2:{tag:'Step 2 of 5 — Body Metrics',title:'About you',sub:'We use this to calculate your BMI, metabolic rate, and daily targets.'},
3:{tag:'Step 3 of 5 — Lifestyle',title:'Activity & goal',sub:'This determines your calorie target and macro balance.'},
4:{tag:'Step 4 of 5 — Exercise',title:'Exercise preferences',sub:'Optional — set a daily exercise target or skip this.'},
5:{tag:'Step 5 of 5 — Your Plan',title:'Here\'s your plan',sub:'Personalised targets based on the Mifflin-St Jeor equation.'}
};

function render(){
var c=SC[cur];
document.getElementById('wm-tag').textContent=c.tag;
document.getElementById('wm-title').textContent=c.title;
document.getElementById('wm-sub').textContent=c.sub;
document.getElementById('wm-bar').style.width=(cur/STEPS*100)+'%';
var bd=document.getElementById('wm-body'),fl=document.getElementById('wm-fl'),fr=document.getElementById('wm-fr');
fl.textContent=cur+' of '+STEPS;

if(cur===1){
bd.innerHTML='<div class="wm3-av"><div class="wm3-av-pic" id="wm-av">'+_ini+'</div><div><div class="wm3-av-name" id="wm-avn">'+_un+'</div><div class="wm3-av-hint">This name appears on comments, ratings, and messages with professionals. You can change it later in Settings → Personal Details.</div></div></div><div class="wm3-field"><span class="wm3-label">Display Name</span><input type="text" class="wm3-input" id="wm-name" value="'+_un+'"></div>';
fr.innerHTML='<button class="wm3-next" id="wm-nx">Continue →</button>';
document.getElementById('wm-name').addEventListener('input',function(){var v=this.value.trim();document.getElementById('wm-avn').textContent=v||'User';document.getElementById('wm-av').textContent=v?v.split(' ').map(function(w){return w[0]||'';}).join('').toUpperCase().substring(0,2):'?';});
document.getElementById('wm-nx').onclick=function(){saveCurrent();cur=2;render();restoreCurrent();};

}else if(cur===2){
bd.innerHTML='<div class="wm3-field"><span class="wm3-label">Gender</span><div class="wm3-opts c3" id="wg">'+O('male','👨','Male')+O('female','👩','Female')+O('other','🤝','Other')+'</div></div><div class="wm3-field"><span class="wm3-label">Date of Birth</span><input type="date" class="wm3-input" id="wm-dob" max="'+new Date().toISOString().split('T')[0]+'"></div><div class="wm3-row"><div class="wm3-field"><span class="wm3-label">Height (cm)</span><input type="number" class="wm3-input" id="wm-h" placeholder="170" min="100" max="250"></div><div class="wm3-field"><span class="wm3-label">Weight (kg)</span><input type="number" class="wm3-input" id="wm-w" placeholder="70" min="30" max="300" step="0.1"></div></div>';
fr.innerHTML='<button class="wm3-back" id="wm-bk">← Back</button><button class="wm3-next" id="wm-nx" disabled>Next →</button>';
W('wg');['wm-dob','wm-h','wm-w'].forEach(function(i){document.getElementById(i).addEventListener('input',V2);});document.getElementById('wg').addEventListener('click',function(){setTimeout(V2,10);});
document.getElementById('wm-bk').onclick=function(){saveCurrent();cur=1;render();restoreCurrent();};
document.getElementById('wm-nx').onclick=function(){saveCurrent();cur=3;render();restoreCurrent();};

}else if(cur===3){
bd.innerHTML='<div class="wm3-field"><span class="wm3-label">How active are you?</span><div class="wm3-opts c2" id="wa">'+OD('sedentary','🪑','Sedentary','Desk job, little exercise')+OD('lightly_active','🚶','Lightly Active','Exercise 1–3 days/week')+OD('moderately_active','🏃','Moderately Active','Exercise 3–5 days/week')+OD('very_active','🏋️','Very Active','Hard exercise 6–7 days')+'</div></div><div class="wm3-field"><span class="wm3-label">What\'s your goal?</span><div class="wm3-opts c3" id="wgo">'+O('lose','📉','Lose Weight')+O('maintain','⚖️','Maintain')+O('gain','💪','Gain Muscle')+'</div></div>';
fr.innerHTML='<button class="wm3-back" id="wm-bk">← Back</button><button class="wm3-next" id="wm-nx" disabled>Next →</button>';
W('wa');W('wgo');document.getElementById('wa').addEventListener('click',function(){setTimeout(V3,10);});document.getElementById('wgo').addEventListener('click',function(){setTimeout(V3,10);});
document.getElementById('wm-bk').onclick=function(){saveCurrent();cur=2;render();restoreCurrent();};
document.getElementById('wm-nx').onclick=function(){saveCurrent();cur=4;render();restoreCurrent();};

}else if(cur===4){
bd.innerHTML='<div class="wm3-field"><span class="wm3-label">Would you like a daily exercise target?</span><div class="wm3-opts c2" id="we">'+O('yes','✅','Yes please')+O('no','⏭️','Skip for now')+'</div></div><div id="wm-exd" style="display:none"><div class="wm3-field"><span class="wm3-label">Preferred intensity</span><div class="wm3-opts c3" id="wei">'+OD('light','🧘','Light','Walking, yoga')+OD('moderate','🏊','Moderate','Jogging, cycling')+OD('intense','🔥','Intense','HIIT, weights')+'</div></div></div>';
fr.innerHTML='<button class="wm3-back" id="wm-bk">← Back</button><button class="wm3-next" id="wm-nx" disabled>See my plan →</button>';
W('we');W('wei');
document.getElementById('we').addEventListener('click',function(){setTimeout(function(){var v=SV('we');document.getElementById('wm-exd').style.display=v==='yes'?'block':'none';V4();},10);});
document.getElementById('wei').addEventListener('click',function(){setTimeout(V4,10);});
document.getElementById('wm-bk').onclick=function(){saveCurrent();cur=3;render();restoreCurrent();};
document.getElementById('wm-nx').onclick=function(){saveCurrent();cur=5;render();};

}else if(cur===5){
var p=CA(),s=computeAll(p),m=s.macros;
bd.innerHTML='<div class="wm3-hero"><div class="wm3-hero-big">'+s.target.toLocaleString()+'</div><div class="wm3-hero-lbl">calories per day</div><div class="wm3-hero-row"><div class="wm3-hero-stat"><div class="wm3-hero-stat-n">'+s.bmi+'</div><div class="wm3-hero-stat-l">BMI</div></div><div class="wm3-hero-stat"><div class="wm3-hero-stat-n">'+s.bmr.toLocaleString()+'</div><div class="wm3-hero-stat-l">BMR</div></div><div class="wm3-hero-stat"><div class="wm3-hero-stat-n">'+s.tdee.toLocaleString()+'</div><div class="wm3-hero-stat-l">TDEE</div></div></div></div>'+
'<div class="wm3-macros"><div class="wm3-macro"><div class="wm3-macro-v" style="color:#d4956a">'+m.pG+'g</div><div class="wm3-macro-l">Protein · '+m.pP+'%</div></div><div class="wm3-macro"><div class="wm3-macro-v" style="color:#1a7a6a">'+m.cG+'g</div><div class="wm3-macro-l">Carbs · '+m.cP+'%</div></div><div class="wm3-macro"><div class="wm3-macro-v" style="color:#7aaad4">'+m.fG+'g</div><div class="wm3-macro-l">Fat · '+m.fP+'%</div></div></div>'+
(p.wantsExercise?'<div class="wm3-ex"><div style="font-size:11px;font-weight:700;margin-bottom:4px"><b>🏃 Daily Exercise Goal</b></div><div style="font-size:13px;color:var(--ink-m)">~'+s.exercise.kcal+' kcal · '+s.exercise.text+'</div></div>':'')+
'<div style="font-size:11px;color:var(--ink-f);line-height:1.6;text-align:center">Update anytime in <strong>Settings → Health Profile</strong></div>';
fr.innerHTML='<button class="wm3-back" id="wm-bk">← Back</button><button class="wm3-next" id="wm-nx" style="background:var(--teal)">Start tracking →</button>';
document.getElementById('wm-bk').onclick=function(){cur=4;render();restoreCurrent();};
document.getElementById('wm-nx').onclick=function(){var p=CA();saveProfile(p);applyToDashboard(p);var o=document.getElementById('nw-welcome-overlay');if(o){o.classList.remove('visible');setTimeout(function(){o.remove();},400);}if(typeof showToast==='function')showToast('Your plan is ready!','#1e6b5e');};
}}

function O(v,e,l){return'<div class="wm3-o" data-val="'+v+'"><div class="wm3-o-em">'+e+'</div><div class="wm3-o-lb">'+l+'</div></div>';}
function OD(v,e,l,d){return'<div class="wm3-o" data-val="'+v+'"><div class="wm3-o-em">'+e+'</div><div class="wm3-o-lb">'+l+'</div><div class="wm3-o-ds">'+d+'</div></div>';}
function W(id){var g=document.getElementById(id);if(!g)return;g.addEventListener('click',function(e){var o=e.target.closest('.wm3-o');if(!o)return;g.querySelectorAll('.wm3-o').forEach(function(x){x.classList.remove('on');});o.classList.add('on');});}
function SV(id){var s=document.querySelector('#'+id+' .wm3-o.on');return s?s.getAttribute('data-val'):null;}
function V2(){var n=document.getElementById('wm-nx');if(n)n.disabled=!(SV('wg')&&document.getElementById('wm-dob').value&&document.getElementById('wm-h').value&&document.getElementById('wm-w').value);}
function V3(){var n=document.getElementById('wm-nx');if(n)n.disabled=!(SV('wa')&&SV('wgo'));}
function V4(){var w=SV('we'),n=document.getElementById('wm-nx');if(!w){n.disabled=true;return;}n.disabled=w==='yes'?!SV('wei'):false;}
function CA(){return{displayName:_draft.displayName||_un,gender:_draft.gender||'other',dateOfBirth:_draft.dateOfBirth||'',heightCm:parseFloat(_draft.heightCm)||170,weightKg:parseFloat(_draft.weightKg)||70,activityLevel:_draft.activityLevel||'moderately_active',goal:_draft.goal||'maintain',wantsExercise:_draft.wantsExercise==='yes',exerciseIntensity:_draft.exerciseIntensity||'moderate'};}

// ── Init ──
/** Initialise welcome modal and check if profile setup is needed */
function init(){injectStyles();patchSettings();var p=getProfile();if(isProfileComplete(p))applyToDashboard(p);else buildModal();}
window._nwShowWelcomeModal=function(){var p=getProfile();if(!isProfileComplete(p))buildModal();};
window._nwGetProfile=getProfile;window._nwApplyProfile=applyToDashboard;window._nwComputeProfile=computeAll;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else setTimeout(init,300);
})();
