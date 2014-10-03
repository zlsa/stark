
var Expendable = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};
      
      this.amount     = 0;
      this.capacity   = 0;

      this.can_hold   = {};

      this.weight     = 0;

      this.flow       = 0;

      this.parse(options);
    },
    parse: function(data) {
      if(data.amount) {
        this.amount = data.amount;
      }

      if(data.capacity) {
        this.capacity = data.capacity;
      }

      if(data.can_hold) {
        this.can_hold = data.can_hold;
      }

      if(data.weight) {
        this.weight = data.weight;
      }

    },
    fill: function() {
      this.amount = this.capacity;
    },
    set: function(fraction) {
      this.amount = this.capacity * fraction;
    },
    getAmount: function() {
      return this.amount;
    },
    getFraction: function() {
      return this.amount / this.capacity;
    },
    getWeight: function() {
      return this.amount * this.weight;
    },
    updateFlow: function() {
      this.amount += this.flow * game_delta();

      this.amount = clamp(0, this.amount, this.capacity);
    },
    update: function() {
      this.updateFlow();
    }
  };
});

var FuelTank = Expendable.extend(function(base) {
  return {
    init: function(options) {
      if(!options) options={};

      base.init.call(this, options);

      this.max_rate = {
        output: 0,
        input:  0
      };

      this.rate = {
        output: 0,
        input:  0
      };

    },
    parse: function(data) {
      base.parse.call(this, data);

      if(data.type) {
        this.type = data.type;
      }

    },
    isEmpty: function() {
      return (this.getAmount() < 0.01);
    },
    updateFuel: function() {
      this.rate.output = clamp(0, this.rate.output, this.max_rate.output);
      this.rate.input  = clamp(0, this.rate.input,  this.max_rate.input);
      this.flow = -this.rate.output + this.rate.input;
    },
    update: function() {
      this.updateFuel();
      base.update.call(this);
    }
  };
});

var ShipModel = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.id           = null;

      this.name         = "";
      this.manufacturer = "";
      this.name         = "";

      this.fuel         = {
        impulse: {
          type:       "xenon",
          capacity:   30,
          max_rate:   {
            output:   1,
            input:    1
          }
        },
        jump: {
          type:       "hydrogen",
          capacity:   50,
          max_rate:   {
            output:   1,
            input:    1
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
      
      if(data.power) {
        if(data.power.thrust) this.power.thrust = data.power.thrust;
        if(data.power.angle)  this.power.angle  = data.power.angle;
      }

      if(data.fuel) {
        var types = ["impulse", "jump"];
        for(var i=0;i<types.length;i++) {
          var type = types[i];
          if(data.fuel[type]) {
            if(data.fuel[type].type)       this.fuel[type].type       = data.fuel[type].type;
            if(data.fuel[type].capacity)   this.fuel[type].capacity   = data.fuel[type].capacity;
            if(data.fuel[type].max_rate)   this.fuel[type].max_rate   = data.fuel[type].max_rate;
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
                console.log(this.images);
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

      if(data.model) {
        this.model = prop.ship.models[data.model];

        var types = ["impulse", "jump"];
        for(var i=0;i<types.length;i++) {
          var type = types[i];
          this.fuel[type].max_rate = this.model.fuel[type].max_rate;
          this.fuel[type].weight   = prop.ship.fuels[this.model.fuel[type].type].weight;
          this.fuel[type].capacity = this.model.fuel[type].capacity;

          this.fuel[type].fill();

          if(data.fuel && data.fuel[type])
            this.fuel[type].set(data.fuel[type].amount);
        }

      }

    },

    updateFuel: function() {
      var fuel_rate_out = this.controls[1] * this.model.fuel.impulse.max_rate.output;
      this.fuel.impulse.rate.output = fuel_rate_out;

      if(this.fuel.impulse.isEmpty()) this.controls[1] = 0;

      prop.foo = this.fuel.impulse;

      this.fuel.impulse.update();
    },
    updateMass: function() {
      this.mass = this.model.mass;
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
        var force = system_get().gravityAt(this.position, this.mass);
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
      this.controls[0] = clamp(-3, this.controls[0], 3);
      this.controls[1] = clamp( 0, this.controls[1], 1);

      this.thrust = this.model.power.thrust * this.controls[1] * 10;
      this.force[0] = Math.sin(this.angle) * this.thrust;
      this.force[1] = Math.cos(this.angle) * this.thrust;

      this.angular_force = this.model.power.angle * this.controls[0];
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
      var force = system_get().gravityAt(this.position, this.mass);
      this.velocity[0] -= force[0] / this.mass * game_delta();
      this.velocity[1] -= force[1] / this.mass * game_delta();
    },
    updateDamping: function() {
      var damping = system_get().dampingAt(this.position);

      var velocity = system_get().velocityAt(this.position);

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
        system = system_get();
      }

      if(typeof planet == typeof "") planet = [planet];

      var p = system;

      if(!planet) {
        this.position[0] = 0;
        this.position[1] = 0;
        this.velocity[0] = 0;
        this.velocity[1] = 0;
        return;
      }

      for(var i=0;i<planet.length;i++) {
        p = p.getChild(planet[i]);
        if(!p) {
          console.log(planet[i], p);
          return false;
        }
      }

      var position = p.getPosition(true);

      this.position[0] = position[0];
      this.position[1] = position[1];

      var velocity = p.getVelocity(true);

      this.velocity[0] = velocity[0];
      this.velocity[1] = velocity[1];

    },

    near: function() {

    },

    save: function() {
      log("ship save", LOG_FLOOD);

      var data = {};

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

  prop.ship.fuels = {
    "xenon": {
      weight:  0.05,
      element: "Xe"
    },
    "hydrogen": {
      weight: 0.015,
      element: "H"
    }
  };
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
