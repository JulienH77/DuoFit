const KEY="duo_fit_v001";
const today=new Date(2026,9,4); // prototype date
const state=JSON.parse(localStorage.getItem(KEY)||"null")||{
 user:"julien",
 workouts:[
  {id:1,user:"julien",date:"2026-10-01",duration:28,items:[{exercise:"squat",sets:3,reps:12},{exercise:"bike",sets:1,reps:15}],points:51},
  {id:2,user:"partner",date:"2026-10-01",duration:35,items:[{exercise:"squat",sets:3,reps:15},{exercise:"lunge",sets:2,reps:10}],points:65},
  {id:3,user:"julien",date:"2026-10-03",duration:31,items:[{exercise:"pushup",sets:2,reps:8},{exercise:"lateral",sets:3,reps:12}],points:58},
  {id:4,user:"partner",date:"2026-10-03",duration:25,items:[{exercise:"bike",sets:1,reps:20}],points:20}
 ],
 quick:[
  {id:5,user:"julien",date:"2026-10-04",type:"Marche",duration:20,points:10}
 ]
};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
const exercises=[
 {id:"squat",name:"Squat",cat:"Jambes",desc:"Descente contrôlée, genoux dans l'axe des pieds.",points:10,unit:"répétitions",art:"squat"},
 {id:"lunge",name:"Fente",cat:"Jambes",desc:"Pas contrôlé, buste stable et genou avant aligné.",points:12,unit:"répétitions",art:"lunge"},
 {id:"pushup",name:"Pompes",cat:"Haut du corps",desc:"Corps gainé, descente contrôlée, mains sous les épaules.",points:15,unit:"répétitions",art:"pushup"},
 {id:"lateral",name:"Élévation latérale",cat:"Épaules",desc:"Bras légèrement fléchis, mouvement lent et contrôlé.",points:8,unit:"répétitions",art:"lateral"},
 {id:"deadbug",name:"Dead bug",cat:"Centre du corps",desc:"Dos stable au sol, mouvements lents et opposés.",points:10,unit:"répétitions",art:"deadbug"},
 {id:"bike",name:"Vélo",cat:"Cardio",desc:"Activité cardio à intensité confortable et régulière.",points:5,unit:"minutes",art:"bike"},
 {id:"walk",name:"Marche",cat:"Cardio",desc:"Marche active ou tranquille, selon l'objectif du jour.",points:5,unit:"minutes",art:"walk"},
 {id:"mobility",name:"Mobilité",cat:"Mobilité",desc:"Routine douce pour retrouver de l'amplitude.",points:5,unit:"minutes",art:"mobility"}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const userName=()=>state.user==="julien"?"Julien":"Elle";
function fmtDate(d){return d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function iconSvg(type){
 const common=`<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">`;
 let p="";
 if(type==="squat")p=`<circle cx="61" cy="18" r="9"/><path d="M61 28v29m0 0-22 19m22-19 25 18M39 76l-11 23m36-22 13 23M39 76l18-4 10 4"/>`;
 if(type==="lunge")p=`<circle cx="59" cy="18" r="9"/><path d="M59 28v30m0-18-22 14m22-14 25 13m-25 5-18 22m18-22 31 13m-31-13-12 27m43-14 13 12"/>`;
 if(type==="pushup")p=`<circle cx="25" cy="43" r="8"/><path d="M33 46 61 57l31-2m-59-12-18 13m46-1-7 25m39-37 11 15M46 80h43"/>`;
 if(type==="lateral")p=`<circle cx="60" cy="17" r="9"/><path d="M60 27v42m0-31-29 10m29-10 29 10M60 69 43 99m17-30 17 30M31 48l-9 4m67-4 9 4"/>`;
 if(type==="deadbug")p=`<circle cx="54" cy="53" r="8"/><path d="M62 56 86 68m-30-7-22 14m31-18 13-22m-25 24-10-22m13 40-2 18m20-14 15 11"/>`;
 if(type==="bike")p=`<circle cx="32" cy="78" r="20"/><circle cx="91" cy="78" r="20"/><path d="M32 78 52 45h20l19 33M52 45l10 33m-30 0h59M52 45l-9-11m29 11 10-12"/>`;
 if(type==="walk")p=`<circle cx="61" cy="17" r="9"/><path d="M61 27l-5 30m5-20-22 13m22-13 18 12M56 57 39 98m17-41 23 42"/>`;
 if(type==="mobility")p=`<circle cx="61" cy="20" r="9"/><path d="M61 30v32m0-19-31 7m31-7 29 7M61 62 40 96m21-34 22 34"/>`;
 return common+p+"</g></svg>";
}
function totalForUser(u){return [...state.workouts,...state.quick].filter(x=>x.user===u).reduce((a,x)=>a+(x.points||0),0)}
function weekItems(u){
 const start=new Date(2026,8,28), end=new Date(2026,9,4,23,59);
 return [...state.workouts,...state.quick].filter(x=>x.user===u&&new Date(x.date)>=start&&new Date(x.date)<=end)
}
function weekPoints(u){return weekItems(u).reduce((a,x)=>a+x.points,0)}
function weekSessions(u){return new Set(weekItems(u).map(x=>x.date)).size}
function xp(u){return totalForUser(u)*3}
function level(u){return Math.floor(xp(u)/300)+1}
function latest(u){return [...state.workouts,...state.quick].filter(x=>x.user===u).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6)}
function render(){
 const page=$(".nav-item.active")?.dataset.page||"dashboard";
 $("#page-eyebrow").textContent=fmtDate(today).toUpperCase();
 $("#page-title").textContent=page==="dashboard"?`Bonjour ${userName()}`:({calendar:"Calendrier",exercises:"Exercices",challenges:"Défis",profile:`Profil — ${userName()}`}[page]);
 ({dashboard:renderDashboard,calendar:renderCalendar,exercises:renderExercises,challenges:renderChallenges,profile:renderProfile}[page])();
}
function renderDashboard(){
 const me=weekPoints(state.user), other=weekPoints(state.user==="julien"?"partner":"julien");
 const recent=latest(state.user);
 $("#content").innerHTML=`
 <div class="grid grid-4">
  ${stat("Points cette semaine",me,other?`+ ${Math.max(0,me-other)} vs l'autre joueur`:"")}
  ${stat("Activités",weekSessions(state.user),"objectif : 4 cette semaine")}
  ${stat("Niveau",level(state.user),`${xp(state.user)} XP au total`)}
  ${stat("Série actuelle",streak(state.user),"jours actifs")}
 </div>
 <div class="section-head"><h2 class="section-title">Cette semaine</h2><span class="stat-sub">Objectif collectif : 700 pts</span></div>
 <div class="card">
  ${personProgress("julien","Julien")} ${personProgress("partner","Elle")}
  <div style="margin-top:18px"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:7px"><span>À deux</span><span>${weekPoints("julien")+weekPoints("partner")} / 700</span></div><div class="progress"><i style="width:${Math.min(100,(weekPoints("julien")+weekPoints("partner"))/7)}%"></i></div></div>
 </div>
 <div class="two-col">
  <div><div class="section-head"><h2 class="section-title">Dernières activités</h2></div><div class="card">${recent.length?`<div class="activity-list">${recent.map(activityHtml).join("")}</div>`:`<div class="empty">Aucune activité enregistrée.</div>`}</div></div>
  <div><div class="section-head"><h2 class="section-title">Objectifs</h2></div><div class="grid" style="gap:10px">${challengeMini("3 activités cette semaine",weekSessions(state.user),3)}${challengeMini("150 points cette semaine",weekPoints(state.user),150)}${challengeMini("Objectif à deux",weekPoints("julien")+weekPoints("partner"),700)}</div></div>
 </div>`;
}
function stat(label,value,sub){return `<div class="card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`}
function personProgress(u,label){let p=Math.min(100,weekPoints(u)/350*100);return `<div class="person-row"><strong><span class="mini-avatar ${u==="julien"?"j":"e"}">${u==="julien"?"J":"E"}</span>${label}</strong><div><div class="progress ${u==="partner"?"purple":""}"><i style="width:${p}%"></i></div></div><div class="score">${weekPoints(u)} pts</div></div>`}
function activityHtml(x){let name=x.type||x.items?.map(i=>exercises.find(e=>e.id===i.exercise)?.name).join(" · ")||"Activité";return `<div class="activity"><div class="activity-main"><div class="activity-icon">${x.type?"↗":"◈"}</div><div><div class="activity-name">${esc(name)}</div><div class="activity-meta">${x.date} · ${x.duration||0} min · ${x.user==="julien"?"Julien":"Elle"}</div></div></div><div class="points">+${x.points} pts</div></div>`}
function challengeMini(name,val,target){return `<div class="card" style="padding:15px"><div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700"><span>${name}</span><span>${Math.min(val,target)} / ${target}</span></div><div class="progress" style="margin-top:9px"><i style="width:${Math.min(100,val/target*100)}%"></i></div></div>`}
function streak(u){let dates=[...new Set([...state.workouts,...state.quick].filter(x=>x.user===u).map(x=>x.date))].sort().reverse(), cur=new Date(2026,9,4), n=0;for(let i=0;i<dates.length;i++){let d=dates[i], target=cur.toISOString().slice(0,10);if(d===target){n++;cur.setDate(cur.getDate()-1)}else if(i===0&&d===new Date(2026,9,3).toISOString().slice(0,10)){n++;cur.setDate(cur.getDate()-2)}else break}return n}
function renderCalendar(){
 const y=2026,m=9, first=new Date(y,m,1), days=new Date(y,m+1,0).getDate(), offset=(first.getDay()+6)%7;
 let cells="";for(let i=0;i<offset;i++)cells+=`<div class="day muted"></div>`;
 for(let d=1;d<=days;d++){let date=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, items=[...state.workouts,...state.quick].filter(x=>x.date===date), hasJ=items.some(x=>x.user==="julien"),hasE=items.some(x=>x.user==="partner"), cls=hasJ&&hasE?"both":hasE?"partner":"";cells+=`<button class="day ${date==="2026-10-04"?"today":""}" onclick="showDay('${date}')"><div class="day-number">${d}</div>${hasJ?`<div class="day-activity ${cls}">J · ${items.filter(x=>x.user==="julien").reduce((a,x)=>a+x.points,0)} pts</div>`:""}${hasE?`<div class="day-activity ${cls}">E · ${items.filter(x=>x.user==="partner").reduce((a,x)=>a+x.points,0)} pts</div>`:""}</button>`}
 $("#content").innerHTML=`<div class="calendar"><div class="calendar-head"><div><h2>Octobre 2026</h2><span class="stat-sub">Clique sur une journée pour voir le détail</span></div><div class="month-nav"><button>‹</button><button>›</button></div></div><div class="weekdays">${["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(x=>`<div class="weekday">${x}</div>`).join("")}</div><div class="days">${cells}</div></div>`;
}
function showDay(date){let items=[...state.workouts,...state.quick].filter(x=>x.date===date);openModal(`<div class="modal-header"><h2>${date}</h2><button class="close" onclick="closeModal()">×</button></div>${items.length?`<div class="activity-list">${items.map(activityHtml).join("")}</div>`:`<div class="empty">Aucune activité ce jour-là.</div>`}`)}
function renderExercises(){
 let cats=["Tous","Jambes","Haut du corps","Épaules","Centre du corps","Cardio","Mobilité"];
 $("#content").innerHTML=`<div class="card" style="margin-bottom:16px;padding:13px;display:flex;gap:8px;flex-wrap:wrap">${cats.map((c,i)=>`<button class="tag" style="${i===0?"background:#eef1ff;color:#4568e8":""}" onclick="filterExercises('${c}')">${c}</button>`).join("")}</div><div id="exercise-grid" class="grid grid-3">${exercises.map(exerciseCard).join("")}</div>`;
}
function filterExercises(cat){$("#exercise-grid").innerHTML=exercises.filter(e=>cat==="Tous"||e.cat===cat).map(exerciseCard).join("")}
function exerciseCard(e){return `<div class="card exercise-card"><div class="exercise-art">${iconSvg(e.art)}</div><div class="exercise-body"><h3>${e.name}</h3><p>${e.desc}</p><span class="tag">${e.cat}</span><div class="exercise-footer"><span class="exercise-points">${e.points} pts / ${e.unit}</span><button class="primary-btn" style="padding:8px 10px;font-size:10px" onclick="openWorkout('${e.id}')">Ajouter</button></div></div></div>`}
function renderChallenges(){
 const both=weekPoints("julien")+weekPoints("partner");
 $("#content").innerHTML=`<div class="grid grid-3">
 ${challenge("700","Objectif à deux","Atteindre 700 points cumulés cette semaine.",both,700,"Coopération")}
 ${challenge("3","Régularité","Faire au moins 3 activités chacun cette semaine.",Math.min(weekSessions("julien"),weekSessions("partner")),3,"Duo")}
 ${challenge("1","Première place","Terminer la semaine en tête du classement.",weekPoints(state.user),Math.max(weekPoints("julien"),weekPoints("partner"))||1,"Compétition")}
 </div>
 <div class="section-head"><h2 class="section-title">Classement de la semaine</h2></div>
 <div class="card">${ranking()}</div>
 <div class="section-head"><h2 class="section-title">Récompenses</h2></div>
 <div class="grid grid-3">${reward("7","Première semaine","Faire 3 activités.",weekSessions(state.user)>=3)}${reward("150","Régulier","Atteindre 150 pts sur une semaine.",weekPoints(state.user)>=150)}${reward("700","Duo solide","Atteindre 700 pts à deux.",both>=700)}</div>`;
}
function challenge(badge,name,desc,val,target,type){return `<div class="card challenge"><div class="challenge-badge">${badge}</div><h3>${name}</h3><p>${desc}</p><div class="progress"><i style="width:${Math.min(100,val/target*100)}%"></i></div><div class="challenge-foot"><span>${type}</span><strong>${Math.min(val,target)} / ${target}</strong></div></div>`}
function ranking(){let a=[["Julien",weekPoints("julien"),"j"],["Elle",weekPoints("partner"),"e"]].sort((x,y)=>y[1]-x[1]);return a.map((x,i)=>`<div class="person-row" style="grid-template-columns:120px 1fr 80px"><strong><span class="mini-avatar ${x[2]}">${x[2]==="j"?"J":"E"}</span>${i===0?"🥇 ":""}${x[0]}</strong><div class="progress ${x[2]==="e"?"purple":""}"><i style="width:${x[1]/Math.max(a[0][1],1)*100}%"></i></div><div class="score">${x[1]} pts</div></div>`).join("")}
function reward(n,name,desc,done){return `<div class="card" style="opacity:${done?1:.55}"><div style="font-size:22px;font-weight:800;margin-bottom:9px">${n}</div><strong style="font-size:12px">${name}</strong><p style="font-size:10px;color:var(--muted);margin:5px 0">${desc}</p><span class="tag">${done?"Débloqué":"À débloquer"}</span></div>`}
function renderProfile(){
 let u=state.user,total=totalForUser(u), sessions=new Set([...state.workouts,...state.quick].filter(x=>x.user===u).map(x=>x.date)).size;
 let cats={Jambes:0,"Haut du corps":0,Épaules:0,"Centre du corps":0,Cardio:0,Mobilité:0};
 state.workouts.filter(x=>x.user===u).forEach(w=>w.items.forEach(i=>{let e=exercises.find(e=>e.id===i.exercise);if(e)cats[e.cat]+=i.sets*i.reps}));
 let max=Math.max(...Object.values(cats),1);
 $("#content").innerHTML=`<div class="grid grid-2"><div class="card"><div class="profile-hero"><div class="profile-big ${u==="julien"?"j":"e"}">${u==="julien"?"J":"E"}</div><div><h2 style="margin:0;font-size:20px">${u==="julien"?"Julien":"Elle"}</h2><p style="margin:5px 0;color:var(--muted);font-size:11px">Niveau ${level(u)} · ${xp(u)} XP</p></div></div><div style="margin-top:25px"><div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:7px"><span>Progression vers le niveau ${level(u)+1}</span><span>${xp(u)%300} / 300</span></div><div class="progress"><i style="width:${(xp(u)%300)/3}%"></i></div></div></div>
 <div class="card"><h2 class="section-title">Mes statistiques</h2><div class="grid grid-3">${stat("Points",total,"total")}${stat("Jours actifs",sessions,"depuis le début")}${stat("Meilleure série",streak(u),"jours")}</div></div></div>
 <div class="section-head"><h2 class="section-title">Répartition de l'activité</h2></div><div class="card">${Object.entries(cats).map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><strong>${v}</strong></div>`).join("")}</div>`;
}
function openWorkout(prefill=null){let e=exercises.find(x=>x.id===prefill)||exercises[0];openModal(`<div class="modal-header"><h2>Nouvelle séance</h2><button class="close" onclick="closeModal()">×</button></div><div class="form-grid"><div class="field"><label>DATE</label><input id="w-date" type="date" value="2026-10-04"></div><div class="field"><label>DURÉE (MIN)</label><input id="w-duration" type="number" value="30" min="1"></div><div class="field full"><label>EXERCICES</label><div class="exercise-picker">${exercises.map(x=>`<div class="picker-row"><span>${x.name}</span><input class="sets" data-id="${x.id}" type="number" min="0" value="${x.id===e.id?3:0}" placeholder="séries"><input class="reps" data-id="${x.id}" type="number" min="0" value="${x.id===e.id?10:0}" placeholder="rép."></div>`).join("")}</div></div></div><div class="modal-actions"><button class="ghost-btn" onclick="closeModal()">Annuler</button><button class="primary-btn" onclick="saveWorkout()">Enregistrer la séance</button></div>`)}
function saveWorkout(){let items=[];$$(".sets").forEach(s=>{let sets=+s.value,reps=+document.querySelector(`.reps[data-id="${s.dataset.id}"]`).value;if(sets>0&&reps>0)items.push({exercise:s.dataset.id,sets,reps})});if(!items.length){toast("Ajoute au moins un exercice");return}let points=items.reduce((sum,i)=>{let e=exercises.find(e=>e.id===i.exercise);return sum+e.points*i.sets*i.reps},0);state.workouts.push({id:Date.now(),user:state.user,date:$("#w-date").value,duration:+$("#w-duration").value||0,items,points});save();closeModal();toast(`Séance enregistrée · +${points} pts`);render()}
function openQuick(){openModal(`<div class="modal-header"><h2>Activité rapide</h2><button class="close" onclick="closeModal()">×</button></div><div class="quick-grid">${["Marche","Vélo","Mobilité","Autre"].map(x=>`<button class="quick-option" onclick="saveQuick('${x}')"><strong>${x}</strong><span>Enregistrer une activité sans détailler les exercices</span></button>`).join("")}</div><div class="field" style="margin-top:14px"><label>DURÉE (MINUTES)</label><input id="q-duration" type="number" value="20" min="1"></div>`)}
function saveQuick(type){let d=+$("#q-duration").value||20, rate=type==="Vélo"?5:type==="Marche"?5:3;state.quick.push({id:Date.now(),user:state.user,date:"2026-10-04",type,duration:d,points:Math.round(d*rate)});save();closeModal();toast(`Activité enregistrée · +${Math.round(d*rate)} pts`);render()}
function openModal(html){$("#modal-content").innerHTML=html;$("#modal").classList.add("open")}
function closeModal(){$("#modal").classList.remove("open")}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2400)}
$$(".nav-item").forEach(b=>b.onclick=()=>{$$(".nav-item").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
$$(".person-switch").forEach(b=>b.onclick=()=>{state.user=b.dataset.user;$$(".person-switch").forEach(x=>x.classList.toggle("active",x===b));render()});
$("#add-workout").onclick=()=>openWorkout();
$("#quick-add").onclick=openQuick;
$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
render();
