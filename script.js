// — Colores y definición de las cuerdas —
const COLORS = { G:'#d500f9', D:'#2196f3', A:'#4caf50', E:'#ffeb3b' };
const STRINGS = {
  G:['G#3/Ab3','A3','A#3/Bb3','B3','C4','C#4/Db4','D4'],
  D:['D#4/Eb4','E4','F4','F#4/Gb4','G4','G#4/Ab4','A4'],
  A:['A#4/Bb4','B4','C5','C#5/Db5','D5','D#5/Eb5','E5'],
  E:['F5','F#5/Gb5','G5','G#5/Ab5','A5','A#5/Bb5','B5']
};

// Mapa a nombres latinos sin octava
const TRANSLATE = {
  'C':'Do','C#':'Do#','Db':'Reb',
  'D':'Re','D#':'Re#','Eb':'Mib',
  'E':'Mi',
  'F':'Fa','F#':'Fa#','Gb':'Solb',
  'G':'Sol','G#':'Sol#','Ab':'Lab',
  'A':'La','A#':'La#','Bb':'Sib',
  'B':'Si'
};

// 1) Dibuja el rectángulo del mástil, ancho ampliado para cuerda MI
const svg = document.getElementById('fingerboard');
svg.innerHTML = `
  <rect x="100" y="60" width="320" height="480" rx="20" ry="20" fill="#333"/>
`;

const X_POS     = { G:140, D:220, A:300, E:380 };
const yOpen     = 80, yStart = 140, yStep = 55;
const fingerMap = [1,1,2,2,3,3,4];
// Guías en la fila 2 (índice 1) y 5 (índice 4)
const guideRows = [1,4];

// 2) Números de dedo y líneas guía
['0', ...fingerMap].forEach((num,i)=>{
  const y = i===0 ? yOpen : yStart + (i-1)*yStep;
  svg.insertAdjacentHTML('beforeend',
    `<text x="90" y="${y}" class="finger-num">${num}</text>`);
  if (guideRows.includes(i-1)) {
    svg.insertAdjacentHTML('beforeend',
      `<rect x="420" y="${y-3}" width="10" height="6" class="guide"/>`);
  }
});

// 3) Dibuja cuerdas, open-string y notas
Object.entries(STRINGS).forEach(([s,arr])=>{
  const x = X_POS[s];
  // cuerda
  svg.insertAdjacentHTML('beforeend',
    `<line x1="${x}" y1="80" x2="${x}" y2="520"
           class="string" stroke="${COLORS[s]}" data-str="${s}"/>`);
  // cuerda al aire
  svg.insertAdjacentHTML('beforeend', `
    <g class="open-group" data-open="${s}">
      <circle
        cx="${x}"
        cy="${yOpen}"
        r="26"
        class="open-circle"
        stroke="${COLORS[s]}"
      ></circle>
      <text x="${x}" y="${yOpen}" class="open-label">${
        {G:'SOL',D:'RE',A:'LA',E:'MI'}[s]
      }</text>
    </g>
  `);

  // notas primera posición con centrado vertical dinámico
  arr.forEach((raw,i)=>{
    const y     = yStart + i*yStep;
    const parts = raw.split('/');

    // número de líneas y desplazamiento inicial
    const lineCount = parts.length;
    const initialDy = lineCount > 1
      ? `-${(lineCount - 1) * 0.5}em`
      : '0em';

    // crea ts
    const ts = parts.map((p,j)=>`
      <tspan x="${x}" dy="${ j === 0 ? initialDy : '1em' }">
        ${TRANSLATE[p.replace(/\d+$/,'')]}
      </tspan>
    `).join('');

    svg.insertAdjacentHTML('beforeend', `
      <circle cx="${x}" cy="${y}" class="note" r="22"
              fill="${COLORS[s]}" data-note="${parts[0]}"/>
      <text x="${x}" y="${y}" class="label ${s==='E'?'label-e':''}">
        ${ts}
      </text>
    `);
  });
});

// 4) Sonido con AudioContext
const SEMI = {
  C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,
  G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11,'B':11
};
const ctx  = new (window.AudioContext||window.webkitAudioContext)();
const OPEN_NOTE = { G:'G3', D:'D4', A:'A4', E:'E5' };
function freq(n){
  const [,nt,oct] = n.match(/^([A-G][#b]?)(\d)$/);
  const midi = (Number(oct)+1)*12 + SEMI[nt];
  return 440 * 2**((midi-69)/12);
}
function play(n){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type='sawtooth'; o.frequency.value=freq(n);
  g.gain.setValueAtTime(0.25,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+1.5);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime+1.5);
}

// 5) Interacción de clicks
svg.addEventListener('click', e=>{
  if (e.target.closest('.note')) {
    play(e.target.closest('.note').dataset.note);
  } else if (e.target.closest('.open-group')) {
    play(OPEN_NOTE[e.target.closest('.open-group').dataset.open]);
  } else if (e.target.closest('.string')) {
    play(OPEN_NOTE[e.target.closest('.string').dataset.str]);
  }
});