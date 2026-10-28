/* Vartalaap.com — site script (no dependencies) */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- Private inbox routing (the address is never written in the page) ---------- */
var _k=[106,104,100,41,107,110,102,106,96,71,54,102,116,108,117,104,112,101,98,112];
function inbox(){return String.fromCharCode.apply(null,_k.map(function(c){return c^7})).split('').reverse().join('')}
function endpoint(){return 'https://formsubmit.co/ajax/'+inbox()}
$$('[data-mail]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();location.href='mailto:'+inbox()+'?subject='+encodeURIComponent(a.getAttribute('data-mail')||'Inquiry from Vartalaap.com')})});

/* ---------- Theme / menu / active nav ---------- */
var root=document.documentElement,tb=$('#themeBtn');
if(tb)tb.addEventListener('click',function(){var dark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);var n=dark?'light':'dark';root.setAttribute('data-theme',n);store('vt-theme',n)});
var bg=$('#burger'),menu=$('#menu');
if(bg&&menu)bg.addEventListener('click',function(){var o=menu.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
var here=location.pathname;
$$('#menu a').forEach(function(a){var h=a.getAttribute('href');if(h===here||(h.length>1&&h.slice(-1)==='/'&&here.indexOf(h)===0)){a.classList.add('active');a.setAttribute('aria-current','page')}});

/* ---------- Reveal / cookie / year ---------- */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.1});$$('.reveal').forEach(function(el){io.observe(el)})}else{$$('.reveal').forEach(function(el){el.classList.add('in')})}
var ck=$('#cookie');if(ck&&!store('vt-cookie'))ck.classList.add('show');
$$('[data-cookie]').forEach(function(b){b.addEventListener('click',function(){store('vt-cookie',b.getAttribute('data-cookie'));ck.classList.remove('show')})});
$$('.year').forEach(function(el){el.textContent=new Date().getFullYear()});

/* ---------- Speech helpers ---------- */
var synth=window.speechSynthesis;
function voiceFor(lang){if(!synth)return null;var vs=synth.getVoices();return vs.filter(function(v){return v.lang===lang})[0]||vs.filter(function(v){return v.lang.indexOf(lang.split('-')[0])===0})[0]||null}
function say(text,lang,rate){if(!synth){alert('Your browser does not support speech playback. Try Chrome or Edge.');return}synth.cancel();var u=new SpeechSynthesisUtterance(text);u.lang=lang||'en-IN';var v=voiceFor(u.lang);if(v)u.voice=v;u.rate=rate||0.92;synth.speak(u)}
if(synth&&synth.onvoiceschanged!==undefined)synth.onvoiceschanged=function(){};
window.VTsay=say;
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function listen(lang,onText,onEnd,continuous){if(!SR){alert('Speech recognition works in Chrome, Edge and Safari on desktop and Android. You can type instead.');onEnd&&onEnd('');return null}var r=new SR();r.lang=lang||'en-IN';r.interimResults=true;r.continuous=!!continuous;var finalT='';r.onresult=function(e){var interim='';for(var i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalT+=e.results[i][0].transcript+' ';else interim+=e.results[i][0].transcript}onText&&onText((finalT+interim).trim())};r.onerror=function(){};r.onend=function(){onEnd&&onEnd(finalT.trim())};try{r.start()}catch(e){}return r}
$$('[data-say]').forEach(function(b){b.addEventListener('click',function(){say(b.getAttribute('data-say'),b.getAttribute('data-lang')||'en-IN')})});

/* similarity 0-100 by word overlap (order-aware LCS) */
function norm(s){return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)}
function similarity(a,b){var x=norm(a),y=norm(b);if(!x.length||!y.length)return 0;var m=x.length,n=y.length,d=[];for(var i=0;i<=m;i++){d[i]=[];for(var j=0;j<=n;j++)d[i][j]=0}for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=x[i-1]===y[j-1]?d[i-1][j-1]+1:Math.max(d[i-1][j],d[i][j-1]);return Math.round(2*d[m][n]/(m+n)*100)}

/* ---------- Forms ---------- */
function resetSteps(f){var st=$$('.step',f);if(!st.length)return;st.forEach(function(s,i){s.classList.toggle('active',i===0)});$$('.steps-ind span',f).forEach(function(s,i){s.classList.toggle('on',i===0)});f._go&&f._go(0,true)}
$$('form.js-form').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var msg=$('.form-msg',f);
    if(f._honey&&f._honey.value)return;
    if(!f.checkValidity()){f.reportValidity();return}
    var btn=$('button[type=submit]',f),old=btn?btn.textContent:'';
    if(btn){btn.disabled=true;btn.textContent='Sending…'}
    var data={};new FormData(f).forEach(function(v,k){if(k!=='_honey')data[k]=data[k]?data[k]+', '+v:v});
    var lvl=store('vt-level');if(lvl&&!data.test_result)data.test_result=lvl;
    data._subject=(f.getAttribute('data-subject')||'Vartalaap.com form')+' — '+(data.name||data.email||'');
    data._template='table';data._captcha='false';data.page=location.pathname;
    fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().catch(function(){return {}})})
      .then(function(){if(msg){msg.className='form-msg ok';msg.textContent=f.getAttribute('data-ok')||'Thank you — we will reply within 24 hours.'}f.reset();resetSteps(f)})
      .catch(function(){if(msg){msg.className='form-msg err';msg.textContent='Network error — please try again in a minute.'}})
      .then(function(){if(btn){btn.disabled=false;btn.textContent=old}});
  });
});
$$('form.multistep').forEach(function(f){
  var steps=$$('.step',f),ind=$$('.steps-ind span',f),i=0;
  function go(n,force){if(!force&&n>i){var bad=$$('input,select,textarea',steps[i]).filter(function(x){return !x.checkValidity()});if(bad.length){bad[0].reportValidity();return}}i=Math.max(0,Math.min(steps.length-1,n));steps.forEach(function(s,k){s.classList.toggle('active',k===i)});ind.forEach(function(s,k){s.classList.toggle('on',k<=i)})}
  f._go=go;
  $$('[data-next]',f).forEach(function(b){b.addEventListener('click',function(){go(i+1)})});
  $$('[data-prev]',f).forEach(function(b){b.addEventListener('click',function(){go(i-1)})});
});
/* prefill goal from query (?goal=Interview) */
var qs=new URLSearchParams(location.search),g=qs.get('goal');
if(g){$$('input[name=goal]').forEach(function(r){if(r.value.toLowerCase().indexOf(g.toLowerCase())===0)r.checked=true})}
var lvlOut=$('#savedLevel');if(lvlOut&&store('vt-level')){lvlOut.textContent='Your level test result ('+store('vt-level')+') will be attached so your coach can prepare.';lvlOut.hidden=false}

/* ---------- YouTube facades ---------- */
$$('.video[data-yt]').forEach(function(v){
  var id=v.getAttribute('data-yt'),t=v.getAttribute('data-title')||'YouTube video';
  v.innerHTML='<img loading="lazy" alt="'+esc(t)+'" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg"><div class="play"><span>▶</span></div>';
  v.setAttribute('role','button');v.setAttribute('tabindex','0');v.setAttribute('aria-label','Play: '+t);
  function play(){v.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="'+esc(t)+'" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>'}
  v.addEventListener('click',play,{once:true});v.addEventListener('keydown',function(e){if(e.key==='Enter')play()});
});
var vf=$('#videoFilter');
if(vf)$$('button',vf).forEach(function(b){b.addEventListener('click',function(){$$('button',vf).forEach(function(x){x.classList.toggle('on',x===b)});var c=b.getAttribute('data-c');$$('[data-vcat]').forEach(function(card){card.style.display=c==='all'||card.getAttribute('data-vcat')===c?'':'none'})})});

/* ---------- Hero chat animation ---------- */
var hc=$('#heroChat');
if(hc){
  var convo=[["them","Tell me about yourself.","Interview practice · English"],["me","I'm a B.Com graduate with two years in customer support…",""],["them","आप कहाँ से हैं?","Where are you from? · Hindi"],["me","मैं टोरंटो से हूँ।","I'm from Toronto."],["them","Great answer! Fluency score: 86 / 100","Conversation Lab"]];
  var ci=0;
  (function next(){
    if(ci>=convo.length){setTimeout(function(){hc.innerHTML='';ci=0;next()},3500);return}
    var c=convo[ci++];var t=document.createElement('div');t.className='typing'+(c[0]==='me'?' me':'');t.innerHTML='<i></i><i></i><i></i>';if(c[0]==='me')t.style.marginLeft='auto';hc.appendChild(t);
    setTimeout(function(){t.remove();var b=document.createElement('div');b.className='bubble '+c[0];b.innerHTML=esc(c[1])+(c[2]?'<small>'+esc(c[2])+'</small>':'');hc.appendChild(b);while(hc.children.length>5)hc.removeChild(hc.firstChild);setTimeout(next,900)},800);
  })();
}

/* ---------- Phrase of the day ---------- */
var P=window.VT_PHRASES||[];
var pod=$('#pod');
if(pod&&P.length){var day=Math.floor(Date.now()/864e5),p=P[day%P.length];
  $('#podEn').textContent=p[1];$('#podHi').textContent=p[2];$('#podRom').textContent=p[3];$('#podCat').textContent=p[0];
  $('#podSayHi').addEventListener('click',function(){say(p[2],'hi-IN',.85)});$('#podSayEn').addEventListener('click',function(){say(p[1],'en-IN')});}

/* ---------- Phrasebook ---------- */
var pl=$('#plist');
if(pl&&P.length){
  var favs={};try{favs=JSON.parse(store('vt-favs')||'{}')}catch(e){}
  var cats=['All','★ Saved'].concat(P.map(function(p){return p[0]}).filter(function(c,i,a){return a.indexOf(c)===i}));
  var chipBox=$('#pcats'),cur='All',q='';
  chipBox.innerHTML=cats.map(function(c){return '<button type="button" data-c="'+esc(c)+'"'+(c==='All'?' class="on"':'')+'>'+esc(c)+'</button>'}).join('');
  function render(){
    var list=P.map(function(p,i){return {p:p,i:i}}).filter(function(o){var p=o.p;if(cur==='★ Saved'&&!favs[o.i])return false;if(cur!=='All'&&cur!=='★ Saved'&&p[0]!==cur)return false;if(q&&(p.join(' ').normalize('NFC').toLowerCase().indexOf(q)<0))return false;return true});
    $('#pcount').textContent=list.length+' phrase'+(list.length===1?'':'s');
    pl.innerHTML=list.length?list.map(function(o){var p=o.p;return '<article class="phrase"><span class="tag">'+esc(p[0])+'</span><div class="en">'+esc(p[1])+'</div><div class="hi" lang="hi">'+esc(p[2])+'</div><div class="rom">'+esc(p[3])+'</div><div class="acts"><button class="speak sm" data-i="'+o.i+'" data-l="hi" aria-label="Listen in Hindi">हि</button><button class="speak sm alt" data-i="'+o.i+'" data-l="en" aria-label="Listen in English">En</button><button class="fav'+(favs[o.i]?' on':'')+'" data-f="'+o.i+'" aria-label="Save phrase">★</button></div></article>'}).join(''):'<p class="muted">No phrases match. Try another word.</p>';
  }
  pl.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-f')){var k=b.getAttribute('data-f');if(favs[k])delete favs[k];else favs[k]=1;store('vt-favs',JSON.stringify(favs));b.classList.toggle('on');if(cur==='★ Saved')render();return}var p=P[+b.getAttribute('data-i')];if(b.getAttribute('data-l')==='hi')say(p[2],'hi-IN',.85);else say(p[1],'en-IN')});
  chipBox.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cur=b.getAttribute('data-c');$$('button',chipBox).forEach(function(x){x.classList.toggle('on',x===b)});render()});
  $('#psearch').addEventListener('input',function(e){q=e.target.value.normalize('NFC').toLowerCase().trim();render()});
  render();
  /* flashcards */
  var fc=$('#flashCard'),deck=[],fi=0,dir='en';
  function deal(){deck=P.map(function(p,i){return i}).filter(function(i){return cur==='All'||cur==='★ Saved'?(cur==='All'||favs[i]):P[i][0]===cur});if(!deck.length)deck=P.map(function(p,i){return i});for(var i=deck.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=deck[i];deck[i]=deck[j];deck[j]=t}fi=0;showCard()}
  function showCard(){var p=P[deck[fi]];fc.classList.remove('flip');$('#fcFront').innerHTML=dir==='en'?'<div><div class="big">'+esc(p[1])+'</div><p class="muted">Say it in Hindi, then tap to flip</p></div>':'<div><div class="big" lang="hi">'+esc(p[2])+'</div><p class="muted">'+esc(p[3])+'</p></div>';$('#fcBack').innerHTML=dir==='en'?'<div><div class="big" lang="hi">'+esc(p[2])+'</div><p>'+esc(p[3])+'</p></div>':'<div><div class="big">'+esc(p[1])+'</div></div>';$('#fcPos').textContent=(fi+1)+' / '+deck.length}
  if(fc){fc.addEventListener('click',function(){fc.classList.toggle('flip')});fc.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();fc.classList.toggle('flip')}});
    $('#fcNext').addEventListener('click',function(){fi=(fi+1)%deck.length;showCard()});$('#fcPrev').addEventListener('click',function(){fi=(fi-1+deck.length)%deck.length;showCard()});
    $('#fcSay').addEventListener('click',function(){var p=P[deck[fi]];say(p[2],'hi-IN',.85)});
    $('#fcShuffle').addEventListener('click',deal);
    $$('#fcDir button').forEach(function(b){b.addEventListener('click',function(){dir=b.getAttribute('data-d');$$('#fcDir button').forEach(function(x){x.classList.toggle('on',x===b)});showCard()})});
    deal();}
}

/* ---------- Conversation Lab ---------- */
var S=window.VT_SCENES||[],stage=$('#stage');
if(stage&&S.length){
  var sl=$('#sceneList'),scene=null,pos=0,scores=[],rec=null;
  sl.innerHTML=S.map(function(s){return '<button type="button" data-s="'+s.id+'"><b>'+esc(s.title)+'</b><small>'+esc(s.level)+' · '+(s.lang==='hi-IN'?'Hindi':'English')+'</small></button>'}).join('');
  function load(id){scene=S.filter(function(s){return s.id===id})[0]||S[0];pos=0;scores=[];$$('button',sl).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-s')===scene.id)});$('#sceneTitle').textContent=scene.title;$('#sceneMeta').textContent=scene.level+' · '+(scene.lang==='hi-IN'?'Hindi dialogue':'English dialogue')+' · '+scene.lines.length+' lines';$('#lines').innerHTML='';$('#labResult').hidden=true;history.replaceState(null,'','#'+scene.id);step()}
  function addLine(l,extra){var d=document.createElement('div');d.className='line '+l[0];d.innerHTML='<div class="bubble '+l[0]+'"'+(scene.lang==='hi-IN'?' lang="hi"':'')+'>'+esc(l[1])+(l[2]?'<small>'+esc(l[2])+'</small>':'')+(extra||'')+'</div><button class="speak sm alt" aria-label="Listen">🔊</button>';$('button',d).addEventListener('click',function(){say(l[1],scene.lang,scene.lang==='hi-IN'?.85:.95)});$('#lines').appendChild(d);d.scrollIntoView({block:'nearest',behavior:'smooth'});return d}
  function step(){
    var box=$('#turnBox');box.innerHTML='';
    if(pos>=scene.lines.length){finish();return}
    var l=scene.lines[pos];
    if(l[0]==='them'){addLine(l);if($('#autoPlay').checked)say(l[1],scene.lang,scene.lang==='hi-IN'?.85:.95);pos++;setTimeout(step,500);return}
    box.innerHTML='<div class="card" style="padding:18px"><p class="muted" style="margin-bottom:6px">Your turn — say this line:</p><p style="font-size:1.15rem;font-weight:600"'+(scene.lang==='hi-IN'?' lang="hi"':'')+'>'+esc(l[1])+'</p>'+(l[2]?'<p class="muted">'+esc(l[2])+'</p>':'')+'<div class="toolbar"><button class="btn btn-primary btn-sm" id="hear">🔊 Hear it</button><button class="btn btn-sm rec" id="recBtn">🎙 Speak</button><button class="btn btn-ghost btn-sm" id="skip">Type instead</button></div><div class="transcript" id="tx" aria-live="polite"></div></div>';
    $('#hear').addEventListener('click',function(){say(l[1],scene.lang,scene.lang==='hi-IN'?.8:.9)});
    $('#recBtn').addEventListener('click',function(){var b=this;if(rec){rec.stop();return}b.classList.add('live');b.textContent='■ Stop';rec=listen(scene.lang,function(t){$('#tx').textContent=t},function(t){rec=null;b.classList.remove('live');b.textContent='🎙 Speak';if(t)grade(l,t)})});
    $('#skip').addEventListener('click',function(){var t=prompt('Type your line:');if(t)grade(l,t)});
  }
  function grade(l,t){var sc=similarity(l[1],t);scores.push(sc);addLine(['me',t],'<small>Match: '+sc+'% '+(sc>=80?'✓ great':sc>=55?'· good, try again for clarity':'· listen once more and repeat')+'</small>');pos++;step()}
  function finish(){var avg=scores.length?Math.round(scores.reduce(function(a,b){return a+b},0)/scores.length):0;var r=$('#labResult');r.hidden=false;$('#labScore').textContent=avg;$('#labBar').style.width=avg+'%';$('#labVerdict').textContent=avg>=85?'Excellent clarity. Try a harder scene or speed up.':avg>=65?'Solid. Repeat the scene once more, focusing on the lines under 70%.':'Keep going. Use “Hear it” before each line and shadow the rhythm.';var best=JSON.parse(store('vt-lab')||'{}');if(!best[scene.id]||avg>best[scene.id]){best[scene.id]=avg;store('vt-lab',JSON.stringify(best))}}
  sl.addEventListener('click',function(e){var b=e.target.closest('button');if(b)load(b.getAttribute('data-s'))});
  $('#restart').addEventListener('click',function(){load(scene.id)});
  load((location.hash||'').slice(1));
}

/* ---------- Tool tabs ---------- */
$$('.tool-tabs button').forEach(function(b){b.addEventListener('click',function(){$$('.tool-tabs button').forEach(function(x){x.classList.toggle('on',x===b)});$$('.tool').forEach(function(t){t.classList.toggle('on',t.id===b.getAttribute('data-tool'))});history.replaceState(null,'','#'+b.getAttribute('data-tool'))})});
if(location.hash){var hb=$('.tool-tabs button[data-tool="'+location.hash.slice(1)+'"]');if(hb)hb.click()}

/* ---------- Topic generator (shared by tools + challenge) ---------- */
var TOPICS=["Describe your favourite place in your city.","Talk about a person who inspires you.","What would you do with an extra hour every day?","Is social media good for students?","Describe a festival you love and why.","Talk about a mistake that taught you something.","Should working from home be the default?","Describe your perfect weekend.","What skill should every school teach?","Talk about a book or film that changed your mind.","Explain your job to a ten-year-old.","Cash or UPI — which is better and why?","Describe your morning routine.","What is the best advice you have received?","Should India have a four-day work week?","Describe a trip you will never forget.","What makes a good leader?","Talk about a time you helped a stranger.","Online classes or classroom — which is better?","If you could learn any skill instantly, what would it be?"];
function topic(){return TOPICS[Math.floor(Math.random()*TOPICS.length)]}

/* ---------- Speaking pace + filler meter ---------- */
var FILLERS=['um','uh','umm','uhh','like','basically','actually','you know','i mean','so','right','okay','literally','kind of','sort of','matlab','haan','acha','yaar'];
function analyse(text,secs){
  var words=norm(text),wc=words.length,low=' '+words.join(' ')+' ',found={},fc=0;
  FILLERS.forEach(function(f){var re=new RegExp(' '+f+' ','g');var m=low.match(re);if(m){found[f]=m.length;fc+=m.length}});
  var wpm=secs>0?Math.round(wc/(secs/60)):0;
  var uniq={};words.forEach(function(w){uniq[w]=1});
  return {wc:wc,wpm:wpm,fc:fc,found:found,rate:wc?Math.round(fc/wc*1000)/10:0,variety:wc?Math.round(Object.keys(uniq).length/wc*100):0};
}
function paceNote(w){return w===0?'—':w<100?'Slow — add energy and fewer pauses.':w<=160?'Ideal conversational pace.':w<=185?'Fast — slow down on key points.':'Too fast — listeners will miss words.'}
function showAnalysis(a,pref){
  $('#'+pref+'wc').textContent=a.wc;$('#'+pref+'wpm').textContent=a.wpm||'—';$('#'+pref+'fc').textContent=a.fc;$('#'+pref+'var').textContent=a.variety+'%';
  var note=$('#'+pref+'note');if(note)note.textContent=(a.wpm?paceNote(a.wpm)+' ':'')+(a.fc?'Fillers: '+Object.keys(a.found).map(function(k){return k+' ×'+a.found[k]}).join(', ')+' ('+a.rate+' per 100 words).':'No common fillers detected — great control.');
}
var pRec=null,pStart=0,pTimer=null;
var pBtn=$('#paceBtn');
if(pBtn){
  $('#paceTopic').textContent=topic();
  $('#paceNew').addEventListener('click',function(){$('#paceTopic').textContent=topic()});
  pBtn.addEventListener('click',function(){
    if(pRec){pRec.stop();return}
    pStart=Date.now();$('#paceTx').textContent='';pBtn.classList.add('live');pBtn.textContent='■ Stop';
    pTimer=setInterval(function(){var s=Math.floor((Date.now()-pStart)/1000);$('#paceClock').textContent=Math.floor(s/60)+':'+('0'+s%60).slice(-2)},250);
    pRec=listen($('#paceLang').value,function(t){$('#paceTx').textContent=t},function(t){clearInterval(pTimer);pRec=null;pBtn.classList.remove('live');pBtn.textContent='🎙 Start speaking';var secs=(Date.now()-pStart)/1000;var a=analyse(t||$('#paceTx').textContent,secs);showAnalysis(a,'p-');var h=JSON.parse(store('vt-pace')||'[]');if(a.wc>5){h.push({d:Date.now(),wpm:a.wpm,f:a.rate});store('vt-pace',JSON.stringify(h.slice(-20)))}},true);
  });
}
var fBtn=$('#fillBtn');
if(fBtn)fBtn.addEventListener('click',function(){var t=$('#fillText').value,secs=parseFloat($('#fillSecs').value)||0;showAnalysis(analyse(t,secs),'f-')});

/* ---------- Error checker ---------- */
var eBtn=$('#errBtn');
if(eBtn)eBtn.addEventListener('click',function(){
  var t=$('#errText').value,out=$('#errOut'),E=window.VT_ERRORS||[],hits=[];
  E.forEach(function(e){if(e[0].test(t))hits.push(e[1])});
  out.innerHTML=t.trim()?(hits.length?'<p><b>'+hits.length+' suggestion'+(hits.length>1?'s':'')+'</b></p><ul>'+hits.map(function(h){return '<li>'+esc(h)+'</li>'}).join('')+'</ul>':'<p class="form-msg ok">No common Indian-English slips found. For grammar beyond these patterns, read it aloud — your ear catches more than you think.</p>'):'<p class="muted">Paste a sentence or an email first.</p>';
});

/* ---------- IELTS speaking band estimator ---------- */
if($('#ielts')){
  function band(){var v=['i-fc','i-lr','i-gr','i-pr'].map(function(id){return parseFloat($('#'+id).value)});['i-fc','i-lr','i-gr','i-pr'].forEach(function(id,k){$('#'+id+'v').textContent=v[k].toFixed(1)});var avg=v.reduce(function(a,b){return a+b},0)/4;var r=Math.floor(avg*4)/4;var b=r%1===.25?Math.floor(r)+.5:r%1===.75?Math.ceil(r):r;$('#i-band').textContent=b.toFixed(1);var low=['Fluency & coherence','Lexical resource','Grammar range & accuracy','Pronunciation'][v.indexOf(Math.min.apply(null,v))];$('#i-note').textContent='Raw average '+avg.toFixed(2)+' → reported band '+b.toFixed(1)+'. Biggest lift: '+low+'.'}
  $$('#ielts input[type=range]').forEach(function(r){r.addEventListener('input',band)});band();
}

/* ---------- Topic card (JAM) ---------- */
var jam=$('#jamBtn');
if(jam){var jt=null;jam.addEventListener('click',function(){$('#jamTopic').textContent=topic();var left=parseInt($('#jamLen').value,10);clearInterval(jt);$('#jamClock').textContent=left+'s';jt=setInterval(function(){left--;$('#jamClock').textContent=left+'s';if(left<=0){clearInterval(jt);$('#jamClock').textContent='Time!'}},1000)})}

/* ---------- Streak tracker ---------- */
var stk=$('#streakBtn');
if(stk){
  function days(){try{return JSON.parse(store('vt-days')||'[]')}catch(e){return []}}
  function key(d){return d.toISOString().slice(0,10)}
  function renderStreak(){var ds=days(),set={};ds.forEach(function(d){set[d]=1});var s=0,d=new Date();if(!set[key(d)])d.setDate(d.getDate()-1);while(set[key(d)]){s++;d.setDate(d.getDate()-1)}$('#streakNum').textContent=s;$('#streakTotal').textContent=ds.length;var cal='';var t=new Date();for(var i=27;i>=0;i--){var x=new Date(t);x.setDate(t.getDate()-i);cal+='<span title="'+key(x)+'" style="display:inline-block;width:18px;height:18px;margin:2px;border-radius:5px;background:'+(set[key(x)]?'var(--accent)':'var(--line)')+'"></span>'}$('#streakCal').innerHTML=cal;stk.disabled=!!set[key(new Date())];stk.textContent=set[key(new Date())]?'✓ Logged today':'I practised today'}
  stk.addEventListener('click',function(){var ds=days(),k=key(new Date());if(ds.indexOf(k)<0){ds.push(k);store('vt-days',JSON.stringify(ds))}renderStreak()});
  renderStreak();
}

/* ---------- Level test (assessment) ---------- */
var quiz=$('#quiz');
if(quiz){
  var Q=[
  ["Choose the correct sentence.",["I am having two brothers.","I have two brothers.","I am have two brothers."],1,"For possession use the simple present: “I have”."],
  ["Your manager says, “Can you join the 4 pm call?” The most natural reply is:",["Yes, I will do the needful.","Sure, I'll be there.","Yes, I am agree."],1,"Short, clear and natural."],
  ["Fill in: “I have lived in Pune ___ 2019.”",["for","since","from"],1,"“Since” + a starting point."],
  ["Which word means “to move a meeting earlier” in international English?",["prepone","bring forward","advance back"],1,"“Bring forward” is understood everywhere."],
  ["Pick the correct question.",["Where you are going?","Where are you going?","Where you going are?"],1,"Invert the auxiliary in direct questions."],
  ["“Could you please ___ me the process?”",["explain","explain to","explain about"],1,"Explain something TO someone."],
  ["Choose the uncountable-noun sentence that is correct.",["She gave me many advices.","She gave me some advice.","She gave me an advices."],1,"“Advice” is uncountable."],
  ["In an interview, “Tell me about yourself” should mostly cover:",["Your family background and hobbies","Your relevant experience, skills and why this role","Your school marks year by year"],1,"Present–past–future, tied to the job."],
  ["Which phrase politely disagrees?",["You are wrong.","I see your point, but I look at it differently.","No, no, that's not correct only."],1,"Acknowledge, then offer your view."],
  ["“I ___ the report yesterday.”",["have sent","sent","have send"],1,"Finished past time → simple past."],
  ["In Hindi, “धन्यवाद” (dhanyavaad) means:",["Welcome","Thank you","Goodbye"],1,"धन्यवाद = thank you."],
  ["The best way to reduce “um” and “uh” while speaking is to:",["Speak faster","Pause silently instead of filling the gap","Memorise every answer word for word"],1,"A silent pause sounds confident; fillers don't."]
  ];
  var qi=0,right=0,box=$('#qBox');
  function showQ(){var q=Q[qi];$('#qProg').style.width=(qi/Q.length*100)+'%';$('#qNum').textContent='Question '+(qi+1)+' of '+Q.length;box.innerHTML='<h3>'+esc(q[0])+'</h3><div class="opts">'+q[1].map(function(o,k){return '<button type="button" data-k="'+k+'">'+esc(o)+'</button>'}).join('')+'</div><p class="muted" id="qWhy" style="margin-top:12px"></p>'}
  box.addEventListener('click',function(e){var b=e.target.closest('button[data-k]');if(!b||box._lock)return;box._lock=true;var q=Q[qi],k=+b.getAttribute('data-k');$$('button[data-k]',box).forEach(function(x){if(+x.getAttribute('data-k')===q[2])x.classList.add('right')});if(k===q[2])right++;else b.classList.add('wrong');$('#qWhy').textContent=q[3];setTimeout(function(){box._lock=false;qi++;if(qi<Q.length)showQ();else done()},1300)});
  function done(){$('#qProg').style.width='100%';var pct=Math.round(right/Q.length*100);var lv=pct>=92?['C1 · Advanced','You speak with precision. Polish accent, idioms and executive presence.']:pct>=75?['B2 · Upper-intermediate','You communicate well. Focus on fluency under pressure — interviews and meetings.']:pct>=50?['B1 · Intermediate','You get by in most situations. Daily speaking practice will unlock real fluency.']:['A2 · Elementary','You know the basics. A structured course with a coach will move you fastest.'];store('vt-level',lv[0]+' ('+right+'/'+Q.length+')');quiz.hidden=true;var r=$('#qResult');r.hidden=false;$('#rLevel').textContent=lv[0];$('#rScore').textContent=right+' / '+Q.length;$('#rNote').textContent=lv[1];$('#rBar').style.width=pct+'%'}
  $('#qStart').addEventListener('click',function(){$('#qIntro').hidden=true;quiz.hidden=false;showQ()});
  var rt=$('#qRetry');if(rt)rt.addEventListener('click',function(){qi=0;right=0;$('#qResult').hidden=true;quiz.hidden=false;showQ()});
}

/* ---------- Tell-me-about-yourself builder ---------- */
var tm=$('#tmayForm');
if(tm){tm.addEventListener('input',build);function build(){var v=function(n){return (tm.elements[n].value||'').trim()};var out='I\'m '+(v('name')||'[name]')+', '+(v('role')||'[current role or degree]')+'. '+(v('years')?'Over the last '+v('years')+', ':'Recently, ')+'I\'ve '+(v('win')||'[one result you are proud of — with a number]')+'. '+'My strengths are '+(v('skills')||'[two skills that match the job]')+'. '+'I\'m excited about this role because '+(v('why')||'[one reason tied to the company]')+', and I\'d like to bring that experience to your team.';$('#tmayOut').textContent=out;var w=norm(out).length;$('#tmayMeta').textContent=w+' words · about '+Math.round(w/140*60)+' seconds spoken'}build();
  $('#tmaySay').addEventListener('click',function(){say($('#tmayOut').textContent,'en-IN')});
  $('#tmayCopy').addEventListener('click',function(){try{navigator.clipboard.writeText($('#tmayOut').textContent);this.textContent='Copied ✓'}catch(e){}});}

/* ---------- GD topic generator ---------- */
var gd=$('#gdBtn');
if(gd){var GD=["AI will create more jobs than it destroys.","Should voting be compulsory in India?","Work from home vs work from office.","Is a college degree still necessary?","Electric vehicles: ready for mass adoption in India?","Social media does more harm than good to democracy.","Cashless economy: boon or bane?","Should startups prioritise profit over growth?","Reservation in private-sector jobs.","Is India ready for a four-day work week?","Online education can replace classrooms.","Brain drain or brain gain?","Should Hindi be compulsory in all schools?","Is gig work the future of employment?","Sports deserve as much funding as academics.","Climate change: individual vs government responsibility.","Are entrance exams a fair measure of talent?","Should tech companies be taxed more?","Influencer marketing is misleading consumers.","Is privacy dead in the digital age?"];
  gd.addEventListener('click',function(){var t=GD[Math.floor(Math.random()*GD.length)];$('#gdTopic').textContent=t;$('#gdFor').textContent='Open with a definition, give one data point and one Indian example, then invite the next speaker.'});}

/* ---------- Contest countdown (last Sunday of month, 18:00 IST) ---------- */
var cd=$('#countdown');
if(cd){
  function lastSunday(){var now=new Date();for(var k=0;k<3;k++){var d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+k+1,0,12,30,0));while(d.getUTCDay()!==0)d.setUTCDate(d.getUTCDate()-1);if(d>now)return d}}
  var target=lastSunday();var dl=$('#countDate');if(dl)dl.textContent=target.toLocaleString(undefined,{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
  (function tick(){var ms=Math.max(0,target-new Date());var u=[Math.floor(ms/864e5),Math.floor(ms%864e5/36e5),Math.floor(ms%36e5/6e4),Math.floor(ms%6e4/1e3)];$$('b',cd).forEach(function(b,i){b.textContent=(u[i]<10?'0':'')+u[i]});setTimeout(tick,1000)})();
}
var ct=$('#challengeTopic');if(ct){var m=new Date().getMonth();ct.textContent=TOPICS[m%TOPICS.length]}

/* ---------- Guide filter ---------- */
var gs=$('#guideSearch');
if(gs)gs.addEventListener('input',function(){var q=gs.value.toLowerCase();$$('[data-guide]').forEach(function(c){c.style.display=c.textContent.toLowerCase().indexOf(q)>-1?'':'none'})});
})();
