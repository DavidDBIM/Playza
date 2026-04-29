export class PatternManager {
    constructor(engine) {
        this.engine = engine;
        this.lastPatternId = null;
    }

    createPattern(anchorZ, biome, difficulty) {
        const patternId = this.selectPatternId(difficulty);
        const pattern = this.buildPattern(patternId, anchorZ, biome, difficulty);

        if (this.validatePattern(pattern.rows, difficulty.laneCount)) {
            this.lastPatternId = pattern.id;
            return pattern;
        }

        const fallback = this.buildFallbackCorridor(anchorZ, biome, difficulty);
        this.lastPatternId = fallback.id;
        return fallback;
    }

    selectPatternId(difficulty) {
        const weighted = Object.entries(difficulty.weights)
            .filter(([, weight]) => weight > 0)
            .map(([id, weight]) => ({ id, weight: id === this.lastPatternId ? weight * 0.2 : weight }));

        const total = weighted.reduce((sum, item) => sum + item.weight, 0);
        let cursor = Math.random() * total;

        for (const item of weighted) {
            cursor -= item.weight;
            if (cursor <= 0) {
                return item.id;
            }
        }

        return weighted[0]?.id || 'singleBlock';
    }

    buildPattern(id, anchorZ, biome, difficulty) {
        switch (id) {
            case 'alternating':
                return this.buildAlternating(anchorZ, biome, difficulty);
            case 'safeCorridor':
                return this.buildSafeCorridor(anchorZ, biome, difficulty);
            case 'mixedCombo':
                return this.buildMixedCombo(anchorZ, biome, difficulty);
            case 'staggered':
                return this.buildStaggered(anchorZ, biome, difficulty);
            case 'movingCombo':
                return this.buildMovingCombo(anchorZ, biome, difficulty);
            case 'gateThread':
                return this.buildGateThread(anchorZ, biome, difficulty);
            case 'squeeze':
                return this.buildSqueeze(anchorZ, biome, difficulty);
            case 'singleBlock':
            default:
                return this.buildSingleBlock(anchorZ, biome, difficulty);
        }
    }

    buildSingleBlock(anchorZ, biome, difficulty) {
        const safeLane = this.getRandomLane(difficulty.laneCount);
        const blockedLane = this.getRandomLane(difficulty.laneCount, [safeLane]);
        const rows = [
            this.makeRow(0, [
                this.makeBarrier(blockedLane, biome)
            ])
        ];

        return this.finalizePattern('singleBlock', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    buildAlternating(anchorZ, biome, difficulty) {
        const rows = [];
        let safeLane = this.getRandomLane(difficulty.laneCount);
        const rowCount = Math.min(3, difficulty.maxRowsPerPattern);

        for (let index = 0; index < rowCount; index += 1) {
            if (index > 0 && Math.random() < 0.55) {
                safeLane = this.shiftLane(safeLane, difficulty.laneCount);
            }

            const blockedLane = this.getRandomLane(difficulty.laneCount, [safeLane]);
            rows.push(this.makeRow(-index * difficulty.rowSpacing, [
                this.makeBarrier(blockedLane, biome)
            ]));
        }

        return this.finalizePattern('alternating', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    buildSafeCorridor(anchorZ, biome, difficulty) {
        const rows = [];
        let corridorLane = this.getRandomLane(difficulty.laneCount);
        const rowCount = difficulty.maxRowsPerPattern;

        for (let index = 0; index < rowCount; index += 1) {
            if (index > 0 && Math.random() < 0.35) {
                corridorLane = this.shiftLane(corridorLane, difficulty.laneCount);
            }

            const blockedLanes = this.getAllLanes(difficulty.laneCount).filter((lane) => lane !== corridorLane);
            rows.push(this.makeRow(-index * difficulty.rowSpacing, blockedLanes.map((lane) => {
                const type = Math.random() < difficulty.movingVehicleChance * 0.45 ? 'drone' : 'blocker';
                return type === 'drone'
                    ? this.makeVehicle(lane, biome, difficulty, false)
                    : this.makeBarrier(lane, biome);
            })));
        }

        return this.finalizePattern('safeCorridor', anchorZ, biome, difficulty, rows, [corridorLane]);
    }

    buildMixedCombo(anchorZ, biome, difficulty) {
        const laneCount = difficulty.laneCount;
        const safeLane = this.getRandomLane(laneCount);
        const blocked = this.getAllLanes(laneCount).filter((lane) => lane !== safeLane);
        const firstBlocked = blocked[Math.floor(Math.random() * blocked.length)];
        const secondBlocked = blocked.find((lane) => lane !== firstBlocked) ?? firstBlocked;
        const followUpBarrierLane = blocked.find((lane) => lane !== secondBlocked) ?? firstBlocked;

        const rows = [
            this.makeRow(0, [
                this.makeBarrier(firstBlocked, biome),
                this.makeVehicle(secondBlocked, biome, difficulty, Math.random() < difficulty.movingVehicleChance)
            ]),
            this.makeRow(-difficulty.rowSpacing, [
                this.makeBarrier(followUpBarrierLane, biome)
            ])
        ];

        return this.finalizePattern('mixedCombo', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    buildStaggered(anchorZ, biome, difficulty) {
        const rows = [];
        let safeLane = this.getRandomLane(difficulty.laneCount);
        const rowCount = Math.min(4, difficulty.maxRowsPerPattern);

        for (let index = 0; index < rowCount; index += 1) {
            if (index > 0 && Math.random() < 0.6) {
                safeLane = this.shiftLane(safeLane, difficulty.laneCount);
            }

            const blockedLane = this.getRandomLane(difficulty.laneCount, [safeLane]);
            const type = index % 2 === 0 ? 'blocker' : 'drone';
            rows.push(this.makeRow(-index * difficulty.rowSpacing, [
                type === 'drone'
                    ? this.makeVehicle(blockedLane, biome, difficulty, Math.random() < difficulty.movingVehicleChance)
                    : this.makeBarrier(blockedLane, biome)
            ]));
        }

        return this.finalizePattern('staggered', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    buildMovingCombo(anchorZ, biome, difficulty) {
        const laneCount = difficulty.laneCount;
        const safeLane = this.getRandomLane(laneCount);
        const blockedChoices = this.getAllLanes(laneCount).filter((lane) => lane !== safeLane);
        const vehicleLane = blockedChoices[Math.floor(Math.random() * blockedChoices.length)];
        const barrierLane = blockedChoices.find((lane) => lane !== vehicleLane) ?? blockedChoices[0];

        const rows = [
            this.makeRow(0, [
                this.makeVehicle(vehicleLane, biome, difficulty, true),
                this.makeBarrier(barrierLane, biome)
            ]),
            this.makeRow(-difficulty.rowSpacing * 1.15, [
                this.makeBarrier(this.clampLane(safeLane + (safeLane === 0 ? 1 : -1), laneCount), biome)
            ])
        ];

        return this.finalizePattern('movingCombo', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    buildGateThread(anchorZ, biome, difficulty) {
        const laneCount = difficulty.laneCount;
        let runLane = this.getRandomLane(laneCount);
        const rows = [];
        const rowCount = Math.max(2, Math.min(4, difficulty.maxRowsPerPattern));

        for (let index = 0; index < rowCount; index += 1) {
            if (index > 0 && Math.random() < 0.52) {
                runLane = this.shiftLane(runLane, laneCount);
            }

            const blockedLane = this.getRandomLane(laneCount, [runLane]);
            const entries = [this.makeBarrier(blockedLane, biome)];
            if (Math.random() < difficulty.slideGateChance) {
                entries.push(this.makeSlideGate(runLane, biome));
            }
            rows.push(this.makeRow(-index * difficulty.rowSpacing, entries));
        }

        return this.finalizePattern('gateThread', anchorZ, biome, difficulty, rows, [runLane]);
    }

    buildSqueeze(anchorZ, biome, difficulty) {
        const laneCount = difficulty.laneCount;
        const safeLane = this.getRandomLane(laneCount);
        const firstWall = this.getAllLanes(laneCount).filter((lane) => lane !== safeLane);
        const secondSafe = this.shiftLane(safeLane, laneCount);
        const secondWall = this.getAllLanes(laneCount).filter((lane) => lane !== secondSafe);

        const rows = [
            this.makeRow(0, firstWall.map((lane) => this.makeBarrier(lane, biome))),
            this.makeRow(-difficulty.rowSpacing * 0.92, [
                this.makeVehicle(safeLane, biome, difficulty, Math.random() < difficulty.movingVehicleChance),
                ...secondWall.filter((lane) => lane !== safeLane).map((lane) => (
                    Math.random() < difficulty.slideGateChance
                        ? this.makeSlideGate(lane, biome)
                        : this.makeBarrier(lane, biome)
                ))
            ])
        ];

        return this.finalizePattern('squeeze', anchorZ, biome, difficulty, rows, [safeLane, secondSafe]);
    }

    buildFallbackCorridor(anchorZ, biome, difficulty) {
        const safeLane = this.getRandomLane(difficulty.laneCount);
        const rows = [
            this.makeRow(0, this.getAllLanes(difficulty.laneCount)
                .filter((lane) => lane !== safeLane)
                .map((lane) => this.makeBarrier(lane, biome)))
        ];

        return this.finalizePattern('fallbackCorridor', anchorZ, biome, difficulty, rows, [safeLane]);
    }

    finalizePattern(id, anchorZ, biome, difficulty, rows, preferredSafeLanes = []) {
        const safeLanes = this.resolveSafeLanes(rows, difficulty.laneCount, preferredSafeLanes);
        let coins = [];
        const primarySafeLane = safeLanes[safeLanes.length - 1] ?? preferredSafeLanes[0] ?? 0;
        const coinPattern = this.selectCoinPattern(id, difficulty);
        const minimumCoins = difficulty.forceCoins ? 10 : difficulty.event?.type === 'challenge' ? 4 : 6;

        if (coinPattern === 'wave') {
            coins = this.createCoinWave(safeLanes, anchorZ - 1.2, difficulty);
        } else if (coinPattern === 'arc') {
            coins = this.createCoinArc(primarySafeLane, anchorZ - 1.0, difficulty);
        } else if (coinPattern === 'zigzag') {
            coins = this.createCoinZigZag(safeLanes, anchorZ - 1.0, difficulty);
        } else if (coinPattern === 'risk') {
            coins = this.createRiskCoins(rows, anchorZ, primarySafeLane, difficulty);
        } else {
            // Default 'line': one line per safe lane
            safeLanes.forEach((lane, index) => {
                const z = anchorZ - index * difficulty.rowSpacing;
                coins.push(...this.createCoinLine(lane, z - 1.2, 6 + Math.round(3 * difficulty.coinMultiplier), 1.25, 1.25));
            });
        }

        if (coins.length < minimumCoins) {
            coins.push(...this.createCoinLine(primarySafeLane, anchorZ - 1.4, minimumCoins - coins.length, 1.05, 1.25));
        }

        coins = this.limitCoins(coins, Math.round(10 + difficulty.coinMultiplier * 8));

        const powerup = Math.random() < difficulty.powerupChance
            ? { lane: primarySafeLane, z: anchorZ - difficulty.rowSpacing * 0.5, height: 1.5 }
            : null;

        return {
            id,
            biome,
            anchorZ,
            rows,
            obstacles: rows.flatMap((row) => row.entries.map((entry) => ({
                ...entry,
                z: anchorZ + row.zOffset
            }))),
            coins,
            coinPattern,
            powerup,
            // Cap length to spawnSpacing so multi-row patterns don’t leave huge dead gaps.
            // The rows themselves overlap within the pattern — only the gap BETWEEN
            // patterns is controlled here.
            length: difficulty.spawnSpacing
        };
    }

    validatePattern(rows, laneCount) {
        if (!rows.length) {
            return false;
        }

        const orderedRows = [...rows].sort((a, b) => b.zOffset - a.zOffset);
        let reachable = this.getOpenLanes(orderedRows[0], laneCount);

        if (!reachable.length) {
            return false;
        }

        for (let index = 1; index < orderedRows.length; index += 1) {
            const openLanes = this.getOpenLanes(orderedRows[index], laneCount);
            reachable = openLanes.filter((lane) => reachable.some((previousLane) => Math.abs(previousLane - lane) <= 1));

            if (!reachable.length) {
                return false;
            }
        }

        return true;
    }

    resolveSafeLanes(rows, laneCount, preferredSafeLanes = []) {
        const result = [];
        let reachable = [];

        [...rows].sort((a, b) => b.zOffset - a.zOffset).forEach((row, index) => {
            const openLanes = this.getOpenLanes(row, laneCount);

            if (index === 0) {
                const preferred = preferredSafeLanes.find((lane) => openLanes.includes(lane));
                const chosen = preferred ?? openLanes[0];
                reachable = [chosen];
                result.push(chosen);
                return;
            }

            const candidates = openLanes.filter((lane) => reachable.some((previousLane) => Math.abs(previousLane - lane) <= 1));
            const chosen = candidates[candidates.length - 1] ?? openLanes[0];
            reachable = candidates.length ? candidates : [chosen];
            result.push(chosen);
        });

        return result;
    }

    getOpenLanes(row, laneCount) {
        const blocked = new Set(row.entries
            .filter((entry) => entry.type !== 'slideGate')
            .map((entry) => entry.lane));
        return this.getAllLanes(laneCount).filter((lane) => !blocked.has(lane));
    }

    createCoinLine(lane, z, count, spacing = 1.1, height = 1) {
        return Array.from({ length: count }, (_, index) => ({
            lane,
            z: z - index * spacing,
            height
        }));
    }

    selectCoinPattern(patternId, difficulty) {
        if (difficulty.forceCoins) {
            // Anti-dry: always pick a high-yield visible pattern
            const roll = Math.random();
            return roll < 0.4 ? 'wave' : roll < 0.7 ? 'zigzag' : 'line';
        }
        if (difficulty.event?.type === 'coinRush') {
            return Math.random() < 0.58 ? 'wave' : 'arc';
        }
        if (difficulty.event?.type === 'challenge') {
            // Challenge: prefer safe line or zigzag — risk coins in challenge zones
            // are too punishing and make the drought worse, not better.
            return Math.random() < 0.55 ? 'line' : 'zigzag';
        }
        // Risk coins: only when riskCoinChance is low (early-mid game) AND not forced
        // Cap risk chance at 0.22 so late-game difficulty doesn't flood with unreachable coins
        const effectiveRiskChance = Math.min(difficulty.riskCoinChance, 0.22);
        if (Math.random() < effectiveRiskChance) {
            return 'risk';
        }
        if (patternId === 'alternating' || patternId === 'staggered' || patternId === 'gateThread') {
            const roll = Math.random();
            return roll < 0.42 ? 'wave' : roll < 0.72 ? 'zigzag' : 'line';
        }
        const roll = Math.random();
        return roll < 0.28 ? 'arc' : roll < 0.55 ? 'zigzag' : 'line';
    }

    createCoinWave(safeLanes, z, difficulty) {
        const lanes = safeLanes.length ? safeLanes : [this.getRandomLane(difficulty.laneCount)];
        const count = Math.round(10 + difficulty.coinMultiplier * 7);
        return Array.from({ length: count }, (_, index) => {
            const lane = lanes[index % lanes.length];
            return {
                lane,
                z: z - index * 1.05,
                height: 1.05 + Math.sin(index * 0.72) * 0.34
            };
        });
    }

    createCoinArc(centerLane, z, difficulty) {
        const lanes = this.getAllLanes(difficulty.laneCount);
        const count = Math.round(9 + difficulty.coinMultiplier * 6);
        return Array.from({ length: count }, (_, index) => {
            const lane = lanes[Math.abs((index % 5) - 2) % lanes.length] ?? centerLane;
            const blendLane = Math.random() < 0.7 ? lane : centerLane;
            return {
                lane: this.clampLane(blendLane, difficulty.laneCount),
                z: z - index * 1.08,
                height: 1.05 + Math.sin((index / Math.max(1, count - 1)) * Math.PI) * 1.05
            };
        });
    }

    createRiskCoins(rows, anchorZ, fallbackLane, difficulty) {
        const coins = [];
        rows.forEach((row, rowIndex) => {
            const openLanes = this.getOpenLanes(row, difficulty.laneCount);
            const openLane = openLanes[0] ?? fallbackLane;

            // Risk coins: place NEAR obstacle but on the open (safe) lane.
            // A small fraction (15%) are placed adjacent to obstacles for risk/reward,
            // but NEVER directly on a fatal blocked lane.
            const useAdjacentRisk = Math.random() < 0.15 && openLanes.length > 0;
            const targetLane = useAdjacentRisk
                ? this.clampLane(openLane + (Math.random() < 0.5 ? 1 : -1), difficulty.laneCount)
                : openLane;

            // Verify the chosen lane is actually open (adjacent shift might land on a blocked lane)
            const resolvedLane = openLanes.includes(targetLane) ? targetLane : openLane;

            coins.push(...this.createCoinLine(
                this.clampLane(resolvedLane, difficulty.laneCount),
                anchorZ + row.zOffset - 0.9,
                rowIndex === 0 ? 5 : 4,
                1.0,
                1.2
            ));
        });
        return coins;
    }

    createCoinZigZag(safeLanes, anchorZ, difficulty) {
        // Alternates between safe lanes creating a visible zig-zag trail
        const lanes = safeLanes.length >= 2 ? safeLanes : [
            ...safeLanes,
            this.clampLane((safeLanes[0] ?? 1) + 1, difficulty.laneCount)
        ];
        const count = Math.round(8 + difficulty.coinMultiplier * 6);
        return Array.from({ length: count }, (_, index) => ({
            lane: lanes[index % lanes.length],
            z: anchorZ - index * 1.1,
            height: 1.15
        }));
    }

    limitCoins(coins, maxCoins) {
        // Always guarantee at least 6 coins survive the cap
        const hardMin = Math.min(6, coins.length);
        const effectiveMax = Math.max(maxCoins, hardMin);
        if (coins.length <= effectiveMax) {
            return coins;
        }
        const stride = coins.length / effectiveMax;
        return Array.from({ length: effectiveMax }, (_, index) => coins[Math.floor(index * stride)]);
    }

    makeRow(zOffset, entries) {
        return { zOffset, entries };
    }

    makeBarrier(lane, biome) {
        return { lane, type: 'blocker', biome, movement: null };
    }

    makeVehicle(lane, biome, difficulty, moving = false) {
        return {
            lane,
            type: 'drone',
            biome,
            movement: moving
                ? {
                    mode: 'cruise',
                    speed: 4 + difficulty.level * 1.35
                }
                : null
        };
    }

    makeSlideGate(lane, biome) {
        return { lane, type: 'slideGate', biome, movement: null };
    }

    getAllLanes(laneCount) {
        return Array.from({ length: laneCount }, (_, index) => index);
    }

    getRandomLane(laneCount, excluded = []) {
        const lanes = this.getAllLanes(laneCount).filter((lane) => !excluded.includes(lane));
        return lanes[Math.floor(Math.random() * lanes.length)] ?? 0;
    }

    shiftLane(lane, laneCount) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        return this.clampLane(lane + direction, laneCount);
    }

    clampLane(lane, laneCount) {
        return Math.max(0, Math.min(laneCount - 1, lane));
    }
}
