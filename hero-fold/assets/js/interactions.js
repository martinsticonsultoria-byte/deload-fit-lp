/* deLoad.fit — hero fold interactions
   Base: cadence-landing-19 interactions.js (shader recolorido p/ azul #3B97E3) */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── WebGL Hero: aurora/plasma shader com brilho reativo ao mouse ─── */
function initHeroShader() {
  const canvas = document.getElementById('heroCanvas');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const W = canvas.parentElement.clientWidth;
    const H = canvas.parentElement.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const FRAG = `
precision highp float;
uniform float u_t;
uniform vec2 u_r;
uniform vec2 u_m;

// Simplex-style noise
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0,.5,1,2);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);
  vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=perm(perm(perm(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));
  float n_=1./7.;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){
    v+=a*snoise(p);
    p*=2.1;
    a*=.48;
  }
  return v;
}

void main(){
  vec2 uv=(gl_FragCoord.xy)/u_r;
  vec2 p=uv*2.-1.;
  p.x*=u_r.x/u_r.y;

  // Mouse influence — warp the coordinate space
  vec2 mp=u_m*2.-1.;
  mp.x*=u_r.x/u_r.y;
  float md=length(p-mp);
  float mInfluence=smoothstep(1.5,0.,md)*0.6;
  p+=normalize(p-mp+.001)*mInfluence*0.45;

  float t=u_t*0.25;

  // Layer 1: slow flowing aurora
  float n1=fbm(vec3(p*1.2+vec2(t*0.4,t*0.3),t*0.2));
  // Layer 2: faster detail
  float n2=fbm(vec3(p*2.5+vec2(-t*0.6,t*0.5),t*0.35+5.));
  // Layer 3: mouse-reactive ripple
  float n3=fbm(vec3(p*1.8+mp*0.5,t*0.5+10.));
  // Layer 4: continuous pulsing wave (always visible)
  float wave=sin(length(p)*4.0-t*2.0)*0.5+0.5;
  float n4=fbm(vec3(p*0.8+vec2(t*0.2,-t*0.15),t*0.1+20.))*wave;

  // Combine
  float n=n1*0.55+n2*0.3+n3*mInfluence*1.5+n4*0.35;

  // Color: blue escuro -> azul deLoad -> azul claro
  vec3 c1=vec3(0.165,0.482,0.761); // #2A7BC2
  vec3 c2=vec3(0.231,0.592,0.890); // #3B97E3
  vec3 c3=vec3(0.549,0.784,0.961); // #8CC8F5

  float intensity=smoothstep(-0.2,0.8,n);
  vec3 col=mix(c1,c2,intensity);
  col=mix(col,c3,smoothstep(0.5,1.0,intensity)*0.6);

  // Mouse glow: bright spot near cursor
  float glow=exp(-md*md*2.5)*0.5;
  col+=c3*glow;

  // Vignette
  float vig=1.-smoothstep(0.4,1.5,length(uv*2.-1.));

  // Overall alpha: visible and atmospheric
  float alpha=intensity*0.32*vig+glow*0.7*vig;

  // Boost center area
  float centerGlow=exp(-dot(p,p)*0.6)*0.12;
  alpha+=centerGlow;

  gl_FragColor=vec4(col,alpha);
}
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const pLoc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(pLoc);
  gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

  const u_t = gl.getUniformLocation(prog, 'u_t');
  const u_r = gl.getUniformLocation(prog, 'u_r');
  const u_m = gl.getUniformLocation(prog, 'u_m');

  // O layer é fixo e pointer-events:none — a névoa acompanha o mouse em toda a página
  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width;
    tmy = 1.0 - (e.clientY - r.top) / r.height; // flip Y for GL
  }, { passive: true });

  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas.parentElement);
  }

  function frame(t) {
    requestAnimationFrame(frame);
    // roda ao longo de toda a página; pausa só com a aba oculta
    if (document.hidden) return;
    // Smooth mouse interpolation (lerp — o brilho segue com atraso)
    mx += (tmx - mx) * 0.12;
    my += (tmy - my) * 0.12;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(prog);
    gl.uniform1f(u_t, t * 0.001);
    gl.uniform2f(u_r, canvas.width, canvas.height);
    gl.uniform2f(u_m, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimationFrame(frame);
}

// Difere o shader para depois do primeiro paint (não bloqueia o LCP do texto)
if (!REDUCED_MOTION) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initHeroShader, { timeout: 1200 });
  } else {
    setTimeout(initHeroShader, 200);
  }
}

/* ─── Parallax sutil: camada de fundo (orbes/feixes/órbitas) ─── */
if (!REDUCED_MOTION) {
  (function() {
    const bg = document.querySelector('.hero-bg');
    const heroEl = document.getElementById('hero');
    if (!bg || !heroEl) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    heroEl.addEventListener('mousemove', e => {
      const r = heroEl.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -18;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -12;
    });

    function loop() {
      requestAnimationFrame(loop);
      if (document.hidden || window.scrollY > heroEl.offsetHeight) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const sy = window.scrollY * 0.15; // fundo rola mais devagar que o conteúdo
      bg.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + (cy + sy).toFixed(2) + 'px,0)';
    }
    requestAnimationFrame(loop);
  })();
}

/* ─── Mobile nav ─── */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMobile.classList.toggle('open');
});

/* ─── Intersection Observer ─── */
const ioOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, ioOptions);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-up').forEach(el => io.observe(el));

/* ─── Reveal palavra-a-palavra dos títulos (H1/H2) ─── */
(function() {
  const heads = document.querySelectorAll('h1.hero-title, h2');
  if (!heads.length) return;
  const heroTitle = document.querySelector('h1.hero-title');

  if (REDUCED_MOTION) {
    heads.forEach(h => h.classList.add('word-reveal', 'is-revealed'));
    return;
  }

  // Fragmenta o título em palavras preservando <br> e o degradê (.text-gradient por palavra)
  function splitWords(el, base, step) {
    let i = 0;
    (function walk(node, inherited) {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) { // texto
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(part => {
            if (part === '') return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = inherited ? 'wr-word ' + inherited : 'wr-word';
            w.textContent = part;
            w.style.setProperty('--wr-delay', (base + i * step).toFixed(3) + 's');
            i++;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          // herda as classes do span envolvente (.text-gradient, .intel-title-dim, …)
          const own = typeof child.className === 'string' ? child.className.trim() : '';
          walk(child, [inherited, own].filter(Boolean).join(' '));
        }
      });
    })(el, '');
    el.classList.add('word-reveal');
    return i;
  }

  try {
    heads.forEach(h => splitWords(h, h === heroTitle ? 0.15 : 0, 0.075));
  } catch (err) {
    heads.forEach(h => h.classList.add('word-reveal', 'is-revealed')); // fallback seguro
    return;
  }

  // Hero: acima da dobra → revela logo após o primeiro paint
  if (heroTitle) {
    setTimeout(() => heroTitle.classList.add('is-revealed'), 90);
  }

  // Demais títulos: revelam ao entrar na viewport, no ritmo do scroll
  const wrIO = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -12% 0px' });

  heads.forEach(h => { if (h !== heroTitle) wrIO.observe(h); });
})();

/* ─── Carrossel de showcase (ciclo do atendimento + app do paciente) ─── */
(function() {
  function initCarousel(trackId, prevId, nextId, counterId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    const counter = document.getElementById(counterId);
    const total = track.children.length;

    function cardStep() {
      return track.children[0].offsetWidth + 20; // largura do card + gap
    }
    function update() {
      const atStart = track.scrollLeft <= 4;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      // no fim do trilho o último card já está visível, mesmo sem scrollLeft suficiente
      const i = atEnd ? total - 1 : Math.min(total - 1, Math.round(track.scrollLeft / cardStep()));
      counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      prev.disabled = atStart;
      next.disabled = atEnd;
    }
    prev.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  initCarousel('cicloTrack', 'cicloPrev', 'cicloNext', 'cicloCounter');
  initCarousel('appTrack', 'appPrev', 'appNext', 'appCounter');
})();

/* ─── Planos: toggle mensal/anual (abre em anual, blueprint §7) ─── */
(function() {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;
  const planos = document.getElementById('planos');
  let isAnnual = true;

  function apply() {
    toggle.classList.toggle('on', isAnnual);
    toggle.setAttribute('aria-checked', String(isAnnual));
    planos.classList.toggle('mensal', !isAnnual);
    document.querySelectorAll('.price-val').forEach(el => {
      el.textContent = isAnnual ? el.dataset.anual : el.dataset.mensal;
    });
  }
  function flip() { isAnnual = !isAnnual; apply(); }

  toggle.addEventListener('click', flip);
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  apply();
})();

/* ─── FAQ: accordion (uma aberta por vez) ─── */
(function() {
  const list = document.getElementById('faqList');
  if (!list) return;
  const items = [...list.querySelectorAll('.faq-item')];
  items.forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ─── Bento de inteligência clínica: anima em loop enquanto estiver na tela ─── */
(function () {
  const grid = document.getElementById('intelGrid');
  if (!grid) return;

  const counters = grid.querySelectorAll('[data-counter-target]');
  const LOOP_MS = 6000; // acompanha a duração das animações CSS
  const timers = [];
  let loopId = null;

  function format(value, decimals) {
    return decimals ? value.toFixed(decimals).replace('.', ',') : String(Math.ceil(value));
  }

  function runCounters() {
    while (timers.length) clearInterval(timers.pop());
    counters.forEach(el => {
      const target = parseFloat(el.dataset.counterTarget);
      if (isNaN(target)) return;
      const decimals = parseInt(el.dataset.counterDecimals || '0', 10);
      const prefix = el.dataset.counterPrefix || '';
      const suffix = el.dataset.counterSuffix || '';
      const STEP_MS = 20, DURATION = 1500;
      const increment = target / (DURATION / STEP_MS);
      let current = 0;
      el.textContent = prefix + format(0, decimals) + suffix;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = prefix + format(current, decimals) + suffix;
      }, STEP_MS);
      timers.push(timer);
    });
  }

  if (REDUCED_MOTION) { grid.classList.add('in-view'); return; }

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        grid.classList.add('in-view');
        runCounters();
        if (!loopId) loopId = setInterval(runCounters, LOOP_MS);
      } else {
        grid.classList.remove('in-view');
        if (loopId) { clearInterval(loopId); loopId = null; }
        while (timers.length) clearInterval(timers.pop());
      }
    });
  }, { threshold: 0.15 }).observe(grid);
})();

/* ─── CTAs, âncoras e links externos ───────────────────────────────────────
   Preencha LINKS quando as URLs reais existirem. Enquanto um campo estiver
   vazio, o botão cai num destino interno coerente da própria página em vez
   de não fazer nada.                                                      */
(function () {
  const LINKS = {
    signup:      'https://www.deloadfit.app/',
    appStore:    '',   // ex.: 'https://apps.apple.com/br/app/...'
    playStore:   '',   // ex.: 'https://play.google.com/store/apps/details?id=...'
    email:       'leo-barros@unifebe.edu.br',   // vira mailto:
    whatsapp:    '5549991566172',  // +55 49 99156-6172 (vira wa.me/)
    instagram:   '',   // ex.: 'https://instagram.com/deload.fit'
    termos:      '',
    privacidade: '',
    lgpd:        ''
  };

  const NAV_H = 84; // altura da nav fixa, para a seção não ficar por baixo dela
  const behavior = REDUCED_MOTION ? 'auto' : 'smooth';

  function closeMobileNav() {
    const h = document.getElementById('hamburger');
    const m = document.getElementById('navMobile');
    if (m && m.classList.contains('open')) { h.classList.remove('open'); m.classList.remove('open'); }
  }

  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    closeMobileNav();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_H, behavior });
  }

  function leave(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /* Âncoras internas: nav, menu mobile e footer. O href já aponta para a
     seção certa; aqui só compensamos a nav fixa e fechamos o menu mobile. */
  document.querySelectorAll('a[href^="#"]:not([data-link])').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      e.preventDefault();
      scrollToSection(id);
      history.replaceState(null, '', id);
    });
  });

  /* Botões que só rolam para uma seção (ex.: "Ver os planos" do hero) */
  document.querySelectorAll('[data-goto]').forEach(b => {
    b.addEventListener('click', () => scrollToSection(b.dataset.goto));
  });

  /* CTAs de conversão. Sem URL de cadastro configurada, "Começar grátis"
     leva para os planos e os botões de plano levam para o CTA final. */
  document.querySelectorAll('[data-cta]').forEach(b => {
    const cta = b.dataset.cta;
    b.addEventListener('click', () => {
      if (cta.startsWith('plano-')) {
        if (LINKS.signup) {
          const sep = LINKS.signup.includes('?') ? '&' : '?';
          leave(LINKS.signup + sep + 'plano=' + cta.replace('plano-', ''));
        } else {
          scrollToSection('#cta-section');
        }
        return;
      }
      LINKS.signup ? leave(LINKS.signup) : scrollToSection('#planos');
    });
  });

  /* Links externos. Sem URL configurada o elemento fica inerte, em vez de
     pular para o topo da página. Vale para <a> e para <button>. */
  document.querySelectorAll('[data-link]').forEach(el => {
    const key = el.dataset.link;
    let url = LINKS[key] || '';
    if (url && key === 'email') url = 'mailto:' + url;
    if (url && key === 'whatsapp') url = 'https://wa.me/' + url.replace(/\D/g, '');

    if (!url) {
      el.addEventListener('click', e => e.preventDefault());
      return;
    }
    if (el.tagName === 'A') {
      el.setAttribute('href', url);
      // mailto: precisa abrir no próprio contexto para o cliente de e-mail assumir
      if (!url.startsWith('mailto:')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    } else {
      el.addEventListener('click', () => {
        url.startsWith('mailto:') ? (window.location.href = url) : leave(url);
      });
    }
  });
})();

/* ─── Dynamic year ─── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
