// Alvas Fantastisches Fundstück-Memory - Game Persistence

class GamePersistence {
    // Persist user settings
    static saveSettings(game) {
        const settings = {
            player1Name: document.getElementById('player1Name').value.trim(),
            player2Name: document.getElementById('player2Name').value.trim(),
            gameMode: game.isSinglePlayer ? 'singleplayer' : 'multiplayer',
            difficulty: document.querySelector('#difficultyButtons .btn-difficulty.active').dataset.value,
            showOriginalFundstuecke: game.showOriginalFundstuecke
        };
        localStorage.setItem('memoryGameSettings', JSON.stringify(settings));
    }    static loadSettings(game) {
        const settingsStr = localStorage.getItem('memoryGameSettings');
        let settings;
        
        if (settingsStr) {
            settings = JSON.parse(settingsStr);
        } else {
            // Provide default settings if none are saved
            settings = {
                player1Name: 'Alva',
                player2Name: 'Papa/Mama',
                gameMode: 'multiplayer',
                difficulty: '12',
                showOriginalFundstuecke: false
            };
        }
        
        // Apply player names
        if (settings.player1Name) document.getElementById('player1Name').value = settings.player1Name;
        if (settings.player2Name) document.getElementById('player2Name').value = settings.player2Name;
        
        // Restore game mode selection
        document.querySelectorAll('#gameModeButtons .btn-mode').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.gameMode);
        });
        game.togglePlayerSetup(settings.gameMode === 'singleplayer');
        
        // Restore difficulty selection
        document.querySelectorAll('#difficultyButtons .btn-difficulty').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.difficulty);
        });
        
        // Restore checkbox
        document.getElementById('showOriginalFundstuecke').checked = settings.showOriginalFundstuecke;
    }

    // Persist and restore game state for resume
    static saveGameState(game) {
        // Serialize players by cardUid to avoid object mismatches
        const playersState = game.players.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            collectedPairs: p.collectedPairs.map(pair => pair.map(card => card.cardUid)),
            collectedFundstuecke: p.collectedFundstuecke.map(card => card.cardUid)
        }));
        
        const state = {
            cards: game.cards,
            playersState,
            currentPlayerIndex: game.currentPlayerIndex,
            gameState: game.gameState,
            showOriginalFundstuecke: game.showOriginalFundstuecke,
            isSinglePlayer: game.isSinglePlayer
        };
        localStorage.setItem('memoryGameState', JSON.stringify(state));
    }

    static loadGameState() {
        const stateStr = localStorage.getItem('memoryGameState');
        return stateStr ? JSON.parse(stateStr) : null;
    }

    static clearSavedGameState() {
        localStorage.removeItem('memoryGameState');
    }

    static restoreGameState(game, state) {
        // Restore cards
        game.cards = state.cards;
        
        // Restore players with object references
        game.players = state.playersState.map(ps => ({
            id: ps.id,
            name: ps.name,
            score: ps.score,
            collectedPairs: ps.collectedPairs.map(uidPair =>
                uidPair.map(uid => game.cards.find(c => c.cardUid === uid))
            ),
            collectedFundstuecke: ps.collectedFundstuecke.map(uid =>
                game.cards.find(c => c.cardUid === uid)
            )
        }));
        
        game.currentPlayerIndex = state.currentPlayerIndex;
        game.gameState = state.gameState;
        game.showOriginalFundstuecke = state.showOriginalFundstuecke;
        game.isSinglePlayer = state.isSinglePlayer;
        
        UI.showGameScreen();
        game.renderGame();
        game.setCurrentPlayerMessage();
    }

    static promptResume(game) {
        const state = GamePersistence.loadGameState();
        if (state && state.gameState === 'playing') {
            // Automatisch unterbrochenes Spiel fortsetzen
            GamePersistence.restoreGameState(game, state);
        }
    }
}
