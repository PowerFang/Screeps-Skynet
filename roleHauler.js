var roleHauler = {
  
  /** @param {Creep} creep **/
  run: function(creep) {
      var status = creep.memory.status;
      var deliverId = creep.memory.deliverId;
      if(!deliverId & status != 'IDLE' ){
          creep.memory.status = 'IDLE';
      }
      console.log('Running roleMiner ' + status);
      switch(status) {
          case 'DELIVERING':
              if(creep.carry.energy == 0){
                  creep.memory.role = 'MINER';
                  creep.memory.status = 'IDLE';
              }
              var destination = Game.getObjectById(deliverId);
              if(creep.transfer(destination, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                  creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
              }

              break;
          default:
            creep.memory.status = 'IDLE';
            break;
      }
  }
    
};

module.exports = roleHauler;