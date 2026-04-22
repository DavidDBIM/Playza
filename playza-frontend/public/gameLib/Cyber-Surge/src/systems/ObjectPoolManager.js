export class ObjectPoolManager {
    constructor(createItem, initialSize = 0) {
        this.createItem = createItem;
        this.pool = [];
        this.activeItems = new Set();

        for (let i = 0; i < initialSize; i += 1) {
            this.pool.push(this.createItem());
        }
    }

    acquire() {
        let item = this.pool.find((entry) => !entry.active);

        if (!item) {
            item = this.createItem();
            this.pool.push(item);
        }

        item.active = true;
        this.activeItems.add(item);
        return item;
    }

    release(item, onRelease) {
        if (!item) {
            return;
        }

        if (onRelease) {
            onRelease(item);
        }

        item.active = false;
        this.activeItems.delete(item);
    }

    reset(onRelease) {
        [...this.activeItems].forEach((item) => this.release(item, onRelease));
    }

    getActiveItems() {
        return [...this.activeItems];
    }
}
