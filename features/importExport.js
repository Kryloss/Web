// features/importExport.js
(function(){
  function exportJSON(state){
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gym-planner-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function importJSON(onData){
    const fileInput = document.getElementById('import-file');
    const handler = (e)=>{
      const f = e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          onData && onData(data);
        }catch(err){ alert('Invalid JSON'); }
      };
      reader.readAsText(f);
      fileInput.value = '';
      fileInput.removeEventListener('change', handler);
    };
    fileInput.addEventListener('change', handler);
    fileInput.click();
  }
  window.IOJson = { exportJSON, importJSON };
})();
