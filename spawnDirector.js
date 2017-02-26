var spawnDirector = {
  
  /** @param {StructureSpawn} spawn - The spawn that needs help**/
  run: function(spawn) {
      
      var roomType = spawn.room.memory.roomType;
      switch(roomType) {
          case 'CORE':
            break;
          default:
            spawn.room.memory.roomType = 'CORE';
            break;
      }
      spawn.room.visual.text(
            'Room: ' + roomType,
            spawn.pos.x + 1, 
            spawn.pos.y, 
            {align: 'left', opacity: 0.8}
      );
      
    
  },
  /** @param {Creep} creep **/
  move: function(creep) {
      
  }
    
};

module.exports = spawnDirector;