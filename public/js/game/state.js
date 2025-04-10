let playerStats = null;

export function setPlayerStats(stats) {
    if (!playerStats) {
        playerStats = stats; // Initial setup
    } else {
        // Merge updates without replacing the object
        for (const playerId in stats) {
            if (!playerStats[playerId]) {
                playerStats[playerId] = stats[playerId];
            } else {
                Object.assign(playerStats[playerId], stats[playerId]);
                // Special handling for activeEffects to preserve reference
                playerStats[playerId].activeEffects = stats[playerId].activeEffects;
            }
        }
    }
}

export function getPlayerStats() {
    return playerStats;
}

