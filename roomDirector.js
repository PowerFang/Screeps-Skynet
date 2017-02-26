var roomDirector = {
    /** @param {Room} room - The spawn that needs help**/
    processRoom: function(room) {

        var roomCreeps = _.filter(Game.creeps, (c) => c.room.name == room.name);


      var roomType = room.memory.roomType;
      //var roomCreeps = room.find(FIND_MY_CREEPS);
      var sources = room.find(FIND_SOURCES);



      switch(roomType) {
        case 'HOME':
            this.checkMinimumCreeps(room,roomCreeps);
            this.checkUrgentDeliveryTargets(room, roomCreeps);
            this.assignJobs(room, roomCreeps);
            roomCreeps = room.find(FIND_MY_CREEPS);
            this.processRoomCreeps(roomCreeps);
            break;
      }
    },
    /** @param {Room} room - The spawn that needs help**/
    assignJobs: function(room, roomCreeps){
        roomCreeps = Game.creeps;
        var sources = room.find(FIND_SOURCES);
        var energyStructures = room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.energy < s.energyCapacity)});
        var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        
        /** @param {Creep} creep **/
        for(var creepName in roomCreeps){
            var creep = Game.creeps[creepName];
            var creepFunction = this.getCreepFunction(creep);
            if(creep.carry.energy > 0 && (creep.memory.status == 'IDLE' || creep.memory.status == 'ERROR' || !creep.memory.status)){
                if(creepFunction == 'BUILDER'){
                    var target = creep.pos.findClosestByPath(constructionSites);
                    if(target){
                        creep.memory.jobType = 'BUILDING';
                        creep.memory.buildId = target.id;
                        creep.memory.status = 'WORKING';
                    }
                }
                if(creepFunction == 'DELIVERY_TRUCK'){
                    var target = creep.pos.findClosestByPath(energyStructures);
                    if(target){
                        creep.memory.jobType = 'DELIVER_ENERGY';
                        creep.memory.deliverId = target.id;
                        creep.memory.status = 'WORKING';    
                    } else {
                       var target = creep.pos.findClosestByPath(constructionSites); 
                       if(target){
                            creep.memory.jobType = 'BUILDING';
                            creep.memory.buildId = target.id;
                            creep.memory.status = 'WORKING'; 
                       }
                    }
                    
                    
                }
                
                
                if(!target){
                    creep.memory.jobType = 'DELIVER_ENERGY';
                    creep.memory.status = 'WORKING';
                    creep.memory.deliverId = creep.room.controller.id;
                }
            }
            if(creep.carry.energy == 0 && creep.carryCapacity > 0 && (creep.memory.status == 'IDLE'|| creep.memory.status == 'ERROR' || !creep.memory.status)){
                creep.memory.jobType = 'MINE_ENERGY';
                creep.memory.status = 'WORKING';
                var source = creep.pos.findClosestByPath(sources);
                if(source){
                    creep.memory.sourceId = source.id;    
                }
                
            }

        }

    },

    /** @param {Creep} creep **/
    getCreepFunction: function(creep) {
        var body = creep.body;
        var work = 0;
        var move = 0;
        var carry = 0;
        for(i = 0; i < body.length; i++){
            var bodyType = body[i].type;
            switch(bodyType){
                case 'work':
                    work++;
                    break;
                case 'move':
                    move++;
                    break;
                case 'carry':
                    carry++;
                    break;
            }
        }
        if(carry > work && carry >= move){
            return 'DELIVERY_TRUCK';
        } else if (work >= carry && carry > 0 && move > 0) {
            return 'BUILDER';
        } else if (work > carry && carry == 1 && move == 1) {
            return 'STRIP_MINER';
        } else if (work > 0 && carry > 0 && move > 0) {
            return 'ALL';
        } else {
            return 'UNKNOWN';
        }
    },


  checkMinimumCreeps: function(room,roomCreeps) {
      
       var spawns = room.find(FIND_MY_SPAWNS);
       var spawn = spawns[0];
       //var spawn = Game.spawns['Skynet'];
      
      var minMiners = _.filter(roomCreeps, (creep) => creep.memory.role == 'MINER');
      if(minMiners.length < room.memory.minMiners){
          var result = spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE],null,{role: 'MINER'});
            if(_.isString(result)) {
                var creep = Game.creeps[result];
                var sources = creep.room.find(FIND_SOURCES);
                creep.memory.targetId = sources[0].id;
                creep.memory.status = 'IDLE';
            }
      }
      
      var minBuilders = _.filter(roomCreeps, (creep) => creep.memory.role == 'BUILDER');
      
      if(minBuilders.length < room.memory.minBuilders){
          var result = spawn.createCreep([WORK,WORK,CARRY,MOVE],null,{role: 'BUILDER'});
      }
  },
  
  processRoomCreeps: function(roomCreeps) {
      
      for (i = 0; i < roomCreeps.length; i++) { 
        var creep = roomCreeps[i];

          if(creep.memory.role == 'MINER' && creep.memory.status == 'IDLE'){
              if(creep.memory.targetId != null){
                creep.memory.status = 'COLLECTING';    
              } else {
                  var source = creep.pos.findClosestByPath(FIND_SOURCES);
                  creep.memory.targetId = source.id;
                  creep.memory.status = 'COLLECTING'; 
              }
              
          }
      }
          
          
  },
  
  checkUrgentDeliveryTargets: function(room,roomCreeps) {
      var haulers = _.filter(roomCreeps, (creep) => creep.memory.role == 'HAULER' & creep.memory.status == 'IDLE');
      var roomControllers = _.filter(room.find(FIND_MY_STRUCTURES), (structure) => structure.structureType == STRUCTURE_CONTROLLER);
      var roomController = roomControllers[0];
      if(roomController.ticksToDowngrade > 0){
          var hauler = roomController.pos.findClosestByRange(haulers);
          if(hauler){
              hauler.memory.deliverId = roomController.id;
              hauler.memory.status = 'DELIVERING';    
          }
          
      }
  }
  
    
};

module.exports = roomDirector;