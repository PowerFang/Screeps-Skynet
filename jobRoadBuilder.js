

var jobRoadBuilder = {
  /*
  Jobs are simple tasks with limited logic - it expects all key variables to be set in memory
  */
    
    /** @param {Creep} creep **/
    run: function (creep) {                
        var valid = this.validateJob(creep);
      // If the creep is not valid for the job, exit
      if(!valid){
          return;
      }

      // Get Road Start
      var roadStart = Game.getObjectById(creep.memory.startId);
      var roadEnd = Game.getObjectById(creep.memory.endId);
        
        // If start or end objects dont exist, abort
      if (!roadStart || !roadEnd) {
          this.completeJob(creep, 'IDLE');
      }
        
      if (!creep.memory.startPath) {
          creep.memory.startPath = creep.pos.findPathTo(roadStart);
      }

      if (creep.pos.getRangeTo(roadStart) == 1) {
          creep.memory.atStart = 1;
      }

      if (creep.memory.atStart == 1) {
          creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);          
          var result = creep.moveByPath(creep.memory.roadPath);
          if (!creep.memory.roadPath) {
              creep.memory.roadPath = creep.pos.findPathTo(roadEnd, '{ignoreCreeps: true}');
          }
          var result = creep.moveByPath(creep.memory.roadPath);          
          if (creep.pos.getRangeTo(roadEnd) == 1) {
              roadStart.memory[creep.memory.roadName] = 'DONE';
              this.completeJob(creep, 'IDLE');
          }
      } else {
          var result = creep.moveByPath(creep.memory.startPath);          
      }

      
      
    },
    
  /** @param {Creep} creep **/
  validateJob: function(creep) {
      var startId = creep.memory.startId;
      var endId = creep.memory.endId;
      if(!startId || !endId){
          this.completeJob(creep, 'ERROR');
          creep.say('X');
          return false;
      } else {
          return true;
      }
  },
    completeJob: function(creep, status) {
        creep.memory.status = status;
        creep.memory.startId = null;
        creep.memory.endId = null;
        creep.memory.roadPath = null;
        creep.memory.startPath = null;
        creep.memory.jobType = null;
        creep.memory.atStart = null;
        creep.memory.roadName = null;
    }


};

//noinspection JSUnresolvedVariable
module.exports = jobRoadBuilder;