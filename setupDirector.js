
var setupDirector = {
  
  /** @param {StructureSpawn} spawn - The spawn that needs help**/
  setup: function(spawn) {

    console.log('setup');
    spawn.room.memory.roomType = 'HOME';

    var sources = spawn.room.find(FIND_SOURCES);
    spawn.room.memory.minMiners = (sources.length * 5);
    spawn.room.memory.minBuilders = (sources.length * 1);
    this.spawnBiggestMiner(spawn, spawn.room.energyAvailable);
      
  },
  /** @param {SpawnStructure} spawn **/
  spawnBiggestMiner: function(spawn, energyAvailable) {
    var minMiner = [WORK,CARRY,MOVE];
    var defaultMiner = [WORK,CARRY,CARRY,MOVE,MOVE];
    
      if(energyAvailable >= 200 && energyAvailable < 300){
          spawn.createCreep(minMiner,null,{role: 'MINER'});
      } else if(energyAvailable >= 300) {
          spawn.createCreep(defaultMiner,null,{role: 'MINER'});
      }
  }
    
};

module.exports = setupDirector;