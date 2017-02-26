var roleMiner = {
  
  /** @param {Creep} creep **/
  run: function(creep) {
      var status = creep.memory.status;
      var targetId = creep.memory.targetId;
      if(!targetId & status != 'IDLE' ){
          creep.memory.status = 'IDLE';
      }
      console.log('Running roleMiner ' + status);
      switch(status) {
          case 'COLLECTING':
              if(creep.carry.energy == creep.carryCapacity && creep.carryCapacity > 0){
                  creep.memory.role = 'HAULER';
                  creep.memory.status = 'IDLE';
              }              
              var source = Game.getObjectById(targetId);
              console.log(creep.harvest(source));
              if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                  var result = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                  creep.say(result);
              }

              break;
          default:
            creep.memory.status = 'IDLE';
            break;
      }
  }
    
};

module.exports = roleMiner;