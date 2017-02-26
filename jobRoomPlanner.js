var jobRoomPlanner = {
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
      var destination = Game.getObjectById(creep.memory.buildId);

      // Sets the path if its not already done
      if(!creep.memory.buildPath){
          creep.memory.buildPath = creep.pos.findPathTo(destination);
      }

      // Try build the destination
      var buildResult = creep.build(destination);
      
      // If destination not in range, lets move towards it by the path
      if(buildResult == ERR_NOT_IN_RANGE){
          creep.moveByPath(creep.memory.buildPath);
      // This can occur if the building is finished
      } else if(buildResult == ERR_INVALID_TARGET){
          this.completeJob(creep, 'IDLE');
      } else {
          creep.say(creep.carry.energy);
      }

      // If creep is out of energy, job is complete
      if(creep.carry.energy == 0){
          this.completeJob(creep, 'IDLE');
      }
  },
  
  /** @param {Creep} creep **/
  validateJob: function(creep) {
      var buildId = creep.memory.buildId;
      if(!buildId){
          this.completeJob(creep, 'ERROR');
          creep.say('X');
          return false;
      } else {
          return true;
      }
  },
    completeJob: function(creep, status) {
        creep.memory.status = status;
        creep.memory.buildId = null;
        creep.memory.buildPath = null;
        creep.memory.jobType = null;
    }


};

//noinspection JSUnresolvedVariable
module.exports = RoomPlanner;