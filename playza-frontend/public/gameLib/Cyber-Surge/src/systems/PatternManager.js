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
        const coins = [];
        const primarySafeLane = safeLanes[safeLanes.length - 1] ?? preferredSafeLanes[0] ?? 0;
        const lastRow = rows[rows.length - 1];

        safeLanes.forEach((lane, index) => {
            const z = anchorZ - index * difficulty.rowSpacing;
            // 8 coins per safe lane at 1.3 units apart, at y=1.3 (clearly visible)
            coins.push(...this.createCoinLine(lane, z - 1.2, 8, 1.3, 1.3));
        });

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
        const blocked = new Set(row.entries.map((entry) => entry.lane));
        return this.getAllLanes(laneCount).filter((lane) => !blocked.has(lane));
    }

    createCoinLine(lane, z, count, spacing = 1.1, height = 1) {
        return Array.from({ length: count }, (_, index) => ({
            lane,
            z: z - index * spacing,
            height
        }));
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
