import * as THREE from 'three';

export class WorldLayout {
    constructor(config = {}) {
        this.laneCount = config.laneCount ?? 3;
        this.laneWidth = config.laneWidth ?? 2.5;
        this.roadHalfWidth = config.roadHalfWidth ?? 3.9;
        this.roadSafetyMargin = config.roadSafetyMargin ?? 3.1;
        this.tileLength = config.tileLength ?? 10;

        this.innerBuildingX = config.innerBuildingX ?? 10;
        this.outerBuildingX = config.outerBuildingX ?? 17;
        this.skylineX = config.skylineX ?? 36;
    }

    get roadMinX() {
        return -this.roadHalfWidth;
    }

    get roadMaxX() {
        return this.roadHalfWidth;
    }

    get environmentMinAbsX() {
        return this.roadHalfWidth + this.roadSafetyMargin;
    }

    getLaneX(lane) {
        const clampedLane = this.clampLane(lane);
        const centerIndex = (this.laneCount - 1) / 2;
        return (clampedLane - centerIndex) * this.laneWidth;
    }

    getCenterLane() {
        return Math.floor(this.laneCount / 2);
    }

    clampLane(lane) {
        return Math.max(0, Math.min(this.laneCount - 1, Math.round(lane)));
    }

    isInsideRoadX(x, padding = 0) {
        return x >= this.roadMinX - padding && x <= this.roadMaxX + padding;
    }

    isGameplayLane(lane) {
        return Number.isInteger(lane) && lane >= 0 && lane < this.laneCount;
    }

    isGameplayPositionValid(x) {
        return this.isInsideRoadX(x, 0.01);
    }

    getSideZoneX(side, column = 'inner') {
        const direction = side < 0 ? -1 : 1;
        return direction * (column === 'outer' ? this.outerBuildingX : this.innerBuildingX);
    }

    getSkylineX(side) {
        return (side < 0 ? -1 : 1) * this.skylineX;
    }

    enforceEnvironmentObject(object, side, minimumAbsX = this.environmentMinAbsX) {
        object.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(object);
        const direction = side < 0 ? -1 : 1;

        if (direction < 0 && box.max.x > -minimumAbsX) {
            object.position.x -= box.max.x + minimumAbsX;
        }

        if (direction > 0 && box.min.x < minimumAbsX) {
            object.position.x += minimumAbsX - box.min.x;
        }

        object.updateMatrixWorld(true);
        return !this.intersectsRoad(object);
    }

    intersectsRoad(object) {
        object.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(object);
        return box.max.x > this.roadMinX && box.min.x < this.roadMaxX;
    }

    validateEnvironmentObject(object, side, label = 'environment') {
        const valid = this.enforceEnvironmentObject(object, side);
        if (!valid) {
            console.warn(`[CyberSurge:world] ${label} rejected: intersects road zone`, object);
        }
        return valid;
    }
}
