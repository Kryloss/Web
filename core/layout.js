// core/layout.js
(function(){
  function layoutSafe(scene){
    const insets = $$.safeAreaInsets();
    return {
      x: insets.left, y: insets.top,
      w: scene.frame.w - insets.left - insets.right,
      h: scene.frame.h - insets.top - insets.bottom
    };
  }
  window.Layout = { layoutSafe };
})();
