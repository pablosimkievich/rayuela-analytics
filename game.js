class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimization 1: disable alpha
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.balloons = [];
        this.mines = [];
        this.stars = [];
        this.score = 0;
        this.highest = localStorage.getItem('highest') || 0;
        this.energy = 100;
        this.missedBalloons = 0;
        this.bangSound = new Audio('/assets/bang.ogg');
        this.gameActive = true;
        
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;

        // Optimization 2: Pre-calculate values
        this.neonColors = [
            '#990000', '#004d00', '#660066', 
            '#004d4d', '#800033', '#808000'
        ];
        
        // Optimization 3: Add frame timing
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // Target 60 FPS

        this.setupEventListeners();
        this.createStars();
        this.showStartScreen();
    }

    createStars() {
        for(let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                brightness: Math.random()
            });
        }
    }

    showStartScreen() {
        // Draw initial background
        this.ctx.fillStyle = '#0A0203';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStars();

        const style = `
            background: rgba(0, 0, 0, 0.9);
            color: #FF6B35;
            text-shadow: 0 0 5px #FF6B35;
            font-family: 'Courier New', monospace;
            padding: 20px;
            border: 2px solid #FF6B35;
            box-shadow: 0 0 10px #FF6B35;
            border-radius: 5px;
            z-index: 1000;
        `;
        const message = "HEXAGONAL BALLOON DEFENSE\n\n" +
                       "► Click and drag to place drone mines\n" +
                       "► Stop balloons from reaching the ground\n" +
                       "► Catch glowing balloons to restore energy\n" +
                       "► Game over if 10 balloons hit the ground\n\n" +
                       "[ GO! ]";
        
        const div = document.createElement('div');
        div.style.cssText = style;
        div.innerText = message;
        div.style.position = 'fixed';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.whiteSpace = 'pre';
        
        document.body.appendChild(div);
        
        setTimeout(() => {
            document.body.removeChild(div);
            this.startGame();
        }, 3000);
    }

    startGame() {
        this.gameLoop();
        setInterval(() => this.spawnBalloon(), 1000);
    }

    spawnBalloon() {
        const special = Math.random() < 0.1;
        const baseColor = special ? '#FFFFFF' : this.neonColors[Math.floor(Math.random() * this.neonColors.length)];
        const glowColor = special ? '#FFFFFF' : baseColor.replace(/[0-9a-f]{2}/g, 
            (hex) => Math.min(255, parseInt(hex, 16) + 150).toString(16).padStart(2, '0'));
        
        this.balloons.push({
            x: Math.random() * this.canvas.width,
            y: -50,
            size: Math.random() * 30 + 20,
            speed: Math.random() * 2 + 1,
            color: baseColor,
            glowColor: glowColor,
            special: special,
            glow: 0,
            opacity: 1
        });
    }

    drawHexagon(x, y, size, fill, stroke) {
        this.ctx.beginPath();
        for(let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const xPos = x + size * Math.cos(angle);
            const yPos = y + size * Math.sin(angle);
            i === 0 ? this.ctx.moveTo(xPos, yPos) : this.ctx.lineTo(xPos, yPos);
        }
        this.ctx.closePath();
        if(fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if(stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
    }

    preRenderStarField() {
        this.starFieldCtx.fillStyle = '#0A0203';
        this.starFieldCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            this.starFieldCtx.fillStyle = `rgba(255, 0, 0, ${star.brightness * 0.7})`;
            this.starFieldCtx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    drawStars() {
        // Only update star brightness without redrawing everything
        this.ctx.drawImage(this.starFieldCanvas, 0, 0);
        this.stars.forEach(star => {
            star.brightness = Math.sin(Date.now() / 1000 + star.x) * 0.5 + 0.5;
            const x = Math.floor(star.x);
            const y = Math.floor(star.y);
            this.ctx.fillStyle = `rgba(255, 0, 0, ${star.brightness * 0.7})`;
            this.ctx.fillRect(x, y, star.size, star.size);
        });
    }

    update() {
        if (!this.gameActive) return;

        // Optimization 4: Use for...of instead of filter
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const mine = this.mines[i];
            const age = Date.now() - mine.createdAt;
            mine.opacity = Math.max(0, 1 - (age / mine.lifetime));
            if (age >= mine.lifetime) {
                this.mines.splice(i, 1);
            }
        }

        // Optimization 5: Single pass collision detection
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            balloon.y += balloon.speed;
            
            if (balloon.y > this.canvas.height) {
                this.balloons.splice(i, 1);
                this.missedBalloons++;
                this.energy = Math.max(0, this.energy - 10);
                continue;
            }

            // Check collisions with mines
            for (let j = this.mines.length - 1; j >= 0; j--) {
                const mine = this.mines[j];
                const dx = balloon.x - mine.x;
                const dy = balloon.y - mine.y;
                const distance = dx * dx + dy * dy; // Optimization 6: Remove sqrt
                
                if (distance < (balloon.size + mine.size) * (balloon.size + mine.size)) {
                    this.balloons.splice(i, 1);
                    this.mines.splice(j, 1);
                    this.score += 100;
                    if (balloon.special) {
                        this.energy = 100;
                    }
                    this.explodeBalloon(balloon.x, balloon.y, balloon.color);
                    this.explodeMine(mine.x, mine.y);
                    break;
                }
            }
        }

        if (this.energy <= 0 || this.missedBalloons >= 10) {
            this.gameActive = false;
            this.gameOver();
        }
    }

    placeMine(x, y) {
        this.mines.push({
            x: x,
            y: y,
            size: 5,
            createdAt: Date.now(),
            lifetime: 5000, // 5 seconds lifetime
            opacity: 1
        });
        this.energy -= 0.5; // Drain energy when placing mines
    }

    explodeMine(x, y) {
        const particles = [];
        const particleCount = 30;
        
        for(let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 3 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2,
                life: 1,
                color: '#FF6B35',
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        this.animateParticles(particles, false);
    }

    explodeBalloon(x, y, color) {
        const particles = [];
        const particleCount = 40; // Increased particles
        
        // Solar flare effect
        for(let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 4 + Math.random() * 4;
            const curve = Math.random() * 0.5 + 0.5; // Curve factor for spiral effect
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 2,
                life: 1,
                color: color,
                curve: curve
            });
        }

        this.animateParticles(particles, true); // true for solar effect
    }

    animateParticles(particles, isSolar) {
        let activeParticles = [...particles];
        
        const animate = () => {
            if (activeParticles.length === 0) return;
            
            activeParticles = activeParticles.filter(particle => particle.life > 0);
            
            activeParticles.forEach(particle => {
                if (isSolar) {
                    particle.x += particle.vx * particle.curve;
                    particle.y += particle.vy * particle.curve;
                    particle.vx *= 0.98;
                    particle.vy *= 0.98;
                } else {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.2;
                }
                
                particle.life -= 0.02;

                if(particle.life > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(
                        particle.x - particle.vx * (isSolar ? 5 : 3),
                        particle.y - particle.vy * (isSolar ? 5 : 3)
                    );
                    this.ctx.strokeStyle = `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
                    this.ctx.lineWidth = particle.size;
                    this.ctx.stroke();
                }
            });

            if(activeParticles.length > 0) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    draw() {
        // Use offscreen canvas for compositing
        this.offscreenCtx.fillStyle = '#0A0203';
        this.offscreenCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars to offscreen canvas
        this.offscreenCtx.drawImage(this.starFieldCanvas, 0, 0);

        // Batch similar operations
        const glowItems = [...this.balloons, ...this.mines];
        
        // Draw all glowing items
        glowItems.forEach(item => {
            if (item.hasOwnProperty('size')) { // Balloon
                const balloon = item;
                this.offscreenCtx.shadowBlur = 20;
                this.offscreenCtx.shadowColor = balloon.glowColor;
                this.offscreenCtx.beginPath();
                this.offscreenCtx.arc(balloon.x, balloon.y, balloon.size, 0, Math.PI * 2);
                this.offscreenCtx.fillStyle = balloon.color;
                this.offscreenCtx.fill();
            } else { // Mine
                const mine = item;
                this.offscreenCtx.shadowBlur = 15;
                this.offscreenCtx.shadowColor = `rgba(255, 107, 53, ${mine.opacity})`;
                this.drawHexagon(
                    mine.x, mine.y, mine.size,
                    `rgba(255, 107, 53, ${mine.opacity * 0.3})`,
                    `rgba(255, 107, 53, ${mine.opacity})`
                );
            }
        });

        // Draw HUD
        this.drawHUD();

        // Copy offscreen canvas to main canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    drawHUD() {
        // Score
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = '20px "Courier New"';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`Highest: ${this.highest}`, 20, 60);

        // Energy bar
        const barWidth = 200;
        const barHeight = 20;
        const x = this.canvas.width - barWidth - 20;
        const y = 20;

        // Bar background
        this.ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Energy level
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.fillRect(x, y, barWidth * (this.energy / 100), barHeight);

        // Border
        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.strokeRect(x, y, barWidth, barHeight);

        // Missed balloons counter
        this.ctx.fillText(`Missed: ${this.missedBalloons}/10`, x, y + barHeight + 20);
    }

    gameLoop(timestamp) {
        if (!this.gameActive) return;

        // Optimization 7: Control frame rate
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed >= this.frameInterval) {
            this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
            
            this.update();
            this.draw();
            
            if (this.mouseDown && this.energy > 0) {
                this.placeMine(this.mouseX, this.mouseY);
            }
        }

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameOver() {
        if (this.score > this.highest) {
            this.highest = this.score;
            localStorage.setItem('highest', this.highest);
        }

        const style = `
            background: rgba(0, 0, 0, 0.9);
            color: #FF6B35;
            text-shadow: 0 0 5px #FF6B35;
            font-family: 'Courier New', monospace;
            padding: 20px;
            border: 2px solid #FF6B35;
            box-shadow: 0 0 10px #FF6B35;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        const div = document.createElement('div');
        div.style.cssText = style;
        div.innerHTML = `
            <h2>GAME OVER</h2>
            <p>Final Score: ${this.score}</p>
            <p>Highest Score: ${this.highest}</p>
            <p style="margin-top: 20px">[Click anywhere to restart]</p>
        `;
        div.style.position = 'fixed';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.textAlign = 'center';
        
        document.body.appendChild(div);
        
        document.addEventListener('click', () => {
            location.reload();
        }, { once: true });
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Optimization 8: Throttle mousemove
        let lastMove = 0;
        this.canvas.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMove >= 16) { // ~60fps
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                lastMove = now;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        // Optimization 9: Debounce resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }, 250);
        });
    }
}

// Start the game when the page loads
window.onload = () => new Game();








