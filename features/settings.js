// features/settings.js
(function(){
  const defaultTheme = {
    primary: '#34d399', // teal/green
    secondary: '#60a5fa', // blue
    font: 'system'
  };
  const defaultSettings = {
    unitWeight: 'kg',
    unitMass: 'g',
    theme: defaultTheme
  };
  function mergeSettings(a,b){ return Object.assign({}, a, b, { theme: Object.assign({}, a.theme, b.theme) }); }
  function getSettings(){
    const s = DB.loadSettings();
    return s ? mergeSettings(defaultSettings, s) : $$.deepClone(defaultSettings);
  }
  function setSettings(s){ DB.saveSettings(s); }
  window.Settings = { getSettings, setSettings };
})();
