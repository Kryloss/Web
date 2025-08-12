let db;

export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('gym-planner', 1);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            db.createObjectStore('data', { keyPath: 'id' });
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(); };
        request.onerror = (e) => reject(e);
    });
}

export async function saveData(state) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('data', 'readwrite');
        const store = tx.objectStore('data');
        store.put({ id: 'state', value: state });
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function loadData(defaultState) {
    return new Promise((resolve) => {
        const tx = db.transaction('data', 'readonly');
        const store = tx.objectStore('data');
        const req = store.get('state');
        req.onsuccess = () => {
            if (req.result) resolve(req.result.value);
            else resolve(defaultState);
        };
        req.onerror = () => resolve(defaultState);
    });
}