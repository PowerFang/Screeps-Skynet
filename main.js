var _ = require('lodash');
var spawnDirector = require('spawnDirector');
var roomDirector = require('roomDirector');
var setupDirector = require('setupDirector'); 
var roleMiner = require('roleMiner'); 
var roleHauler = require('roleHauler'); 
var jobDeliverEnergy = require('jobDeliverEnergy');
var jobMineEnergy = require('jobMineEnergy');
var jobBuild = require('jobBuild');

var minersPerSource = 2;
var minMiners = 1;
var spawnBaseName = 'Skynet';


Creep.prototype.isCreepStuck = function isCreepStuck() {
    var stuckCount = this.memory.stuckCount;
        var lastX = this.memory.lastX;
        var lastY = this.memory.lastY;
        var posX = this.pos.x;
        var posY = this.pos.y;
        var fatigue = this.fatigue;
        if(posX == lastX && posY == lastY && fatigue == 0){
            stuckCount++;
            this.memory.stuckCount = stuckCount;
        } else {
            this.memory.lastX = posX;
            this.memory.lastY = posY;
            if(stuckCount > 0){
                this.memory.stuckCount = 0;
            }
        }
        if(stuckCount >= 3){
            this.say('Im Stuck');
            return true;   
        } else {
            return false;
        }
}

module.exports.loop = function () {
    // Clear Memory of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // Check if you have no creeps, if so, we are probably in setup mode
    var numCreeps = _.filter(Game.creeps);
    if(numCreeps.length == 0){
        setupDirector.setup(Game.spawns[spawnBaseName]);
    }
    
    // The room director controls how the room should behave
    for(var roomName in Game.rooms){
        var room = Game.rooms[roomName];
        roomDirector.processRoom(room);
    }
 
    for(var name in Game.creeps) {

        var creep = Game.creeps[name];
        
        if(creep.memory.status == 'WORKING'){
            switch(creep.memory.jobType){
                case 'DELIVER_ENERGY':
                    jobDeliverEnergy.run(creep);
                    break;
                case 'MINE_ENERGY':
                    jobMineEnergy.run(creep);
                    break;
                case 'BUILDING':
                    jobBuild.run(creep);
                    break;
            }
        }

/*
        if(creep.memory.role == 'MINER'){
            roleMiner.run(creep);
        }   
        if(creep.memory.role == 'HAULER'){
            roleHauler.run(creep);
        }
        */
    }
};