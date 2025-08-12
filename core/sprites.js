// core/sprites.js
(function(){
  const sprite = new Image();
  sprite.src = './assets/icons.png';
  const map = {
    biceps: {x:0,y:0,w:128,h:128},
    pullups:{x:128,y:0,w:128,h:128},
    dumbbells:{x:256,y:0,w:128,h:128},
    legs:{x:384,y:0,w:128,h:128},
    add:{x:0,y:128,w:128,h:128},
    trash:{x:128,y:128,w:128,h:128},
    check:{x:256,y:128,w:128,h:128},
    dots:{x:384,y:128,w:128,h:128},
    week:{x:0,y:256,w:128,h:128},
    plan:{x:128,y:256,w:128,h:128},
    food:{x:256,y:256,w:128,h:128}
  };
  function drawIcon(ctx, name, x,y,size=24, tint=null){
    const s = map[name] || map.dumbbells;
    if(!s) return;
    ctx.save();
    if(tint){
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.drawImage(sprite, s.x, s.y, s.w, s.h, x, y, size, size);
    ctx.restore();
  }
  window.Sprites = { drawIcon };
})();