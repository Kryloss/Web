// db.js - IndexedDB for data, localStorage for settings
(function(){
  const DB_NAME = 'gymplanner';
  const DB_VERSION = 1;
  const STORE = 'appdata'; // single-document for simplicity

  function openDB(){
    return new Promise((resolve, reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e)=>{
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)){
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
    });
  }

  async function readState(){
    const db = await openDB();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const get = store.get('state');
      get.onsuccess = ()=> resolve(get.result || null);
      get.onerror = ()=> reject(get.error);
    });
  }

  async function writeState(state){
    const db = await openDB();
    return new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const put = store.put(state, 'state');
      put.onsuccess = ()=> resolve();
      put.onerror = ()=> reject(put.error);
    });
  }

  function loadSettings(){
    try {
      const raw = localStorage.getItem('settings');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function saveSettings(s){
    localStorage.setItem('settings', JSON.stringify(s||{}));
  }

  window.DB = { readState, writeState, loadSettings, saveSettings };
})();
