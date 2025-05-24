// Alvas Fantastisches Fundstück-Memory - Application Initialization

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MemoryGame();
    
    // Handle window resize for confetti canvas and responsive layout
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('confetti-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Re-render game board for responsive layout
        if (window.game && window.game.gameState === 'playing') {
            window.game.renderGameBoard();
        }
    });
});
