// features/undo.js
(function(){
  class UndoStack {
    constructor(limit=50){
      this.stack = [];
      this.index = -1;
      this.limit = limit;
    }
    push(state){
      // Drop anything after index
      this.stack = this.stack.slice(0, this.index+1);
      this.stack.push($$.deepClone(state));
      if(this.stack.length > this.limit) this.stack.shift();
      this.index = this.stack.length - 1;
    }
    canUndo(){ return this.index > 0; }
    canRedo(){ return this.index < this.stack.length - 1; }
    undo(){ if(this.canUndo()){ this.index--; return $$.deepClone(this.stack[this.index]); } return null; }
    redo(){ if(this.canRedo()){ this.index++; return $$.deepClone(this.stack[this.index]); } return null; }
    peek(){ return this.index>=0 ? $$.deepClone(this.stack[this.index]) : null; }
  }
  window.UndoStack = UndoStack;
})();
