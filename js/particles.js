/* ============================================================
   PARTICLES.JS — Dream Builder AI
   Canvas-based animated particle field
   ============================================================ */

class ParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.mouse = { x: null, y: null };

    this.config = {
      count: 60,
      color: [
        'rgba(124,58,237,',
        'rgba(236,72,153,',
        'rgba(6,182,212,',
      ],
      maxRadius: 1.8,
      minRadius: 0.4,
      speed: 0.3,
      connectionDist: 120,
      connectionOpacity: 0.08,
    };

    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.resize();
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const colorBase = this.config.color[Math.floor(Math.random() * this.config.color.length)];
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      r: this.config.minRadius + Math.random() * (this.config.maxRadius - this.config.minRadius),
      vx: (Math.random() - 0.5) * this.config.speed,
      vy: (Math.random() - 0.5) * this.config.speed,
      opacity: 0.2 + Math.random() * 0.5,
      colorBase,
    };
  }

  drawParticle(p) {
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    this.ctx.fillStyle = `${p.colorBase}${p.opacity})`;
    this.ctx.fill();
  }

  drawConnections() {
    const { particles, ctx, config } = this;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.connectionDist) {
          const alpha = config.connectionOpacity * (1 - dist / config.connectionDist);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  update() {
    const { canvas } = this;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawConnections();
    this.particles.forEach(p => this.drawParticle(p));
  }

  animate() {
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.animate());
  }

  bindEvents() {
    window.addEventListener('resize', () => this.init());
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

export default ParticleField;
