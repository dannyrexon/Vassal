// Enhanced world generator with noise-based terrain, biomes, and hooks for rivers/coasts
// Requires: engine/simplex.js (SimplexNoise)

function createWorldGen(MAP_WIDTH, MAP_HEIGHT) {
    // Import SimplexNoise
    let SimplexNoise;
    if (typeof require !== 'undefined') {
        SimplexNoise = require('./simplex');
    } else {
        SimplexNoise = window.SimplexNoise;
    }

    function generate(settings) {
        const map = [];
        const noise = new SimplexNoise(settings.seed || 0);
        // Parameters for noise scaling
        const scale = settings.noise_scale || 0.05;
        // Biome thresholds
        const thresholds = {
            deep_water: -0.3,
            shallow_water: 0.0,
            sand: 0.08,
            grass: 0.25,
            forest: 0.45,
            mountain: 0.65,
            snow: 0.8
        };

        for (let y = 0; y < MAP_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                // Generate base height
                const nx = x * scale, ny = y * scale;
                const h = noise.noise(nx, ny);
                // Assign terrain type based on height
                let tile = 0;
                if (h < thresholds.deep_water) tile = 0; // Deep water
                else if (h < thresholds.shallow_water) tile = 1; // Shallow water
                else if (h < thresholds.sand) tile = 2; // Sand
                else if (h < thresholds.grass) tile = 3; // Grass
                else if (h < thresholds.forest) tile = 4; // Forest
                else if (h < thresholds.mountain) tile = 5; // Mountain
                else tile = 6; // Snow
                map[y][x] = tile;
            }
        }

        // Optionally add rivers (placeholder)
        if (settings.rivers) {
            generateRivers(map, settings.rivers);
        }

        // Smooth coasts
        generateCoasts(map);

        return map;
    }

    // Coast smoothing: mark sand tiles next to water
    function generateCoasts(map) {
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (map[y][x] === 2) { // sand
                    const n = [
                        map[y-1]?.[x],
                        map[y+1]?.[x],
                        map[y]?.[x-1],
                        map[y]?.[x+1]
                    ];
                    if (n.some(v => v === 0 || v === 1)) {
                        map[y][x] = 2; // keep as sand
                    } else if (n.some(v => v === 3)) {
                        map[y][x] = 3; // blend to grass
                    }
                }
            }
        }
    }

    // Placeholder for river generation
    function generateRivers(map, count) {
        // Simple river: random walk from top to bottom
        for (let r = 0; r < count; r++) {
            let x = Math.floor(Math.random() * MAP_WIDTH);
            let y = 0;
            for (; y < MAP_HEIGHT; y++) {
                if (map[y][x] > 1) map[y][x] = 1; // river (shallow water)
                // Randomly meander
                x += Math.floor(Math.random() * 3) - 1;
                if (x < 0) x = 0;
                if (x >= MAP_WIDTH) x = MAP_WIDTH - 1;
            }
        }
    }

    return { generate };
}