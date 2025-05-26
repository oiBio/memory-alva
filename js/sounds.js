// Sound Manager für Alvas Fantastisches Fundstück-Memory

class SoundManager {
    static sounds = {};
    static isInitialized = false;
    static isMuted = false;

    static init() {
        if (this.isInitialized) return;

        // Bessere Sounds mit Web Audio API
        this.createSounds();
        this.isInitialized = true;
    }

    static createSounds() {
        // AudioContext für bessere Soundqualität
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.sounds = {
                flip: this.createFlipSound(audioContext),
                pair: this.createPairSound(audioContext),
                fundstueck: this.createFundstueckSound(audioContext),
                noMatch: this.createNoMatchSound(audioContext),
                gameStart: this.createGameStartSound(audioContext),
                gameOver: this.createGameOverSound(audioContext)
            };
        } catch (error) {
            console.warn('Web Audio API nicht verfügbar, fallback zu einfachen Sounds');
            this.createFallbackSounds();
        }
    }

    static createFlipSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    }

    static createPairSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            // Erfolgreicher, heller Klang
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
            oscillator2.frequency.setValueAtTime(659, audioContext.currentTime); // E5
            
            oscillator1.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
            oscillator2.frequency.setValueAtTime(784, audioContext.currentTime + 0.1); // G5
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.3);
            oscillator2.stop(audioContext.currentTime + 0.3);
        };
    }

    static createFundstueckSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            // Magischer, funkelnder Klang für Fundstücke
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, audioContext.currentTime);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        };
    }

    static createNoMatchSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            // Sanfter, nicht frustrierender "Versuch's nochmal" Klang
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        };
    }

    static createGameStartSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            // Fröhliche Fanfare zum Spielstart
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
                
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.2);
                
                oscillator.start(audioContext.currentTime + index * 0.15);
                oscillator.stop(audioContext.currentTime + index * 0.15 + 0.2);
            });
        };
    }

    static createGameOverSound(audioContext) {
        return () => {
            if (this.isMuted) return;
            
            // Triumphale Siegesmelodie
            const melody = [
                {freq: 523, time: 0},     // C5
                {freq: 659, time: 0.2},   // E5
                {freq: 784, time: 0.4},   // G5
                {freq: 1047, time: 0.6},  // C6
                {freq: 784, time: 0.8},   // G5
                {freq: 1047, time: 1.0}   // C6
            ];
            
            melody.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.time);
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + note.time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + 0.3);
                
                oscillator.start(audioContext.currentTime + note.time);
                oscillator.stop(audioContext.currentTime + note.time + 0.3);
            });
        };
    }

    static createFallbackSounds() {
        // Einfache Fallback-Sounds ohne Web Audio API
        this.sounds = {
            flip: () => this.playBeep(200, 100),
            pair: () => this.playSuccessBeep(),
            fundstueck: () => this.playMagicBeep(),
            noMatch: () => this.playBeep(150, 200),
            gameStart: () => this.playFanfare(),
            gameOver: () => this.playVictoryFanfare()
        };
    }

    static playBeep(frequency = 800, duration = 100) {
        if (this.isMuted) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Könnte Sound nicht abspielen:', error);
        }
    }

    static playSuccessBeep() {
        this.playBeep(523, 150);
        setTimeout(() => this.playBeep(659, 150), 100);
    }

    static playMagicBeep() {
        this.playBeep(440, 100);
        setTimeout(() => this.playBeep(880, 100), 80);
        setTimeout(() => this.playBeep(1320, 120), 160);
    }

    static playFanfare() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 200), i * 150);
        });
    }

    static playVictoryFanfare() {
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 300), i * 200);
        });
    }

    static playSound(soundName) {
        if (!this.isInitialized) {
            this.init();
        }

        if (this.isMuted) {
            return;
        }

        try {
            if (this.sounds[soundName]) {
                this.sounds[soundName]();
            } else {
                console.warn(`Sound '${soundName}' nicht gefunden`);
            }
        } catch (error) {
            console.warn(`Fehler beim Abspielen von Sound '${soundName}':`, error);
        }
    }

    static toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    static setMuted(muted) {
        this.isMuted = muted;
    }

    static isSoundMuted() {
        return this.isMuted;
    }
}

// Auto-initialize on user interaction (required for modern browsers)
document.addEventListener('click', () => {
    if (!SoundManager.isInitialized) {
        SoundManager.init();
    }
}, { once: true });

// Export for use in other modules
window.SoundManager = SoundManager;
