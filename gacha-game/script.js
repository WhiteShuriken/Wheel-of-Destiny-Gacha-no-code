let coins = 5000000;
const collectedCharacters = {};

const rarityWeights = { //Drop Taux
    'Common': 70,
    'Rare': 20,
    'Legendary': 10
};

let characters = [];
let currentSortOption = 'alphabetical'; // Store the current sort option

function updateCoinDisplay() {
    document.getElementById('coin-count').innerText = coins;
}

function drawCharacter(packId) {
    if (!characters) {
        console.error("Character data not loaded yet.");
        return null;
    }
    const packCharacters = characters.filter(character => character.packId.includes(packId));
    if (packCharacters.length === 0) {
        console.error(`No characters available for pack ID: ${packId}`);
        return null;
    }
    const randomNumber = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedRarity;
    for (const rarity in rarityWeights) {
        cumulativeWeight += rarityWeights[rarity];
        if (randomNumber <= cumulativeWeight) {
            selectedRarity = rarity;
            break;
        }
    }
    const charactersOfRarity = packCharacters.filter(char => char.rarity === selectedRarity);
    const randomIndex = Math.floor(Math.random() * charactersOfRarity.length);
    return charactersOfRarity[randomIndex];
}

function showHome() {
    document.getElementById('content').innerHTML = '<h1>Welcome to the Wheel of Destiny Gacha!</h1><p>Check out the latest news and updates here.</p>';
    setActiveNav('home');
    updateCoinDisplay();
}

async function showPull() {
    document.getElementById('content').innerHTML = `
        <h1>Gacha Pull</h1>
        <div class="pack-options">
        </div>
        <div id="pullResult"></div>
    `;
    setActiveNav('pull');
    updateCoinDisplay();

    try {
        const response = await fetch('packs.json');
        const packsData = await response.json();
        const packs = packsData.packs;
        let packOptionsHTML = '';
        packs.forEach(pack => {
            packOptionsHTML += `
                <button onclick="performPull('${pack.id}')"><img src="${pack.image}" alt="${pack.name}" style="height: 50px; width: auto; vertical-align: middle;"> Pull ${pack.name} (${pack.singleCost} <img src="assets/images/icon/coin-icon.png" alt="Coin" style="height: 20px; width: auto; vertical-align: middle;">)</button>
                <button onclick="performMultiplePulls('${pack.id}', 10)"><img src="${pack.image}" alt="${pack.name}" style="height: 50px; width: auto; vertical-align: middle;"> Pull ${pack.name} x10 (${pack.multiCost} <img src="assets/images/icon/coin-icon.png" alt="Coin" style="height: 20px; width: auto; vertical-align: middle;">)</button>
            `;
        });
        document.querySelector('.pack-options').innerHTML = packOptionsHTML;
    } catch (error) {
        console.error("Error loading pack data:", error);
    }

    try {
        const response = await fetch('characters.json');
        characters = await response.json();
    } catch (error) {
        console.error("Error loading character data:", error);
    }
}

async function performMultiplePulls(packId, count) {
    let cost;
    try {
        const response = await fetch('packs.json');
        const packsData = await response.json();
        const pack = packsData.packs.find(p => p.id === packId);
        cost = pack.multiCost;
    } catch (error) {
        console.error("Error loading pack data:", error);
        return;
    }
    if (coins >= cost) {
        coins -= cost;
        updateCoinDisplay();
        const pullResultDiv = document.getElementById('pullResult');
        pullResultDiv.innerHTML = ''; // Clear previous results
        for (let i = 0; i < count; i++) {
            const pulledCharacter = drawCharacter(packId);
            if (pulledCharacter) {
                const characterDiv = document.createElement('div');
                characterDiv.innerText = `Pulled: ${pulledCharacter.name} (${pulledCharacter.rarity})`;
                pullResultDiv.appendChild(characterDiv);
                updateCollectedCharacters(pulledCharacter);
            }
        }
    } else {
        document.getElementById('pullResult').innerText = "Not enough coins!";
    }
}

async function performPull(packId) {
    let cost;
    try {
        const response = await fetch('packs.json');
        const packsData = await response.json();
        const pack = packsData.packs.find(p => p.id === packId);
        cost = pack.singleCost;
    } catch (error) {
        console.error("Error loading pack data:", error);
        return;
    }
    if (coins >= cost) {
        coins -= cost;
        updateCoinDisplay();
        const pulledCharacter = drawCharacter(packId);
        if (pulledCharacter) {
            console.log("Pulled character:", pulledCharacter);
            const pullResultDiv = document.getElementById('pullResult');
            pullResultDiv.innerHTML = `Pulled: ${pulledCharacter.name} (${pulledCharacter.rarity})`;
            updateCollectedCharacters(pulledCharacter);
        }
    } else {
        document.getElementById('pullResult').innerText = "Not enough coins!";
    }
}

function updateCollectedCharacters(pulledCharacter) {
    if (collectedCharacters[pulledCharacter.name]) {
        collectedCharacters[pulledCharacter.name].count++;
        console.log("Character count updated:", collectedCharacters[pulledCharacter.name]);
    } else {
        collectedCharacters[pulledCharacter.name] = { ...pulledCharacter, count: 1 };
        console.log("Character added to collection:", collectedCharacters[pulledCharacter.name]);
    }

    // Calculate level
    const drawCount = collectedCharacters[pulledCharacter.name].count;
    let level = 1;
    if (drawCount >= 100) {
        level = 5;
    } else if (drawCount >= 40) {
        level = 4;
    } else if (drawCount >= 15) {
        level = 3;
    } else if (drawCount >= 5) {
        level = 2;
    }
    collectedCharacters[pulledCharacter.name].level = level;
    collectedCharacters[pulledCharacter.name].xp = drawCount;
}

function updateCollectionDisplay(sortBy) {
    let collectionHTML = '';
    let sortedCharacters = Object.entries(collectedCharacters);

    if (sortBy === 'alphabetical') {
        sortedCharacters.sort(([, a], [, b]) => a.name.localeCompare(b.name));
    } else if (sortBy === 'level') {
        sortedCharacters.sort(([, a], [, b]) => b.level - a.level);
    } else if (sortBy === 'rarity') {
        const rarityOrder = { 'Common': 1, 'Rare': 2, 'Legendary': 3 };
        sortedCharacters.sort(([, a], [, b]) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    }

    if (sortedCharacters.length === 0) {
        collectionHTML += '<p>No characters collected yet.</p>';
    } else {
        for (const [characterName, character] of sortedCharacters) {
            const levelThresholds = [0, 5, 15, 40, 100];
            const nextLevelDraws = levelThresholds[character.level];
            const progress = character.level < 5 ? (character.count - levelThresholds[character.level - 1]) / (nextLevelDraws - levelThresholds[character.level - 1]) * 100 : 100;

            const currentXP = character.count;
            let level = 1;
            if (character.count >= 100) {
                level = 5;
            } else if (character.count >= 40) {
                level = 4;
            } else if (character.count >= 15) {
                level = 3;
            } else if (character.count >= 5) {
                level = 2;
            }
            const nextLevelXP = level < 5 ? levelThresholds[character.level] : currentXP;
            const remainingXP = level < 5 ? nextLevelXP - currentXP : 0;

            collectionHTML += `<div class="character-icon">
                <img src="${character.image}" alt="${character.name}">
                <div class="character-info">
                    <p class="character-name">${character.name}</p>
                    <p class="character-rarity">${character.rarity}</p>
                    <p>Level ${character.level} (XP: ${currentXP}/${nextLevelXP})</p>
                    <div class="experience-bar-container">
                        <div class="experience-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>`;
        }
    }
    document.getElementById('collection-content').innerHTML = collectionHTML;
}

function showCollection() {
    console.log("showCollection called");
    document.getElementById('content').innerHTML = `
        <h1>Character Collection</h1>
        <div class="sort-options">
            <label for="sortBy">Sort By:</label>
            <select id="sortBy">
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="level">Level</option>
                <option value="rarity">Rarity</option>
            </select>
        </div>
        <div id="collection-content"></div>
    `;
    setActiveNav('collection');

    const sortBySelect = document.getElementById('sortBy');
    sortBySelect.value = currentSortOption; // Set the select value to the current sort option
    sortBySelect.addEventListener('change', () => {
        currentSortOption = sortBySelect.value; // Update the current sort option
        updateCollectionDisplay(currentSortOption);
    });

    updateCollectionDisplay(currentSortOption); // Use the current sort option
}

function setActiveNav(page) {
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(button => button.classList.remove('active'));
    const activeButton = document.querySelector(`nav button[onclick="show${page.charAt(0).toUpperCase() + page.slice(1)}()"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Show the home page by default
showHome();
updateCoinDisplay();
