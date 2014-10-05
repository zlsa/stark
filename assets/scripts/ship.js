
var ShipModel = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.id           = null;

      this.name         = "";
      this.manufacturer = "";

      this.cargo = {
        capacity: 30
      };

      this.fuel         = {
        impulse: {
          type:       "xenon",
          capacity:   30,
          rate: {
            input: 2
          }
        },
        jump: {
          type:       "hydrogen",
          capacity:   50,
          rate: {
            input: 2
          }
        }
      };

      this.mass         = 1;
      this.angular_mass = 1;

      this.power        = {
        thrust: 180,
        angle:  12.0
      };

      this.images = {
        
      };

      this.content = {};

      this.parse(options);

      if(options.url) {
        this.load(options.url);
      }

    },

    parse: function(data) {
      this.id           = data.id           || this.id;

      this.name         = data.name         || this.name;
      this.manufacturer = data.manufacturer || this.manufacturer;

      this.mass         = data.mass         || this.mass;
      this.angular_mass = data.angular_mass || this.angular_mass;

      if(data.cargo) {
        if(data.cargo.capacity) this.cargo.capacity = data.cargo.capacity;
      }
      
      if(data.power) {
        if(data.power.thrust) this.power.thrust = data.power.thrust;
        if(data.power.angle)  this.power.angle  = data.power.angle;
      }

      if(data.fuel) {
        var types = ["impulse", "jump"];
        for(var i=0;i<types.length;i++) {
          var type = types[i];
          if(data.fuel[type]) {
            var fuel_type = data.fuel[type].type;
            if(data.fuel[type].type)       this.fuel[type].type       = fuel_type;
            if(data.fuel[type].capacity)   this.fuel[type].capacity   = data.fuel[type].capacity;
            this.fuel[type].rate.input                                = prop.cargo.fuels[fuel_type].rate.input;
          }
        }
      }

      if(data.images) {
        this.content.images = {};

        for(var i in data.images) {
          this.content.images[i] = new Content({
            url:  data.images[i],
            type: "image",
            that: this,
            payload: i,
            callback: function(status, data, payload) {
              if(status == "ok") {
                this.images[payload] = data;
              }
            }
          });
        }

      }

    },

    load: function(url) {
      this.content.ship = new Content({
        url:  url,
        type: "json",
        that: this,
        callback: function(status, data) {
          if(status == "ok") {
            this.parse(data);
          }
        }
      });
    },

  };
});

/******************************************/

var Ship = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      // 'player' or 'auto'
      this.type     = "player";
      this.name     = "";

      this.system   = null;

      // ... basic stuff
      this.position = [0, 0];
      this.velocity = [140, 0];
      this.angle    = 0;
      this.angular_velocity = 0;

      // ... here too
      this.force    = [0, 0];
      this.angular_force = 0;

      // autopilot controls these
      this.controls = [0, 0];

      // automatically updated every frame
      this.mass         = 0;
      this.angular_mass = 0;
      this.thrust       = 0;

      this.cargo = new Cargo();

      // updated every frame
      this.fuel         = {
        impulse: new FuelTank(),
        jump:    new FuelTank()
      };
      
      // the model
      this.model    = new ShipModel();

      // assist
      this.assist = options.assist || {
        angle:   true,
        gravity: true
      };

      this.parse(options);
    },

    parse: function(data) {
      if(data.type) {
        this.type = data.type;
      }

      if(data.name) {
        this.name = data.name;
      }

      if(data.position) {
        this.position = data.position;
      }

      if(data.velocity) {
        this.velocity = data.velocity;
      }

      if(data.angle) {
        this.angle = data.angle;
      }

      if(data.angular_velocity) {
        this.angular_velocity = data.angular_velocity;
      }

      if(data.system) {
        this.system = data.system;
      }

      if(data.model) {
        this.model = prop.ship.models[data.model];

        var types = ["impulse", "jump"];
        for(var i=0;i<types.length;i++) {
          var type = types[i];
          this.fuel[type].type     = this.model.fuel[type].type;
          this.fuel[type].max_rate = this.model.fuel[type].rate;
          this.fuel[type].weight   = prop.cargo.fuels[this.model.fuel[type].type].weight;
          this.fuel[type].capacity = this.model.fuel[type].capacity;

          this.fuel[type].fill();

          if(data.fuel && data.fuel[type])
            this.fuel[type].set(data.fuel[type].amount);
        }

      }
      
      if(!this.name) this.generateName();

    },
    
    rename: function(name) {
      this.name = name.toUpperCase();
    },
    
    generateName: function() {
      var s = choose("aaaabbbcdeeeeffgggghjjkkllmmnnnpppqrsstttuuvvvvwxy").toUpperCase();
      s += "-";
      for(var i=0;i<4;i++) {
        s += randint(0, 9);
      }
      this.name = s;
//      if(this.type == "player")
    },

    getSpeed: function(relative) {
      if(relative) {
        var velocity = this.system.velocityAt(this.position);
        return distance2d(this.velocity, velocity);
      }
      return distance2d(this.velocity);
    },

    updateFuel: function() {
      var fuel_type     = this.model.fuel.impulse.type;
      var fuel_rate_out = this.thrust * prop.cargo.fuels[fuel_type].burn_rate;
      this.fuel.impulse.rate.output = fuel_rate_out;

      var closest_planet = this.system.closestPlanet(this.position, true, 0.5)[0];

      var types = ["impulse", "jump"];
      for(var i=0;i<types.length;i++) {
        var type = types[i];
        if(closest_planet && closest_planet.canRefuel(this.model.fuel[type].type) && this.getSpeed(true) < 10) {
          this.fuel[type].rate.input = this.model.fuel[type].rate.input;
        } else {
          this.fuel[type].rate.input = 0;
        }
        this.fuel[type].update();
      }


      if(this.fuel.impulse.isEmpty()) this.controls[1] = 0;
    },
    updateMass: function() {
      this.mass = this.model.mass;

      var types = ["impulse", "jump"];
      for(var i=0;i<types.length;i++) {
        var type = types[i];
        this.mass += this.fuel[type].getWeight();
      }

      this.angular_mass = this.model.angular_mass;
    },
    updateAssist: function() {
      if(this.assist.angle) {
//        if(Math.abs(this.controls[0]) < 0.01) {
//          this.controls[0] = -this.angular_velocity * 10;
//        }
        this.controls[0] = angle_difference(this.controls[0], this.angular_velocity * 0.4) * 3;
      }
      if(this.assist.gravity) {
        var force = this.system.gravityAt(this.position, this.mass);
        var angle = angle_difference(-this.angle, Math.atan2(-force[0], force[1]));
        this.controls[0] = (angle - this.angular_velocity) * 50;
      }
    },
    updateAutopilot: function() {
//      this.assist.gravity = true;
      this.controls[0] = 0.0;
      this.controls[1] = 0.0;
    },
    updateThrust: function() {
      this.controls[0] = clamp(-1, this.controls[0], 1);
      this.controls[1] = clamp( 0, this.controls[1], 1);

      this.thrust = this.model.power.thrust * this.controls[1];
      this.force[0] = Math.sin(this.angle) * this.thrust * 20;
      this.force[1] = Math.cos(this.angle) * this.thrust * 20;

      this.angular_force = this.model.power.angle * this.controls[0] * 3;
    },
    updatePhysics: function() {
      this.velocity[0] += (this.force[0] / this.mass) * game_delta();
      this.velocity[1] += (this.force[1] / this.mass) * game_delta();

      this.angular_velocity += (this.angular_force / this.angular_mass) * game_delta();

      this.position[0] += this.velocity[0] * game_delta();
      this.position[1] += this.velocity[1] * game_delta();

      this.angle       += this.angular_velocity * game_delta();

      if(Math.abs(this.angular_velocity) < 0.01) this.angular_velocity = 0;
    },
    updateGravity: function() {
      var force = this.system.gravityAt(this.position, this.mass);
      this.velocity[0] -= force[0] / this.mass * game_delta();
      this.velocity[1] -= force[1] / this.mass * game_delta();
    },
    updateDamping: function() {
      var damping = this.system.dampingAt(this.position);

      var velocity = this.system.velocityAt(this.position);

      this.velocity[0] -= velocity[0];
      this.velocity[1] -= velocity[1];

      this.velocity[0] *= 1 - (damping * game_delta());
      this.velocity[1] *= 1 - (damping * game_delta());

      this.velocity[0] += velocity[0];
      this.velocity[1] += velocity[1];
    },
    update: function() {
      this.updateFuel();
      this.updateMass();

      if(this.type == "auto") {
        this.updateAutopilot();
      }

      this.updateAssist();
      this.updateThrust();
      this.updateGravity();
      this.updateDamping();
      this.updatePhysics();
    },
    teleport: function(system, planet) {
      if(!planet) {
        planet = system;
        system = this.system;
      }

      if(typeof planet == typeof "") planet = [planet];

      var p = system;

      if(!planet) {
        this.position[0] = 0;
        this.position[1] = 0;
        this.velocity[0] = 0;
        this.velocity[1] = 0;
        return false;
      }

      for(var i=0;i<planet.length;i++) {
        p = p.getChild(planet[i]);
        if(!p) {
          return false;
        }
      }
      
      if(p.star) return false;

      var position = p.getPosition(true);

      this.position[0] = position[0];
      this.position[1] = position[1];

      var velocity = p.getVelocity(true);

      this.velocity[0] = velocity[0];
      this.velocity[1] = velocity[1];

    },

    jump: function(system) {
      var distance = random(5*AU, 15*AU);
      var angle    = random(0, Math.PI * 2);
      
      var speed    = random(1000, 5000);

      var position = [];
      position[0] = Math.sin(angle) * distance;
      position[1] = Math.cos(angle) * distance;
      
      var velocity = [];
      velocity[0] = -Math.sin(angle) * speed + random(-500, 500);
      velocity[1] = -Math.cos(angle) * speed + random(-500, 500);

      var current_force = distance2d(this.system.gravityAt(this.position, this.mass)) * 1000000;
      var jump_force    = distance2d(     system.gravityAt(     position, this.mass)) * 1000000;

      console.log(Math.abs(current_force - jump_force) + " difference in force");

      var fuel_type = this.model.fuel.jump.type;
      var fuel_used = trange(1000, Math.abs(current_force - jump_force), 20000, 10, 30) * prop.cargo.fuels[fuel_type].burn_rate;

      var can_jump = true;
      
      if(this.fuel.jump.getAmount() * 0.7 < fuel_used) can_jump = false;
      
      if(can_jump) {
        this.position = position;
        this.velocity = velocity;
        this.fuel.jump.remove(fuel_used);
        this.angle    = Math.PI + angle + random(-0.2, 0.2);
        this.system   = system;
        return true;
      }

      return false;
    },

    near: function() {

    },

    save: function() {
      log("ship save", LOG_FLOOD);

      var data = {};

      data.name     = this.name;

      data.model    = this.model.id;

      data.position = this.position;
      data.velocity = this.velocity;

      data.angle    = this.angle;
      data.angular_velocity = this.angular_velocity;
      
      data.assist   = this.assist;

      data.fuel     = {
        impulse: {
          amount: this.fuel.impulse.getFraction()
        },
        jump: {
          amount: this.fuel.jump.getFraction()
        }
      };

      return data;

    }
      
  };
});

function ship_init_pre() {
  prop.ship = {};

  prop.ship.models = {};

  prop.ship.root = "assets/ships/";
}

function ship_init() {
  ship_load("x220");
}

function ship_load(name, url) {
  if(!url) url = prop.ship.root + name + "/ship.json";
  prop.ship.models[name] = new ShipModel({
    id: name,
    url: url
  });
}

function ship_complete() {

}

function ship_update() {

}
