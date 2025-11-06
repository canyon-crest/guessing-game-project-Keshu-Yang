//time
const date = document.getElementById("date");
function updateClock(){
    date.textContent = time();
}

// === Ultra-fun extras (non-invasive) ===
(function ultraFun(){
    const MSG_ID = 'msg';
    const msgEl = document.getElementById(MSG_ID);
    if(!msgEl) return;

    // inject styles
    const css = `
    .uf-balloon{ position:fixed; bottom:-80px; pointer-events:none; z-index:10020; width:48px; height:64px; display:flex; align-items:flex-end; justify-content:center; font-size:32px; transform-origin:center bottom; }
    .uf-badge{ position:fixed; left:50%; top:16%; transform:translateX(-50%) translateY(-10px) scale(0.94); background:#ffffff; padding:12px 16px; border-radius:10px; box-shadow:0 18px 56px rgba(0,0,0,0.36); z-index:10095; font-weight:800; font-size:18px; color:#111; opacity:0; transition:transform 280ms cubic-bezier(.2,.9,.2,1), opacity 280ms }
    .uf-badge.show{ transform:translateX(-50%) translateY(0) scale(1.02); opacity:1 }
    /* centered fastest-time badge that appears near the modal */
    .uf-fastest-modal{ position:fixed; left:50%; top:34%; transform:translate(-50%,-50%) scale(0.98); background:#ffffff; padding:12px 16px; border-radius:10px; box-shadow:0 14px 46px rgba(0,0,0,0.38); z-index:10090; font-weight:800; font-size:18px; color:#111; opacity:0; transition:opacity 220ms ease, transform 220ms ease; pointer-events:none }
    .uf-fastest-modal.show{ opacity:1; transform:translate(-50%,-50%) scale(1) }
    /* place overlay near the top so it doesn't overlap center modals */
        .uf-overlay{ position:fixed; inset:0; display:flex; align-items:flex-start; justify-content:center; padding-top:6vh; z-index:10000; pointer-events:none }
        .uf-text{ font-size:84px; line-height:1; font-weight:900; color:#fff; text-shadow:0 16px 56px rgba(0,0,0,0.75); transform:scale(0.9); opacity:0; transition:transform 360ms cubic-bezier(.2,.9,.2,1), opacity 360ms; padding:10px 18px; border-radius:12px; background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); backdrop-filter: blur(6px); }
        @keyframes uf-pulse { 0%{ transform: scale(0.96); filter: drop-shadow(0 8px 24px rgba(255,220,80,0.12)) } 50%{ transform: scale(1.03); filter: drop-shadow(0 20px 44px rgba(255,220,80,0.22)) } 100%{ transform: scale(0.98); filter: drop-shadow(0 8px 24px rgba(255,220,80,0.12)) } }
        .uf-text.show{ animation: uf-pulse 1200ms ease-in-out 1, uf-fade 360ms ease forwards; }
        @keyframes uf-fade { from{ opacity:0 } to{ opacity:1 } }
    .uf-text.show{ transform:scale(1); opacity:1 }
    .uf-spark{ position:fixed; width:8px; height:8px; border-radius:50%; z-index:10025; pointer-events:none }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    // small helpers
    function rand(a,b){ return a + Math.random()*(b-a); }

    // balloons
    function spawnBalloons(n=6){
        for(let i=0;i<n;i++){
            const b = document.createElement('div'); b.className='uf-balloon'; b.textContent = ['🎈','🎈','🎈','🎈','🎈'][Math.floor(Math.random()*5)];
            const left = Math.random()*80 + 5; b.style.left = left + 'vw'; b.style.fontSize = (28 + Math.random()*28) + 'px';
            document.body.appendChild(b);
            // animate up
            const dur = 3500 + Math.random()*1800;
            b.animate([{ transform:'translateY(0) scale(1)' }, { transform:`translateY(-${window.innerHeight + 120}px) scale(0.9)` }], { duration: dur, easing:'cubic-bezier(.2,.8,.2,1)' });
            setTimeout(()=> b.remove(), dur + 80);
        }
    }

    // badge popup: first-win and fastest
    function showBadge(text){
        // make the small badge identical in style to the fastest-time popup
        let el = document.getElementById('uf-badge');
        if(!el){ el = document.createElement('div'); el.id='uf-badge'; /* reuse fastest modal style */ el.className='uf-fastest-modal'; document.body.appendChild(el); }
        el.textContent = text;
        // ensure it animates the same way
        // position the small badge higher so it doesn't overlap the centered fastest popup
        try{ el.style.top = '26%'; el.style.zIndex = '10100'; }catch(e){}
        requestAnimationFrame(()=> el.classList.add('show'));
        // keep visible a bit longer (match fastest popup timing)
        setTimeout(()=> el.classList.remove('show'), 3400);
        // remove element after animation completes to avoid DOM clutter
        setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 3800);
    }

    // show a centered fastest-time badge near the stats modal
    function showFastestBadge(sec){
        // Prefer the stored fastest time (the same value shown in the "fastest" textbox)
        const FAST_KEY = 'guess_fastest_seconds';
        const stored = localStorage.getItem(FAST_KEY);
        let displayVal = null;
        if(stored !== null){
            const n = Number(stored);
            if(!Number.isNaN(n)) displayVal = n;
        }
        // fallback to passed-in sec if no stored fastest
        if(displayVal === null && typeof sec === 'number' && !Number.isNaN(sec) && sec > 0) displayVal = Number(sec);

        let el = document.getElementById('uf-fastest-modal');
        if(!el){ el = document.createElement('div'); el.id = 'uf-fastest-modal'; el.className = 'uf-fastest-modal'; document.body.appendChild(el); }
        if(displayVal === null) el.textContent = 'Fastest Time: N/A';
        else el.textContent = `Fastest Time: ${displayVal.toFixed(2)}s`;
        // animate in
        requestAnimationFrame(()=> el.classList.add('show'));
        // keep visible a while
        setTimeout(()=> el.classList.remove('show'), 3400);
        // remove element after animation completes to avoid clutter
        setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 3800);
    }
    // expose for other modules to call the numeric fastest popup every win
    try{ window.showFastestBadge = showFastestBadge; }catch(e){}

    // overlay big text
    function showOverlay(text){
        let wrap = document.getElementById('uf-overlay');
        if(!wrap){ wrap = document.createElement('div'); wrap.id='uf-overlay'; wrap.className='uf-overlay'; document.body.appendChild(wrap); }
        wrap.innerHTML = `<div class="uf-text" id="uf-text">${text}</div>`;
        const t = document.getElementById('uf-text');
        // ensure it's visible and more prominent for longer
        requestAnimationFrame(()=> t.classList.add('show'));
        // keep visible a bit longer so users notice it
        setTimeout(()=> t.classList.remove('show'), 3200);
    }

    // floating sparks that follow a random path
    function spawnSparks(count=18){
        for(let i=0;i<count;i++){
            const sp = document.createElement('div'); sp.className='uf-spark'; sp.style.background = `hsl(${Math.floor(rand(30,320))}deg 90% 60%)`;
            sp.style.left = rand(20,80) + 'vw'; sp.style.top = rand(10,70) + 'vh';
            document.body.appendChild(sp);
            const dx = rand(-200,200); const dy = rand(-300,-80); const dur = 1000 + Math.random()*900;
            sp.animate([{ transform:'translate(0,0) scale(1)', opacity:1 }, { transform:`translate(${dx}px,${dy}px) scale(0.3)`, opacity:0 }], { duration: dur, easing:'cubic-bezier(.2,.9,.2,1)' });
            setTimeout(()=> sp.remove(), dur + 60);
        }
    }

    // click burst effect: spawns a colorful burst of particles on clicks (temporary)
    function enableClickBurst(duration=6000){
        function onClick(e){
            const count = 10 + Math.floor(Math.random()*8);
            for(let i=0;i<count;i++){
                const p = document.createElement('div'); p.className='uf-spark';
                const size = 6 + Math.random()*14;
                p.style.width = size + 'px'; p.style.height = size + 'px';
                p.style.left = (e.clientX - size/2 + (Math.random()*24-12)) + 'px';
                p.style.top = (e.clientY - size/2 + (Math.random()*24-12)) + 'px';
                p.style.background = `hsl(${Math.floor(rand(0,360))}deg 85% 60%)`;
                document.body.appendChild(p);
                const dx = (Math.random()*2-1) * (80 + Math.random()*160);
                const dy = -40 - Math.random()*220;
                const dur = 700 + Math.random()*700;
                p.animate([{ transform:'translate(0,0) scale(1)', opacity:1 }, { transform:`translate(${dx}px,${dy}px) scale(0.2)`, opacity:0 }], { duration: dur, easing: 'cubic-bezier(.2,.9,.2,1)' });
                setTimeout(()=> p.remove(), dur + 60);
            }
        }
        window.addEventListener('click', onClick);
        setTimeout(()=> window.removeEventListener('click', onClick), duration);
    }

    // animated score counter (briefly animate wins count)
    function animateWins(){
        const el = document.getElementById('wins'); if(!el) return;
        const orig = el.textContent || '';
        const match = orig.match(/(\d+)/); if(!match) return;
        const current = Number(match[1]);
        // flash count up to current+1 then back
        const target = current;
        let shown = 0; const step = Math.max(1, Math.floor(target/10));
        const iv = setInterval(()=>{ shown += step; if(shown >= target){ el.textContent = `Total wins: ${target}`; clearInterval(iv); } else el.textContent = `Total wins: ${shown}`; }, 60);
    }

    // hue flash (soft color shift)
    function flashHue(){
        const el = document.documentElement; el.style.transition = 'filter 900ms ease'; el.style.filter = 'hue-rotate(30deg) saturate(1.15)'; setTimeout(()=> el.style.filter = '', 900);
    }

    // badge logic using localStorage
    function badgeLogic(timeSec){
        const key = 'uf_badges_v1';
        const badges = JSON.parse(localStorage.getItem(key) || '{}');
        // first win
        if(!badges.firstWin){ badges.firstWin = true; showBadge('Badge: First Win! 🏆'); }
        // fastest: update badge only when strictly faster than previous (ties do not count as "created fastest")
        const prevFast = (typeof badges.fastest === 'number') ? badges.fastest : null;
        if(prevFast === null || timeSec < prevFast){
            badges.fastest = timeSec;
            try{ showBadge('Badge: Fastest Time! ⚡'); }catch(e){}
        }
        localStorage.setItem(key, JSON.stringify(badges));
    }

    // main trigger on correct
    let last = '';
    const mo = new MutationObserver(()=>{
        const text = (msgEl.textContent||'').trim();
        if(text && text.includes('Correct!') && text !== last){
            last = text;
            // try to read timer
            const tEl = document.getElementById('myTimer'); const t = tEl ? Number((tEl.textContent||'').trim()) : null;
            // burst of fun
            spawnBalloons(8);
            showOverlay('You did it!');
            enableClickBurst(7000);
            animateWins();
            flashHue();
            if(t) badgeLogic(t);
            // staggered extras
            setTimeout(()=> spawnBalloons(6), 400);
            
        }
    });
    mo.observe(msgEl, { childList:true, subtree:true, characterData:true });

})();

// initialize and update every second so seconds are shown
updateClock();
setInterval(updateClock, 1000);

// normalize name input: capitalize first letter, lowercase the rest
const myInput = document.getElementById('myInput');
function normalizeNameInput(){
    if(!myInput) return;
    const raw = String(myInput.value || '').trim();
    if(!raw) { myInput.value = ''; return; }
    const name = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    myInput.value = name;
}
if(myInput){
    // normalize on blur so the UI shows the cleaned name
    myInput.addEventListener('blur', normalizeNameInput);
}

//global variables
let score, answer, level;
const levelArr=document.getElementsByName("level");
const scoreArr=[];
let start = new Date().getTime();
let timer;
let timeTaken;
let shortest=0;
let times=[];
let timeAvg=0;

function useTimer(){
    let stop = new Date().getTime();
    let time = (stop - start)/1000;
    document.getElementById("myTimer").innerHTML = time.toFixed(2);
    timeTaken=time.toFixed(2);
}

// === Enhancements (non-invasive, does not change existing functions) ===
(function enh(){
    // small helper names to avoid colliding with existing variables
    const MSG_ID = 'msg';
    const TIMER_ID = 'myTimer';
    const FAST_KEY = 'guess_fastest_seconds';

    const msgEl = document.getElementById(MSG_ID);
    const timerEl = document.getElementById(TIMER_ID);

    if(!msgEl) return; // nothing to wire

    // Inject lightweight CSS for falling emoji animation
    const css = `
    .enh-confetti { position:fixed; pointer-events:none; top:0; left:0; width:100%; height:0; overflow:visible; z-index:9999 }
    .enh-piece { position:fixed; font-size:20px; opacity:0.95; transform:translateY(-10vh); animation:enh-fall 2200ms linear forwards; }
    @keyframes enh-fall { to { transform: translateY(110vh) rotate(360deg); opacity:0.95 } }
    .enh-toast { position:fixed; right:20px; top:20px; background:rgba(0,0,0,0.8); color:#fff; padding:8px 12px; border-radius:6px; font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial; z-index:10000 }
    .enh-msg-glow { box-shadow:0 0 12px rgba(255,215,0,0.9); transition:box-shadow 300ms ease }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    // beep using WebAudio (no external file)
    function playBeep(){
        try{
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const now = ac.currentTime;
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = 'sine'; o.frequency.value = 880;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            o.connect(g); g.connect(ac.destination);
            o.start(now);
            o.stop(now + 0.3);
            setTimeout(()=>{ try{ ac.close(); }catch(e){} }, 400);
        }catch(e){ /* silently ignore on very old browsers */ }
    }

    // simple confetti: emoji falling
    const EMOJIS = ['🎉','✨','🎈','🥳','🍾','🎊'];
    function dropConfetti(count = 28){
        const container = document.createElement('div');
        container.className = 'enh-confetti';
        document.body.appendChild(container);
        for(let i=0;i<count;i++){
            const span = document.createElement('span');
            span.className = 'enh-piece';
            span.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
            const left = Math.random()*100; // vw
            const delay = Math.random()*240; // ms
            span.style.left = left + 'vw';
            span.style.top = (-10 - Math.random()*10) + 'vh';
            span.style.fontSize = (12 + Math.random()*28) + 'px';
            span.style.animationDelay = delay + 'ms';
            span.style.transform = `translateY(-10vh) rotate(${Math.random()*360}deg)`;
            container.appendChild(span);
        }
        // remove after animation
        setTimeout(()=> container.remove(), 3200);
    }

    // toast helper
    function showToast(text, timeout = 2000){
        const t = document.createElement('div');
        t.className = 'enh-toast';
        t.textContent = text;
        document.body.appendChild(t);
        setTimeout(()=> t.style.opacity = '0', timeout - 300);
        setTimeout(()=> t.remove(), timeout);
    }

    // fastest time persistence
    function getStoredFastest(){
        const v = localStorage.getItem(FAST_KEY);
        return v ? Number(v) : null;
    }
    function setStoredFastest(sec){
        localStorage.setItem(FAST_KEY, String(sec));
    }

    // update on-screen shortest indicator if your page has one (`shTime`) else create small indicator
    function updateFastestDisplay(sec){
        const label = document.getElementById('shTime');
        const text = `Fastest: ${sec.toFixed(2)}s`;
        if(label) label.textContent = text;
        else {
            let el = document.getElementById('enh-fastest');
            if(!el){ el = document.createElement('div'); el.id = 'enh-fastest'; el.style.position='fixed'; el.style.left='20px'; el.style.top='20px'; el.style.background='rgba(0,0,0,0.6)'; el.style.color='#fff'; el.style.padding='6px 10px'; el.style.borderRadius='6px'; el.style.zIndex='10000'; document.body.appendChild(el); }
            el.textContent = text;
        }
    }

    // celebration triggered when msg contains "Correct!"
    let lastHandled = '';
    const obs = new MutationObserver(()=>{
        const text = (msgEl.textContent || '').trim();
        if(text && text.includes('Correct!') && text !== lastHandled){
            lastHandled = text;
            // read timer if available
            const timeText = timerEl ? timerEl.textContent.trim() : null;
            const timeNum = timeText ? Number(timeText) : NaN;
            // play and show confetti
            playBeep();
            dropConfetti(32);
            if(!Number.isNaN(timeNum)){
                showToast(`You finished in ${timeNum.toFixed(2)}s` , 2400);
                // persist fastest
                const currentFast = getStoredFastest();
                if(currentFast === null || timeNum < currentFast){
                    setStoredFastest(timeNum);
                    updateFastestDisplay(timeNum);
                    showToast('New fastest time! ⭐', 1800);
                } else {
                    updateFastestDisplay(currentFast);
                }
            } else {
                showToast('Nice! 🎉', 1500);
            }
            // subtle glow on msg element
            msgEl.classList.add('enh-msg-glow');
            setTimeout(()=> msgEl.classList.remove('enh-msg-glow'), 1300);
        }
    });
    obs.observe(msgEl, { childList:true, subtree:true, characterData:true });

    // initialize fastest display from storage on load
    const stored = getStoredFastest();
    if(stored !== null) updateFastestDisplay(stored);

    // small keyboard shortcut to clear fastest: Shift+F
    window.addEventListener('keydown', (e)=>{
        if(e.shiftKey && (e.key === 'F' || e.key === 'f')){
            localStorage.removeItem(FAST_KEY);
            const el = document.getElementById('enh-fastest'); if(el) el.textContent = 'Fastest: N/A';
            showToast('Fastest time cleared', 1200);
        }
    });

})();

// === Super-crazy extras (non-invasive) ===
(function superCrazy(){
    const MSG_ID = 'msg';
    const CANVAS_ID = 'enh-canvas-fw'; // reuses canvas if present
    const LB_NAME = 'leaderboard';
    const key = 'enh_supercrazy_done';

    const msgEl = document.getElementById(MSG_ID);
    if(!msgEl) return;

    // add styles
    const css = `
    .sc-shake{ animation:sc-shake 600ms cubic-bezier(.36,.07,.19,.97); }
    @keyframes sc-shake{ 10%,90%{ transform:translate3d(-1px,0,0)} 20%,80%{ transform:translate3d(2px,0,0)} 30%,50%,70%{ transform:translate3d(-4px,0,0)} 40%,60%{ transform:translate3d(4px,0,0)} }
    .sc-rainbow{ animation:sc-rainbow 1100ms linear; }
    @keyframes sc-rainbow{ 0%{background:linear-gradient(90deg,#fff,#fff)} 25%{background:linear-gradient(90deg,#ff5f6d,#ffc371)} 50%{background:linear-gradient(90deg,#7bffb2,#6fe7ff)} 75%{background:linear-gradient(90deg,#d6b3ff,#ff9ec4)} 100%{background:linear-gradient(90deg,#fff,#fff)} }
    .sc-star { position:fixed; z-index:10003; pointer-events:none; font-size:18px; transform:translateY(-10vh); opacity:0.95; animation:sc-star-fall 1600ms linear forwards; }
    @keyframes sc-star-fall { to { transform: translateY(110vh) rotate(720deg); opacity:0.95 } }
    .sc-pulse{ animation:sc-pulse 900ms ease-in-out; }
    @keyframes sc-pulse{ 0%{transform:scale(1)}50%{transform:scale(1.18)}100%{transform:scale(1)} }
    `;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    // louder orchestra + noise
    function bigBoom(){
        try{
            const AC = window.AudioContext || window.webkitAudioContext;
            const ac = new AC();
            // chord
            const now = ac.currentTime;
            const g = ac.createGain(); g.connect(ac.destination);
            // gentle envelope
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(0.045, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            [220, 330, 440, 660].forEach((f,i)=>{ const o = ac.createOscillator(); o.type='triangle'; o.frequency.value=f; o.connect(g); o.start(now + i*0.02); o.stop(now + 0.75 + i*0.02); });
            // quick, filtered noise burst
            const bufferSize = Math.floor(ac.sampleRate * 0.18);
            const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
            const data = buffer.getChannelData(0); for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1)*Math.exp(-i/bufferSize*2);
            const src = ac.createBufferSource(); src.buffer = buffer; const ng = ac.createGain(); ng.gain.value = 0.06; const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1800; src.connect(fl); fl.connect(ng); ng.connect(ac.destination); src.start(now + 0.02);
            setTimeout(()=> ac.close(), 1200);
        }catch(e){}
    }

    // star shower
    function starShower(count=20){
        for(let i=0;i<count;i++){
            const s = document.createElement('div'); s.className='sc-star'; s.textContent = ['⭐','🌟','✨'][Math.floor(Math.random()*3)];
            const left = Math.random()*100; s.style.left = left + 'vw'; s.style.top = (-5 - Math.random()*8) + 'vh'; s.style.fontSize = (12 + Math.random()*36) + 'px'; s.style.animationDelay = (Math.random()*180) + 'ms'; document.body.appendChild(s);
            setTimeout(()=> s.remove(), 1900);
        }
    }

    // pulse leaderboard top 3
    function pulseLeaderboard(){
        const lis = document.getElementsByName(LB_NAME);
        for(let i=0;i<lis.length && i<3;i++){
            const el = lis[i]; el.classList.add('sc-pulse'); setTimeout(()=>el.classList.remove('sc-pulse'), 1000 + i*120);
        }
    }

    // shake screen
    function doShake(){
        document.documentElement.classList.add('sc-shake'); setTimeout(()=> document.documentElement.classList.remove('sc-shake'), 700);
    }

    // flash rainbow background briefly
    function rainbowFlash(){
        const el = document.body; el.classList.add('sc-rainbow'); setTimeout(()=> el.classList.remove('sc-rainbow'), 1100);
    }

    // download fireworks snapshot (if canvas exists)
    function downloadCanvasSnapshot(){
        const c = document.getElementById(CANVAS_ID);
        if(!c) return;
        const url = c.toDataURL('image/png');
        const a = document.createElement('a'); a.href = url; a.download = `guess_snapshot_${Date.now()}.png`; document.body.appendChild(a); a.click(); a.remove();
    }

    // listen for Correct!
    let last = '';
    const mo = new MutationObserver(()=>{
        const text = (msgEl.textContent||'').trim();
        if(text && text.includes('Correct!') && text !== last){
            last = text;
            // do the crazy things
            bigBoom();
            starShower(36);
            doShake();
            rainbowFlash();
            pulseLeaderboard();
            // add temporary UI to download snapshot
            const dl = document.createElement('button'); dl.textContent='Download snapshot'; dl.style.position='fixed'; dl.style.right='20px'; dl.style.bottom='20px'; dl.style.zIndex='10005'; dl.onclick = ()=> downloadCanvasSnapshot(); document.body.appendChild(dl);
            setTimeout(()=> dl.remove(), 6000);
        }
    });
    mo.observe(msgEl, { childList:true, subtree:true, characterData:true });

})();

// === Super celebration: canvas fireworks, chord, modal stats, share ===
(function superEnh(){
    const MSG_ID = 'msg';
    const TIMER_ID = 'myTimer';
    const MODAL_ID = 'enh-modal-2';
    const CANVAS_ID = 'enh-canvas-fw';

    const msgEl = document.getElementById(MSG_ID);
    const timerEl = document.getElementById(TIMER_ID);
    if(!msgEl) return;

    // inject styles
    const css = `
    /* backdrop that will block interaction when modal is open (kept below badges) */
    .enh-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:10000; pointer-events:auto }

    #${CANVAS_ID} { position: fixed; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index:10001 }
    #${MODAL_ID} { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%) scale(0.95); background:linear-gradient(180deg,#fff,#f8f8ff); padding:18px 20px; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.35); z-index:10003; font-family:system-ui,Segoe UI,Roboto,Arial; min-width:260px; opacity:0; transition:opacity 220ms ease, transform 220ms ease }
    #${MODAL_ID}.open{ opacity:1; transform:translate(-50%,-50%) scale(1) }
    #${MODAL_ID} .row{ margin:8px 0 }
    #${MODAL_ID} button{ margin-left:8px }
    .enh-timer-sparkle{ animation:enh-sparkle 900ms ease-in-out 2; }
    @keyframes enh-sparkle { 0%{filter:drop-shadow(0 0 0 rgba(255,255,200,0))}50%{filter:drop-shadow(0 0 14px rgba(255,220,80,0.95))}100%{filter:drop-shadow(0 0 0 rgba(255,255,200,0))} }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    // create canvas
    const canvas = document.createElement('canvas'); canvas.id = CANVAS_ID; document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
    addEventListener('resize', resize); resize();

    // particles
    function firework(x,y){
        const particles = [];
        const colors = ['#ff5f6d','#ffc371','#7bffb2','#6fe7ff','#d6b3ff'];
        const n = 120;
        for(let i=0;i<n;i++){
            const a = Math.random()*Math.PI*2;
            const v = 1.8 + Math.random()*4.5;
            particles.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 60 + Math.random()*80, c: colors[Math.floor(Math.random()*colors.length)] });
        }
        return particles;
    }

    let active = [];
    let animId = null;
    function step(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let i=active.length-1;i>=0;i--){
            const p = active[i];
            p.life--; p.vy += 0.06; p.x += p.vx; p.y += p.vy; p.vx *= 0.995; p.vy *= 0.995;
            ctx.beginPath(); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, p.life/140); ctx.arc(p.x,p.y, Math.max(1, (p.life/40)), 0, Math.PI*2); ctx.fill();
            if(p.life<=0) active.splice(i,1);
        }
        if(active.length>0) animId = requestAnimationFrame(step); else { cancelAnimationFrame(animId); animId = null; }
    }

    // chord
    function playChord(){
        try{
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const freqs = [440, 660, 880];
            const now = ac.currentTime;
            const gain = ac.createGain(); gain.connect(ac.destination);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
            freqs.forEach((f,i)=>{ const o = ac.createOscillator(); o.type='triangle'; o.frequency.value = f; o.connect(gain); o.start(now + i*0.02); o.stop(now + 0.7 + i*0.02); });
            setTimeout(()=>ac.close(), 1000);
        }catch(e){}
    }

    // modal
    function showModal(timeStr, tries){
        // ensure backdrop exists and blocks interaction
        function createBackdrop(){
            let b = document.getElementById('enh-backdrop');
            if(!b){ b = document.createElement('div'); b.id = 'enh-backdrop'; b.className = 'enh-backdrop'; document.body.appendChild(b); }
            // prevent pointer events falling through and prevent scrolling
            document.body.style.overflow = 'hidden';
            return b;
        }
        function removeBackdrop(){
            const b = document.getElementById('enh-backdrop'); if(b) b.remove();
            // restore scrolling
            try{ document.body.style.overflow = ''; }catch(e){}
        }

        let m = document.getElementById(MODAL_ID);
        if(!m){ m = document.createElement('div'); m.id = MODAL_ID; m.innerHTML = `<div class="row"><strong>Congratulations!</strong></div><div class="row">Time: <span id="enh-time">${timeStr}</span></div><div class="row">Tries: <span id="enh-tries">${tries}</span></div><div class="row"><button id="enh-share">Share</button><button id="enh-close">Close</button></div>`; document.body.appendChild(m); }
        // create backdrop and ensure modal sits above it
        createBackdrop();
        document.getElementById('enh-time').textContent = timeStr; document.getElementById('enh-tries').textContent = tries;
        m.classList.add('open');
        // ensure modal z-index is above the backdrop and overlay
        try{ m.style.zIndex = '10003'; }catch(e){}
        document.getElementById('enh-close').onclick = ()=>{ m.classList.remove('open'); removeBackdrop(); };
        document.getElementById('enh-share').onclick = async () =>{
            const text = `I finished the game in ${timeStr} after ${tries} tries!`;
            // try modern clipboard first
            try{
                if(navigator.clipboard && navigator.clipboard.writeText){
                    await navigator.clipboard.writeText(text);
                    showToast('Copied to clipboard!');
                    return;
                }
            }catch(e){ /* fallthrough to fallback */ }
            // fallback: execCommand copy
            try{
                const ta = document.createElement('textarea');
                ta.value = text;
                // place off-screen
                ta.style.position = 'fixed'; ta.style.left = '-9999px'; ta.style.top = '0';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                const ok = document.execCommand('copy');
                ta.remove();
                if(ok) showToast('Copied to clipboard!'); else showToast('Copy failed');
            }catch(e){ showToast('Copy failed'); }
        };
    }

    // small toast reuse from previous module if available
    function showToast(t){ const ev = new CustomEvent('enh-toast', {detail:t}); window.dispatchEvent(ev); }
    // fallback simple toast
    window.addEventListener('enh-toast', (e)=>{ const d = document.createElement('div'); d.className='enh-toast'; d.textContent = e.detail; document.body.appendChild(d); setTimeout(()=> d.remove(),1600); });

    // respond to msg changes
    let last = '';
    const mo = new MutationObserver(()=>{
        const text = (msgEl.textContent||'').trim();
        if(text && text.includes('Correct!') && text !== last){
            last = text;
            // read numeric time from timerEl if present
            const raw = timerEl ? timerEl.textContent.trim() : '';
            const tnum = Number(raw) || 0;
            // spawn multiple fireworks
            for(let i=0;i<3;i++){
                const x = (0.15 + Math.random()*0.7)*canvas.width;
                const y = (0.15 + Math.random()*0.5)*canvas.height;
                active = active.concat(firework(x,y));
            }
            if(!animId) step();
            playChord();
            // sparkle timer
            if(timerEl){ timerEl.classList.add('enh-timer-sparkle'); setTimeout(()=> timerEl.classList.remove('enh-timer-sparkle'), 1300); }
            // parse tries from message if present
            const triesMatch = text.match(/took (\d+) tries/);
            const tries = triesMatch ? triesMatch[1] : '—';
            showModal((tnum>0? tnum.toFixed(2)+'s':'N/A'), tries);
            // always show numeric fastest-time popup (current run time) when user guesses correctly
            try{ if(window && typeof window.showFastestBadge === 'function') window.showFastestBadge(tnum); }catch(e){}
        }
    });
    mo.observe(msgEl, { childList:true, subtree:true, characterData:true });

})();

function stop(){
    clearInterval(timer);
    if(shortest==0){
        shortest=Number(timeTaken);
    }
    if(timeTaken<shortest){
        shortest=Number(timeTaken);
    }
    shTime.textContent="Shortest Time: "+ shortest+"s";
    times.push(Number(timeTaken));
    for(i=0;i<times.length;i++){
        timeAvg+=Number(times[i]);        
    }
    avgTime.textContent="Average Time: "+(timeAvg/times.length).toFixed(2)+"s";
    timeAvg=0;
}
//event listeners
playBtn.addEventListener("click",play);
guessBtn.addEventListener("click",makeGuess);
giveUpBtn.addEventListener("click",giveUp);
function time(){
    let d= new Date();
    //concatenate the date and time
    let str =d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
    let month=d.getMonth();
    function monthText(month){
        if (month+1==1){
            month="January";
        }
        else if(month+1==2){
            month="Febuary";
        }
        else if(month+1==3){
            month="March"
        }
        else if(month+1==4){
            month="April"
        }
        else if(month+1==5){
            month="May"
        }
        else if(month+1==6){
            month="June"
        }
        else if(month+1==7){
            month="July"
        }
        else if(month+1==8){
            month="August"
        }
        else if(month+1==9){
            month="September"
        }
        else if(month+1==10){
            month="October"
        }
        else if(month+1==11){
            month="November"
        }
        else if(month+1==12){
            month="December"
        }
        return month;
    }
    if ((d.getDate()-1)%10==0){
         if(d.getMonth()+1==1){
         str =monthText(d.getMonth())+" "+d.getDate()+"st "+d.getFullYear();
         }
    }
    else if((d.getDate()-2)%10==0){
         str =monthText(d.getMonth())+" "+d.getDate()+"nd "+d.getFullYear();
    }
    else if((d.getDate()-3)%10==0){
         str =monthText(d.getMonth())+" "+d.getDate()+"rd "+d.getFullYear();
    }
    else{
         str =monthText(d.getMonth())+" "+d.getDate()+"th "+d.getFullYear();
    }
    // append time with hours:minutes:seconds (two-digit) so seconds are visible
    const two = (n) => String(n).padStart(2, '0');
    const hh = two(d.getHours());
    const mm = two(d.getMinutes());
    const ss = two(d.getSeconds());
    str = str + " " + hh + ":" + mm + ":" + ss;
    return str;

}
function play(){
    // normalize name so first letter is uppercase and the rest lowercase
    try{ normalizeNameInput(); }catch(e){}
    playBtn.disabled=true;
    guessBtn.disabled=false;
    guess.disabled=false;
    giveUpBtn.disabled=false;
    start = new Date().getTime();
    timer=setInterval(useTimer, 10);
    good.textContent="";


    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled=true;
        if(levelArr[i].checked){
            level=levelArr[i].value;
        }
    }

    answer=Math.floor(Math.random()*level)+1;
    if(!myInput.value){
    msg.textContent="Guess a number 1-"+level;
    }
    else {
        msg.textContent=myInput.value+", Guess a number 1-"+level;
    }
    guess.placeholder=answer;
    score=0;
}
function makeGuess(){
    let userGuess=Number(guess.value);
    
    if(isNaN(userGuess)||userGuess<1||userGuess>level){
        if (!myInput.value){
            msg.textContent="INVALID, guess a number!"}
        else{
            msg.textContent=myInput.value+"! INVALID, guess a number!";
        }
        return;
    }
    score++;
    if (userGuess>answer){
        if(!myInput.value){
            msg.textContent="Too High, guess again!"
            temperature();
        }
        else{
            msg.textContent=myInput.value+"! Too High, guess again!";
            temperature();
        }
    }
    else if(userGuess<answer){
        if (!myInput.value){
            msg.textContent="Too Low, guess again!"
            temperature();
        }
        else{
        msg.textContent=myInput.value+"! Too Low, guess again!";
        temperature();
        }
    }
    else{
        if(!myInput.value){
            msg.textContent="Correct! It took "+score+" tries and "+timeTaken+" seconds. Good Job!";
        }
        else{
            msg.textContent="Correct! It took "+ score+" tries and "+timeTaken+" seconds. Good Job "+myInput.value+"!";}
        reset();
        updateScore();
        stop();
    }
}
function reset(){
    guessBtn.disabled=true;
    guess.value="";
    guess.placeholder="";
    temp.textContent="";
    guess.disabled=true;
    playBtn.disabled=false;
    giveUpBtn.disabled=true;
    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled=false;
    }
}
function giveUp(){
    reset();
scoreArr.push(Number(level));
    wins.textContent="Total wins: "+scoreArr.length;
    let sum=0;
    scoreArr.sort((a, b) => a - b);
    const lb=document.getElementsByName("leaderboard");

    for(let i=0;i<scoreArr.length;i++){
        sum+=scoreArr[i];
        if(i<lb.length){
            lb[i].textContent=scoreArr[i];
        }
    }
    let avg=sum/scoreArr.length;
    avgScore.textContent="Average Score: "+avg.toFixed(2);
    if(!myInput.value){
        msg.textContent="You gave up. The correct answer is "+answer;
    }
    else{
        msg.textContent=myInput.value+", you gave up. The correct answer is "+answer;
    }
    good.textContent="";
    stop();
}
function updateScore(){
    scoreArr.push(score);//adds current score to array of scores
    wins.textContent="Total wins: "+scoreArr.length;
    let sum=0;
    scoreArr.sort((a, b) => a - b);//sorts ascending
    //leaderboard
    const lb=document.getElementsByName("leaderboard");

    for(let i=0;i<scoreArr.length;i++){
        sum+=scoreArr[i];
        if(i<lb.length){
            lb[i].textContent=scoreArr[i];
        }
    }
    let avg=sum/scoreArr.length;
    avgScore.textContent="Average Score: "+avg.toFixed(2);
    if (score<3){
        if (!myInput.value){
            good.textContent="Your score is good"}
        else {
            good.textContent=myInput.value+", your score is good"
        }
    }
    else if(score==3){
        if (!myInput.value){
            good.textContent="Your score is ok"}
        else {
            good.textContent=myInput.value+", your score is ok"
        }
    }
    else{
        if(!myInput.value){
        good.textContent="Your score is bad"
    }
        else {
            good.textContent=myInput.value+", your score is bad"
        }
}}
function temperature(){
    if(Math.abs(Number(guess.value)-answer)<(0.1*level)){
        if (!myInput.value){
            temp.textContent="You are hot";}
        else{
            temp.textContent=myInput.value+", you are hot";
        }
    }
    else if(Math.abs(Number(guess.value)-answer)<0.3*level){
        if(!myInput.value){
            temp.textContent="You are warm";}
        else{
            temp.textContent=myInput.value+", you are warm"
        }
    }
    else{
        if (!myInput.value){
            temp.textContent="You are cold"}
        else {
            temp.textContent=myInput.value+", you are cold"
        }
    }
}

// === Temperature feedback (non-invasive) ===
(function tempEnh(){
    const ID = 'temp';
    const el = document.getElementById(ID);
    if(!el) return;

    // inject small CSS for pulses
    const css = `
    #${ID}.temp-beat{ transition: box-shadow 200ms ease, transform 160ms ease, background 220ms ease; border-radius:6px; padding:2px 6px; }
    #${ID}.temp-pulse-hot{ background: linear-gradient(90deg,#ff6b6b,#ffb86b); color: #200 }
    #${ID}.temp-pulse-warm{ background: linear-gradient(90deg,#ffd36b,#ffe6a6); color:#2b1f00 }
    #${ID}.temp-pulse-cold{ background: linear-gradient(90deg,#6bd0ff,#9fe1ff); color:#00243a }
    #${ID}.temp-beat.active{ box-shadow: 0 10px 30px rgba(0,0,0,0.12); transform: scale(1.03) }
    .temp-emoji-fly{ position:fixed; pointer-events:none; font-size:20px; transform: translateY(-6vh); opacity:0.98; transition: transform 900ms linear, opacity 900ms linear; z-index:10010 }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    // tone helper (smooth envelopes)
    function playTone(freq, dur = 0.22, vol = 0.05){
        try{
            const AC = window.AudioContext || window.webkitAudioContext;
            const ac = new AC();
            const now = ac.currentTime;
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(vol, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            o.connect(g); g.connect(ac.destination);
            o.start(now); o.stop(now + dur + 0.02);
            setTimeout(()=>{ try{ ac.close(); }catch(e){} }, (dur+0.12)*1000);
        }catch(e){}
    }

    function floatEmoji(sym, offsetX = 0, offsetY = 0){
        const r = el.getBoundingClientRect();
        const span = document.createElement('div'); span.className='temp-emoji-fly'; span.textContent = sym;
        // place around/over the temp element center so emojis can appear left, right or above
        const baseLeft = Math.min(window.innerWidth - 40, Math.max(8, r.left + r.width / 2));
        const baseTop = Math.max(8, r.top + r.height / 2);
        span.style.left = (baseLeft + offsetX) + 'px';
        span.style.top = (baseTop + offsetY) + 'px';
        document.body.appendChild(span);
        // animate outward and fade
        const tx = (Math.random() * 40 - 20) + 'px';
        requestAnimationFrame(()=>{ span.style.transform = `translate(${tx}, 18vh)`; span.style.opacity = '0.02'; });
        setTimeout(()=> span.remove(), 1200);
    }

    // richer emoji sets (expanded)
    const HOT_EMOJIS = ['🔥','🥵','🌡️','💥','🌋','🌶️','🥵','🍲','🍣','🍕','🌶️'];
    const WARM_EMOJIS = ['☀️','🌞','🌻','🍑','🥐','🍯','🍓','🍍','🍪','🥞'];
    const COLD_EMOJIS = ['❄️','☃️','🧊','🥶','🌬️','🍧','🧣','🧤','⛄','🫧'];

    function sprayEmojis(list, count){
        // create multiple emojis clustered around the temp element center
        for(let i=0;i<count;i++){
            const sym = list[Math.floor(Math.random()*list.length)];
            // offsets so emojis spread in a circle-ish pattern
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 80; // px
            const offsetX = Math.floor(Math.cos(angle) * radius);
            const offsetY = Math.floor(Math.sin(angle) * (radius * 0.6));
            floatEmoji(sym, offsetX, offsetY);
        }
    }

    // triggers (produce multiple emoji floats simultaneously)
    function triggerHot(){ el.classList.add('temp-pulse-hot','temp-beat','active'); playTone(1100,0.18,0.06); sprayEmojis(HOT_EMOJIS, 8); setTimeout(()=> el.classList.remove('active'), 360); setTimeout(()=> el.classList.remove('temp-pulse-hot'), 900); }
    function triggerWarm(){ el.classList.add('temp-pulse-warm','temp-beat','active'); playTone(650,0.26,0.045); sprayEmojis(WARM_EMOJIS, 8); setTimeout(()=> el.classList.remove('active'), 420); setTimeout(()=> el.classList.remove('temp-pulse-warm'), 900); }
    function triggerCold(){ el.classList.add('temp-pulse-cold','temp-beat','active'); playTone(240,0.28,0.04); sprayEmojis(COLD_EMOJIS, 8); setTimeout(()=> el.classList.remove('active'), 480); setTimeout(()=> el.classList.remove('temp-pulse-cold'), 900); }

    // watch for changes (debounced per-message)
    let last = ''; let tLast = 0;
    const mo = new MutationObserver(()=>{
        const txt = (el.textContent || '').toLowerCase();
        if(!txt) return; const now = Date.now();
        if(txt === last && now - tLast < 600) return; last = txt; tLast = now;
        if(txt.includes('hot')) triggerHot();
        else if(txt.includes('warm')) triggerWarm();
        else if(txt.includes('cold')) triggerCold();
    });
    mo.observe(el, { childList:true, subtree:true, characterData:true });

})();
