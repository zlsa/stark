
var Timeout = Fiber.extend(function() {
  return {
    init: function(options) {
      
      this.callback = options.callback;
      this.delay    = options.delay;

      this.start    = time();
    },
    update: function() {

    },
  };
});

var Game = Fiber.extend(function() {
  return {
    init: function() {

      this.paused  = true;
      this.focused = true;

      this.speedup = 1;

      this.time_scale = 60;

      this.time  = 0;
      this.delta = 0;

      this.timeouts=[];

      this.mode = "fly";

      this.systems = prop.system.systems;

      this.system  = null;

      this.ships = {};

      this.ships.auto = [];

      // this.ships.auto.push(new Ship({
      //   type:  "auto",
      //   model: "x220"
      // }));

      this.ships.player = new Ship({
        model: "x220"
      });

      Math.seedrandom("stark");
      
      $(window).blur(function() {
        prop.game.focused = false;
      });

    },
    isPaused: function() {
      return !this.focused || this.paused;
    },
    pause: function() {
      this.paused = true;
    },
    unpause: function() {
      this.paused = false;
    },
    toggle_pause: function() {
      if(this.paused) {
        this.unpause();
      } else {
        this.pause();
      }
    },

    generate: function() {
      this.systems.push(new System().generate());
    },

    getSystem: function(name) {
      for(var i=0;i<this.systems.length;i++) {
        if(this.systems[i].name.toLowerCase() == name.toLowerCase()) {
          return this.systems[i];
        }
      }
      return false;
    },

    jump: function(name) {
      var s = this.getSystem(name);
      if(s) {
        if(this.ships.player.jump(s)) {
          this.system = s;
          return true;
        }
      }
      return false;
    },
    
    complete: function() {
      this.system = this.systems[0];

      this.teleport();
      
      this.paused = false;
    },

    teleport: function() {
      setTimeout(function() {
        var first_planet = prop.game.system.planets[0].name;
        for(var i=0;i<prop.game.ships.auto.length;i++) {
          prop.game.ships.auto[i].teleport(prop.game.system, first_planet);
        }
        prop.game.ships.player.teleport(prop.game.system, first_planet);
      }, 0);
    },

    update: function() {
      this.delta = delta() * this.speedup;

      if(this.isPaused()) {
        this.delta=0;
      }

      this.time += this.delta;
      for(var i=this.timeouts.length-1;i>=0;i--) {
        var remove  = false;
        var timeout = this.timeouts[i];
        if(game_time() > timeout[1]) {
          timeout[0].call(timeout[5], timeout[2]);
          if(timeout[4]) {
            timeout[1] += timeout[3]; 
          } else {
            remove=true;
          }
        }
        if(remove) {
          this.timeouts.splice(i, 1);
          i-=1;
        }
      }

      this.system.update();

      this.ships.player.controls = prop.input.controls;
      this.ships.player.assist.gravity = prop.input.assist.gravity;

      this.ships.player.update();

      for(var i=0;i<this.ships.auto.length;i++) {
        this.ships.auto[i].update();
      }

    },

    shouldDrawFlyMode: function() {
      return true;
    },

    save: function() {

      var data = {};
      data.paused   = this.paused;
      data.focused  = this.focused;

      data.time     = this.time;

      data.timeouts = this.timeouts;

      data.mode     = this.mode;

      data.systems  = [];
      for(var i=0;i<this.systems.length;i++) {
        data.systems.push(this.systems[i].save());
      }

      data.system   = this.system.name.toLowerCase();

      data.ships    = {};

      data.ships.player = this.ships.player.save();

      data.ships.auto   = [];

      for(var i=0;i<this.ships.auto.length;i++) {
        data.ships.auto.push(this.ships.auto[i].save());
      }

      return data;
    },

    restore: function(data) {

      Math.seedrandom("stark");
      
      this.paused   = data.paused;
      this.focused  = data.focused;

      this.time     = data.time;

      this.timeouts = data.timeouts;

      this.mode     = data.mode;

      this.systems  = [];
      for(var i=0;i<data.systems.length;i++) {
        this.systems.push(new System(data.systems[i]));
      }

      this.system = this.getSystem(data.system);
      this.system.render();

      this.ships.player.parse(data.ships.player);

      this.ships.auto = [];
      for(var i=0;i<data.ships.auto.length;i++) {
        this.ships.auto.push(new Ship(data.ships.auto[i]));
      }

    },
    

  };
});

function game_pause() {
  prop.game.pause();
}

function game_unpause() {
  prop.game.unpause();
}

function game_toggle_pause() {
  prop.game.toggle_pause();
}

function game_paused() {
  return prop.game.paused();
}

function game_time() {
  return prop.game.time;
}

function game_delta() {
  return prop.game.delta;
}

function game_speedup() {
  if(game_paused()) return 0;
  return prop.game.speedup;
}

function game_timeout(func, delay, that, data) {
  prop.game.timeout(arguments);
}

function game_update_pre() {
  prop.game.update();
}

function game_complete() {
  prop.game = new Game();
  prop.game.complete();
//  if(storage.has("savegame"))
//    prop.game.restore(storage.get("savegame"));
}

