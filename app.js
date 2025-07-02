const COLORS={G:"#d500f9",D:"#2196f3",A:"#4caf50",E:"#ffeb3b"};
const STRINGS={G:["G#3/Ab3","A3","A#3/Bb3","B3","C4","C#4/Db4","D4"],D:["D#4/Eb4","E4","F4","F#4/Gb4","G4","G#4/Ab4","A4"],A:["A#4/Bb4","B4","C5","C#5/Db5","D5","D#5/Eb5","E5"],E:["F5","F#5/Gb5","G5","G#5/Ab5","A5","A#5/Bb5","B5"]};
const X_POS={G:80,D:160,A:240,E:320};
const LATIN={C:"Do",D:"Re",E:"Mi",F:"Fa",G:"Sol",A:"La",B:"Si"};
function toLatin(n){const[,ltr,acc]=n.match(/^([A-G])([#b]?)/);return LATIN[ltr]+(acc||"");}
const svg=document.getElementById("fingerboard");
svg.insertAdjacentHTML("beforeend",'<rect x="40" y="60" width="320" height="480" rx="20" ry="20" fill="#333"/>');
const yOpen=80,yStart=140,yStep=55;
Object.entries(STRINGS).forEach(([s,arr])=>{
 const x=X_POS[s];
 svg.insertAdjacentHTML("beforeend",`<line x1="${x}" y1="80" x2="${x}" y2="520" class="string" stroke="${COLORS[s]}" data-str="${s}"></line>`);
 svg.insertAdjacentHTML("beforeend",`<g class="open-group" data-open="${s}"><circle cx="${x}" cy="${yOpen}" class="open-circle" stroke="${COLORS[s]}"></circle><text x="${x}" y="${yOpen}" class="open-label">${{G:"SOL",D:"RE",A:"LA",E:"MI"}[s]}</text></g>`);
 arr.forEach((raw,i)=>{const y=yStart+i*yStep;const [n1,n2]=raw.includes('/')?raw.split('/'):[raw];const tspan=n2?`<tspan x="${x}" dy="-4">${toLatin(n1)}</tspan><tspan x="${x}" dy="8">${toLatin(n2)}</tspan>`:toLatin(n1);svg.insertAdjacentHTML("beforeend",`<circle cx="${x}" cy="${y}" class="note" fill="${COLORS[s]}" data-note="${n1}"></circle><text x="${x}" y="${y}" class="label ${s==='E'?'label-e':''}">${tspan}</text>`);});
});
const SEMI={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11};
const ctx=new (window.AudioContext||window.webkitAudioContext)();
const OPEN_NOTE={G:"G3",D:"D4",A:"A4",E:"E5"};
function freq(n){const[,note,oct]=n.match(/^([A-G][#b]?)(\d)$/);return 440*Math.pow(2,(((+oct)+1)*12+SEMI[note]-69)/12);}
function play(n){const o=ctx.createOscillator(),g=ctx.createGain();o.type="sawtooth";o.frequency.value=freq(n);g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+1.5);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+1.5);}
svg.addEventListener("click",e=>{const circ=e.target.closest('.note');if(circ){play(circ.dataset.note);return;}const grp=e.target.closest('.open-group');if(grp){play(OPEN_NOTE[grp.dataset.open]);return;}const str=e.target.closest('.string');if(str){play(OPEN_NOTE[str.dataset.str]);}});
