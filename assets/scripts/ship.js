
var Ship=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.position = [0, 0];
      this.velocity = [140, 0];
      this.angle    = 0;
      this.angular_velocity = 0;

      this.mass     = 1;
      this.angular_mass = 1;

      this.force    = [0, 0];
      this.angular_force = 0;

      this.controls = [0, 0];
      this.power    = {
        thrust: 130,
        angle:  4.0
      };

      this.assist = {
        angle: true
      };

      this.images = {
        
      };

      this.path = [];

      this.content = {
        normal_image: new Content({
          type: "image",
          url: "assets/ships/x220/normal.png",
          that: this,
          callback: function(status, data) {
            if(status == "ok") {
              this.images.normal=data;
            }
          }
        }),
        engine_image: new Content({
          type: "image",
          url: "assets/ships/x220/engine.png",
          that: this,
          callback: function(status, data) {
            if(status == "ok") {
              this.images.engine=data;
            }
          }
        })
      }
    },
    updateAssist: function() {
      if(this.assist.angle) {
        if(Math.abs(this.controls[0]) < 0.01) {
          this.controls[0] = -this.angular_velocity * 10;
        }
      }
    },
    updateThrust: function() {
      this.controls[0] = clamp(-3, this.controls[0], 3);
      this.controls[1] = clamp( 0, this.controls[1], 1);

      var thrust = this.power.thrust * this.controls[1];
      this.force[0] = Math.sin(this.angle) * thrust;
      this.force[1] = Math.cos(this.angle) * thrust;

      this.angular_force = this.power.angle * this.controls[0];
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
        p = p.planets[planet[i]];
        if(!p) return false;
      }

      var position = p.getPosition(true, 0);

      this.position[0] = position[0];
      this.position[1] = position[1];

      var velocity = p.getVelocity(true);

      this.velocity[0] = velocity[0];
      this.velocity[1] = velocity[1];

    }
  };
});

function ship_init_pre() {
  prop.ship={};

  prop.ship.player = new Ship();
}

function ship_complete() {
  prop.ship.player.teleport(system_get(), ["earth"]);
}

function ship_update() {
  prop.ship.player.update();
}
