/*
  Personal Portfolio - script.js
  - Vanilla JS only
  - Handles theme toggle, mobile nav, and reveal-on-scroll animations
  - Comments explain what each part does for beginners
*/

// Helper: select single or multiple elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', () => {
  // Set the current year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle: persist user preference in localStorage
  const themeToggle = $('#theme-toggle');
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') document.body.classList.add('dark');

  themeToggle && themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark);
  });

  // Mobile nav toggle
  const mobileToggle = $('#mobile-toggle');
  const navList = document.querySelector('.nav-list');
  mobileToggle && mobileToggle.addEventListener('click', () => {
    navList.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked (nice UX)
  document.querySelectorAll('.nav-list a').forEach(a => {
    a.addEventListener('click', () => navList.classList.remove('open'));
  });

  // Reveal-on-scroll, progress bar animations, and scrollspy using IntersectionObserver
  const reveals = document.querySelectorAll('.reveal');
  const obsOptions = {threshold: 0.15};
  const skillBars = document.querySelectorAll('.progress-bar');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);

          // If skills section is visible, animate progress bars
          if (entry.target.id === 'skills') {
            skillBars.forEach(bar => {
              const pct = bar.getAttribute('data-percent') || '0';
              bar.style.width = pct + '%';
            });
          }
        }
      });
    }, obsOptions);
    reveals.forEach(r => revealObserver.observe(r));

    // Scrollspy: observe sections to update active nav link
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector('.nav-list a[href="#' + id + '"]');
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          link && link.classList.add('active');
        }
      });
    }, {threshold: 0.5});
    sections.forEach(s => spyObserver.observe(s));
  } else {
    // Fallbacks
    reveals.forEach(r => r.classList.add('active'));
    skillBars.forEach(bar => { bar.style.width = bar.getAttribute('data-percent') + '%' });
  }

  // Contact form (frontend only) — simple validation + UX
  const contactForm = $('#contact-form');
  const formMsg = $('#form-msg');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        formMsg.textContent = 'Please fill in all fields.';
        formMsg.style.color = 'var(--accent-2)';
        return;
      }

      // Simple fake submission — in a real site you'd send this to a server
      formMsg.textContent = 'Thanks! Your message was sent (demo).';
      formMsg.style.color = 'var(--accent)';
      contactForm.reset();
      // Optionally hide message after a few seconds
      setTimeout(() => formMsg.textContent = '', 5000);
    });
  }

  // Small accessibility improvement: enable keyboard focus styles for interactive elements
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });

  // Interactive background: add class and track mouse/touch to update CSS vars
  if (document.body) {
    document.body.classList.add('interactive-bg');
    const setMousePos = (e) => {
      const ex = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      const ey = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
      const x = (ex / window.innerWidth) * 100;
      const y = (ey / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', x + '%');
      document.documentElement.style.setProperty('--mouse-y', y + '%');
    };
    window.addEventListener('mousemove', setMousePos);
    window.addEventListener('touchmove', (ev) => setMousePos(ev.touches ? ev.touches[0] : ev), {passive:true});
  }

  // Advanced particle-network background (canvas)
  (function(){
    const DPR = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.className = 'bg-canvas';
    document.body.appendChild(canvas);
    document.body.classList.add('advanced-bg');
    const ctx = canvas.getContext('2d');

    let w = window.innerWidth, h = window.innerHeight;
    let particles = [];
    const mouse = {x: -9999, y: -9999};

    function resize(){
      w = window.innerWidth; h = window.innerHeight;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
      initParticles();
    }

    function initParticles(){
      const area = w * h;
      const count = Math.max(18, Math.min(140, Math.floor(area / 12000)));
      particles = [];
      for(let i=0;i<count;i++) particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        vx: (Math.random()-0.5) * 0.6,
        vy: (Math.random()-0.5) * 0.6,
        r: 1 + Math.random()*2
      });
    }

    function step(){
      ctx.clearRect(0,0,w,h);
      // move
      for(let p of particles){
        // simple mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx,dy);
        if (dist < 140){
          const force = (140 - dist) / 140 * 0.7;
          p.vx += (dx/dist || 0) * force;
          p.vy += (dy/dist || 0) * force;
        }

        p.x += p.vx; p.y += p.vy;
        // gentle damping
        p.vx *= 0.98; p.vy *= 0.98;

        // bounds
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // draw connections
      const maxDist = 120;
      for(let i=0;i<particles.length;i++){
        const a = particles[i];
        // draw particle
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 20);
        g.addColorStop(0, 'rgba(108,99,255,0.9)');
        g.addColorStop(1, 'rgba(108,99,255,0.05)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI*2); ctx.fill();

        for(let j=i+1;j<particles.length;j++){
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx,dy);
          if (d < maxDist){
            const alpha = 1 - d / maxDist;
            ctx.strokeStyle = 'rgba(108,99,255,' + (alpha*0.12) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      requestAnimationFrame(step);
    }

    // mouse / touch
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('touchmove', (ev) => { if (ev.touches && ev.touches[0]){ mouse.x = ev.touches[0].clientX; mouse.y = ev.touches[0].clientY; } }, {passive:true});

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(step);

  })();

});
