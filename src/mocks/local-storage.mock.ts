class LocalStorage {
    private readonly items: Map<string, string> = new Map<string, string>();

    /**
     * Retrieves the value associated with the given key.
     * @param key - The key of the item to retrieve.
     * @returns The value associated with the key, or undefined if the key does not exist.
     */
    public getItem(key: string): string | undefined {
        return this.items.get(key);
    }

    /**
     * Sets the value for the given key.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    public setItem(key: string, value: string): void {
        this.items.set(key, value);
    }

    /**
     * Removes the item with the given key.
     * @param key - The key of the item to remove.
     * @returns True if the item was removed, false otherwise.
     */
    public removeItem(key: string): boolean {
        return this.items.delete(key);
    }
}

// Exporting as singleton
export const localStorage = new LocalStorage();