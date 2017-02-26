var jobDeliverEnergy = {
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
      var destination = Game.getObjectById(creep.memory.job.deliverId);

      // Sets the path if its not already done
      if(!creep.memory.job.deliverPath){
          creep.memory.job.deliverPath = creep.pos.findPathTo(destination);
      }

      // Transfer the energy or move to the destination
      if(creep.transfer(destination, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveByPath(creep.memory.job.deliverPath);
          var stuck = creep.isCreepStuck();
          if(stuck){
              creep.memory.sourcePath = null;
          }
      } else {
          creep.say('D: ' + creep.carry.energy);
      }

      // If destination is full of energy, job is complete
      if(destination.energy == destination.energyCapacity){
          creep.memory.status = 'DONE';
      }

      // If creep is out of energy, job is complete
      if(creep.carry.energy == 0){
          creep.memory.status = 'DONE';
      }
  },
  
  /** @param {Creep} creep **/
  validateJob: function(creep) {
      var deliverId = creep.memory.job.deliverId;
      if(!deliverId){
          creep.memory.status = 'ERROR';
          creep.memory.job = null;
          return false;
      } else {
          return true;
      }
  }
    
};

//noinspection JSUnresolvedVariable
module.exports = jobDeliverEnergy;