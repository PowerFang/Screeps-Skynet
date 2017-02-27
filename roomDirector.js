var _ = require('lodash');

var extensionPositions = {
    1: { x: -1, y: -1 },
    2: { x: 1, y: -1 },
    3: { x: 1, y: 1 },
    4: { x: -1, y: 1 },
    5: { x: -2, y: -2 },
    6: { x: 0, y: -2 },
    7: { x: 2, y: -2 },
    8: { x: 2, y: 0 },
    9: { x: 2, y: 2 },
    10: { x: 0, y: 2 },
    11: { x: -2, y: 2 },
    12: { x: -2, y: 0 },
    13: { x: -3, y: -3 },
    14: { x: -1, y: -3 },
    15: { x: 1, y: -3 },
    16: { x: 3, y: -3 },
    17: { x: 3, y: -1 },
    18: { x: 3, y: 1 },
    19: { x: 3, y: 3 },
    20: { x: 1, y: 3 },
    21: { x: -1, y: 3 },
    22: { x: -3, y: 3 },
    23: { x: -3, y: 1 },
    24: { x: -3, y: -1 },
    25: { x: -4, y: -4 },
    26: { x: -2, y: -4 },
    27: { x: 0, y: -4 },
    28: { x: 2, y: -4 },
    29: { x: 4, y: -4 },
    30: { x: 4, y: -2 },
    31: { x: 4, y: 0 },
    32: { x: 4, y: 2 },
    33: { x: 4, y: 4 },
    34: { x: 2, y: 4 },
    35: { x: 0, y: 4 },
    36: { x: -2, y: 4 },
    37: { x: -4, y: 4 },
    38: { x: -4, y: 2 },
    39: { x: -4, y: 0 },
    40: { x: -4, y: -2}
}

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

      if (room.energyCapacityAvailable == room.energyAvailable) {
          var numExtensions = _.sum(Game.structures, (s) => s.structureType == STRUCTURE_EXTENSION && s.room.name == room.name);
          var numConstructExtensions = _.sum(Game.constructionSites, (s) => s.structureType == STRUCTURE_EXTENSION && s.room.name == room.name);
          if (numExtensions < ((room.controller.level-1) * 5) && numConstructExtensions == 0) {
              var spawns = room.find(FIND_MY_SPAWNS);
              /** @param {StructureSpawn} **/
              var spawn = spawns[0];
              var pos = spawn.pos;
              for (var trypos in extensionPositions) {
                  var coods = extensionPositions[trypos];
                  var tX = coods["x"];
                  var tY = coods["y"];
                  var tryX = pos.x + tX;
                  var tryY = pos.y + tY;
                  var result = room.createConstructionSite(tryX, tryY, STRUCTURE_EXTENSION);
                  console.log(result);
                  if (result == 0) {
                      break;
                  }
              }
          }
      }

    },
    /** @param {Room} room - The spawn that needs help**/
    assignJobs: function(room, roomCreeps){
        roomCreeps = Game.creeps;
        var sources = room.find(FIND_SOURCES);
        var energyStructures = room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.energy < s.energyCapacity)});
        var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        
        
        for(var creepName in roomCreeps){
            /** @param {Creep} creep **/
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
      } else {
          var minBuilders = _.filter(roomCreeps, (creep) => creep.memory.role == 'BUILDER');

          if (minBuilders.length < room.memory.minBuilders) {
              var result = spawn.createCreep([WORK, WORK, CARRY, MOVE], null, { role: 'BUILDER' });
          }
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
      var energyTrucks = _.filter(roomCreeps, (creep) => creep.carry.energy > 0);            
      if(room.controller.ticksToDowngrade < 3000){
          var hauler = room.controller.pos.findClosestByRange(energyTrucks);
          if(hauler){
              hauler.memory.deliverId = room.controller.id;
              hauler.memory.jobType = 'DELIVER_ENERGY';
              hauler.memory.status = 'WORKING';    
          }
          
      }
  }
  
    
};

module.exports = roomDirector;