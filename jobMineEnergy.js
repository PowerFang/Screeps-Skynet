var jobMineEnergy = {
  /*
  Jobs are simple tasks with limited logic - it expects all key variables to be set in memory
  */
  /** @param {Creep} creep **/
  run: function(creep) {
      var valid = this.validateJob(creep);
      // If the creep is not valid for the job, exit
      if(!valid){
          return;
      }
      // Get the Destination
      var destination = Game.getObjectById(creep.memory.sourceId);

      // Sets the path if its not already done
      if(!creep.memory.sourcePath){
          creep.memory.sourcePath = creep.pos.findPathTo(destination);
      }

      // Mine from source or move towards it
      if(creep.harvest(destination) == ERR_NOT_IN_RANGE){
          var moveResult = creep.moveByPath(creep.memory.sourcePath);
          var stuck = creep.isCreepStuck();
          if(stuck){
              creep.memory.sourcePath = null;
          }
      } else {
          creep.say(Math.floor((creep.carry.energy / creep.carryCapacity) * 100) + '%');
      }

      // If creep is out of energy, job is complete
      if(creep.carry.energy == creep.carryCapacity){
          creep.memory.status = 'IDLE';
          this.clearJobData(creep);
      }
  },
  
  /** @param {Creep} creep **/
  validateJob: function(creep) {
      var sourceId = creep.memory.sourceId;
      if(!sourceId){
          creep.memory.status = 'ERROR';
          this.clearJobData(creep);
          creep.say('ERROR');
          return false;
      } else {
          return true;
      }
  },
    clearJobData: function(creep) {
        creep.memory.sourceId = null;
        creep.memory.sourcePath = null;
        creep.memory.jobType = null;
    }
    
};

//noinspection JSUnresolvedVariable
module.exports = jobMineEnergy;