
var Expendable = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

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

    }
  };
});

var Ship = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.position = [0, 0];
      this.velocity = [140, 0];
      this.angle    = 0;
      this.angular_velocity = 0;

      this.force    = [0, 0];
      this.angular_force = 0;

      this.controls = [0, 0];

      this.mass     = 0;

      this.type     = "player";

      this.model    = new ShipModel();

      this.assist = options.assist || {
        angle:   true,
        gravity: true
      };

      this.path = [];

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
      }

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

      var thrust = this.model.power.thrust * this.controls[1] * 10;
      this.force[0] = Math.sin(this.angle) * thrust;
      this.force[1] = Math.cos(this.angle) * thrust;

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

//      this.velocity[0] *= 1 - (damping);
//      this.velocity[1] *= 1 - (damping);
      this.velocity[0] *= 1 - (damping * game_delta());
      this.velocity[1] *= 1 - (damping * game_delta());

      this.velocity[0] += velocity[0];
      this.velocity[1] += velocity[1];
    },
    update: function() {
      this.updateMass();

      if(this.type == "auto") {
        this.updateAutopilot();
      }

      this.updateAssist();
      this.updateThrust();
      this.updateGravity();
      this.updateDamping();
      this.updatePhysics();

      this.path.push([this.position[0], this.position[1]]);
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

      var position = p.getPosition(true, 0);

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
