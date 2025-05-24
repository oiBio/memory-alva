// Alvas Fantastisches Fundstück-Memory - Confetti Effects

// Konfetti-Effekt Klasse
class Confetti {
    constructor() {
        this.particles = [];
        this.animationId = null;
    }

    createParticle(x, y) {
        const useEmoji = Math.random() < 0.3; // 30% Chance für Emoji
        
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * -15 - 5,
            gravity: 0.5,
            friction: 0.98,
            life: 1,
            decay: Math.random() * 0.02 + 0.005,
            size: Math.random() * 8 + 4,
            color: CONFETTI_CONFIG.COLORS[Math.floor(Math.random() * CONFETTI_CONFIG.COLORS.length)],
            shape: CONFETTI_CONFIG.SHAPES[Math.floor(Math.random() * CONFETTI_CONFIG.SHAPES.length)],
            emoji: useEmoji ? CONFETTI_CONFIG.EMOJIS[Math.floor(Math.random() * CONFETTI_CONFIG.EMOJIS.length)] : null,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        };
    }

    createConfettiBlast(centerX, centerY) {
        // Erstelle Partikel vom Zentrum ausgehend
        for (let i = 0; i < CONFETTI_CONFIG.PARTICLES_COUNT; i++) {
            this.particles.push(this.createParticle(centerX, centerY));
        }

        // Starte Animation
        this.animate();

        // Stoppe nach der konfigurierten Dauer
        setTimeout(() => {
            this.stop();
        }, CONFETTI_CONFIG.DURATION);
    }

    animate() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const canvas = this.getOrCreateCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.particles = this.particles.filter(particle => {
            // Update Partikel-Position
            particle.vx *= particle.friction;
            particle.vy += particle.gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.life -= particle.decay;

            if (particle.life <= 0) return false;

            // Zeichne Partikel
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);

            if (particle.emoji) {
                // Zeichne Emoji
                ctx.font = `${particle.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(particle.emoji, 0, 0);
            } else {
                // Zeichne geometrische Form
                ctx.fillStyle = particle.color;
                this.drawShape(ctx, particle.shape, particle.size);
            }

            ctx.restore();
            return true;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    drawShape(ctx, shape, size) {
        switch (shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-size / 2, -size / 2, size, size);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }

    getOrCreateCanvas() {
        let canvas = document.getElementById('confetti-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            document.body.appendChild(canvas);
        }
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas;
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        
        // Entferne Canvas nach kurzer Verzögerung
        setTimeout(() => {
            const canvas = document.getElementById('confetti-canvas');
            if (canvas) {
                canvas.remove();
            }
        }, 100);
    }

    // Statische Methode für einfache Nutzung
    static celebrate(element) {
        const confetti = new Confetti();
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        confetti.createConfettiBlast(centerX, centerY);
    }
}
