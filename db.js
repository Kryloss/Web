// IndexedDB setup
let db;
const request = indexedDB.open("gym_planner_db", 1);
request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
    }
};
request.onsuccess = function(e) {
    db = e.target.result;
};
request.onerror = function(e) {
    console.error('DB error', e);
};
