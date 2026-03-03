const STORAGE_KEY = 'pflegetracker_data';

const StorageManager = {
    save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    },

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
};

window.StorageManager = StorageManager;
