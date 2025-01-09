import { GameState, UIUtils, NavigationController } from './script.js';

const HomeView = {
    generateHTML() {
        return `
            <div class="home-container">
                <!-- Bannière d'événement -->
                <section class="event-banner">
                    <div class="event-slide">
                        <h1>Bienvenue sur Wheel of Destiny Gacha ! (VERSION ALPHA-DEV)</h1>
                        <div class="event-info">
                            <h2>Événement en cours</h2>
                            <p>Découvrez nos nouveaux personnages !</p>
                        </div>
                    </div>
                </section>

                <!-- Résumé du profil -->
                <section class="profile-summary">
                    <div class="profile-stats">
                        <div class="profile-stat-card">
                            <img src="assets/images/icon/collection-icon.png" alt="Collection">
                            <div class="profile-stat-info">
                                <span class="profile-stat-number">${Object.keys(GameState.collectedCharacters).length}</span>
                                <span class="profile-stat-text">Personnages collectés</span>
                            </div>
                        </div>
                        <div class="profile-stat-card">
                            <img src="assets/images/icon/coin-icon.png" alt="Coins">
                            <div class="profile-stat-info">
                                <span class="profile-stat-number">${GameState.coins.toLocaleString()}</span>
                                <span class="profile-stat-text">Pièces</span>
                            </div>
                        </div>
                    </div>
                </section>
                <!-- Activités quotidiennes -->
                <section class="daily-section">
                    <h2 class="section-title">Activités Quotidiennes</h2>
                    <div class="daily-activities">
                        <div class="daily-card">
                            <img src="assets/images/icon/coin-icon.png" alt="Daily Coins">
                            <div class="daily-info">
                                <h3>Bonus quotidien</h3>
                                <p>1000 pièces gratuites</p>
                            </div>
                            <button class="daily-claim-btn">Réclamer</button>
                        </div>
                        <div class="daily-card">
                            <img src="assets/images/icon/pull-icon.png" alt="Daily Pull">
                            <div class="daily-info">
                                <h3>Tirage gratuit</h3>
                                <p>1 tirage offert par jour</p>
                            </div>
                            <button class="daily-claim-btn">Réclamer</button>
                        </div>
                    </div>
                </section>

                <!-- Dernières acquisitions -->
                <section class="recent-pulls-section">
                    <h2 class="section-title">Dernières acquisitions</h2>
                    <div class="recent-pulls-grid">
                        ${this.generateRecentPullsHTML()}
                    </div>
                </section>
            </div>
        `;
    },

    generateRecentPullsHTML() {
        const recentPulls = GameState.pullHistory.slice(0, 5);

        if (recentPulls.length === 0) {
            return `
                <div class="empty-state">
                    <img src="assets/images/icon/pull-icon.png" alt="Empty pulls" class="empty-state-icon">
                    <p class="no-pulls-message">Aucun personnage obtenu pour le moment</p>
                    <button onclick="NavigationController.showPull()" class="empty-state-button">
                        Faire un tirage
                    </button>
                </div>
            `;
        }

        return recentPulls.map(character => `
            <div class="collection-item" data-rarity="${character.rarity}">
                <img src="${character.image}" alt="${character.name}" 
                     onerror="this.src='assets/images/icon/user-icon.png'">
                <div class="character-info">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-rarity">${character.rarity}</p>
                </div>
            </div>
        `).join('');
    },

    initialize() {
        const claimButtons = document.querySelectorAll('.daily-claim-btn');
        
        claimButtons.forEach((button, index) => {
            const rewardType = index === 0 ? 'coins' : 'pull';
            
            // Vérifier si la récompense a déjà été réclamée
            if (!GameState.canClaimDailyReward(rewardType)) {
                button.disabled = true;
                button.textContent = 'Réclamé';
            }
    
            button.addEventListener('click', () => {
                button.disabled = true;
                button.textContent = 'Réclamé';
                
                if (index === 0) { // Bonus de pièces
                    GameState.coins += 1000;
                    GameState.claimDailyReward('coins');
                    UIUtils.updateCoinDisplay();
                } else if (index === 1) { // Tirage gratuit
                    GameState.claimDailyReward('pull');
                    console.log('Tirage gratuit réclamé');
                    // La logique du tirage gratuit sera implémentée plus tard
                }
            });
        });
    }
    
};

export default HomeView;
