// core/inputOverlay.js
(function(){
  function ensureInputEl(){
    let el = document.querySelector('.overlay-input');
    if(!el){
      el = document.createElement('input');
      el.className = 'overlay-input hidden';
      el.autocapitalize = 'sentences';
      el.autocomplete = 'off';
      el.spellcheck = false;
      document.body.appendChild(el);
    }
    return el;
  }
  function showOverlayInput({x,y,w,h,type='text',value='',placeholder='', onCommit, onCancel}){
    const el = ensureInputEl();
    el.type = type === 'multiline' ? 'text' : type; // keep single-line; can extend to textarea if needed
    el.value = value||'';
    el.placeholder = placeholder||'';
    el.style.left = Math.round(x)+'px';
    el.style.top = Math.round(y)+'px';
    el.style.width = Math.round(w)+'px';
    el.style.height = Math.round(h)+'px';
    el.classList.remove('hidden');
    el.focus({ preventScroll: false });
    const onBlur = () => { commit(); };
    const onKey = (e)=>{
      if(e.key === 'Enter' && type !== 'multiline'){ commit(); }
      else if(e.key === 'Escape'){ cancel(); }
    };
    function cleanup(){
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
      el.classList.add('hidden');
    }
    function commit(){
      const val = el.value;
      cleanup();
      onCommit && onCommit(val);
    }
    function cancel(){
      cleanup();
      onCancel && onCancel();
    }
    el.addEventListener('blur', onBlur, {once:true});
    el.addEventListener('keydown', onKey);
    return {commit, cancel};
  }
  window.InputOverlay = { showOverlayInput };
})();
