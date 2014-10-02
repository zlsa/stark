
var Game = Fiber.extend(function() {
  return {
    init: function() {

      this.paused  = true;
      this.focused = true;

      this.speedup = 1;

      this.time  = 0;
      this.delta = 0;

      this.timeouts=[];

      this.mode = "fly";

      this.system = null;

      this.ships = {};
      this.ships.player = new Ship();
      
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
    
    complete: function() {
      this.system = prop.system.systems.sol;
      this.system.render();

      this.ships.player.teleport(this.system, ["earth"]);

      this.paused = false;
    },

    update: function() {
      this.delta=Math.min(delta()*this.speedup, 1);

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

    },

    shouldDrawFlyMode: function() {
      return true;
    },

    save: function() {

      var data = {};
      data.paused   = this.paused;
      data.focused  = this.focused;

      data.speedup  = this.speedup;

      data.time     = this.time;

      data.timeouts = this.timeouts;

      data.mode     = this.mode;

      data.system   = this.system.save();

      data.ships    = {};

      data.ships.player = this.ships.player.save();

      return data;
    },

    restore: function(data) {
      
      this.paused   = data.paused;
      this.focused  = data.focused;

      this.speedup  = data.speedup;

      this.time     = data.time;

      this.timeouts = data.timeouts;

      this.mode     = data.mode;

      this.system   = new System(data.system);
      this.system.render();

      this.ships    = {};

      this.ships.player = new Ship(data.ships.player);

    },
    

  };
});

function game_init_pre() {

  prop.game = new Game();

  $(window).blur(function() {
    prop.game.focused = false;
  });

  $(window).focus(function() {

  });

}

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
  var to = [func, game_time()+delay, data, delay, false, that];
  prop.game.timeouts.push(to);
  return to;
}

function game_interval(func, delay, that, data) {
  var to = [func, game_time()+delay, data, delay, true, that];
  prop.game.timeouts.push(to);
  return to;
}

function game_clear_timeout(to) {
  prop.game.timeouts.splice(prop.game.timeouts.indexOf(to), 1);
}

function game_update_pre() {
  prop.game.update();
}

function game_complete() {
  prop.game.complete();
}
