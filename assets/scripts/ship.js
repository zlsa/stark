
var Ship=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.position = [0, 0];
      this.velocity = [0, 0];
      this.angle    = 0;
      this.angular_velocity = 0;

      this.mass     = 1;
      this.angular_mass = 1;

      this.force    = [0, 0];
      this.angular_force = 0;

      this.controls = [0, 0];
      this.power    = {
        thrust: 70,
        angle:  4.0
      };

      this.assist = {
        angle: true
      };

      this.images = {
        
      };

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
      this.controls[1] = clamp(-1, this.controls[1], 1);

      var thrust = this.power.thrust * this.controls[1];
      this.force[0] = Math.sin(this.angle) * thrust;
      this.force[1] = Math.cos(this.angle) * thrust;

      this.angular_force = this.power.angle * this.controls[0];
    },
    updatePhysics: function() {
      this.velocity[0] += (this.force[0] / this.mass) * delta();
      this.velocity[1] += (this.force[1] / this.mass) * delta();

      this.angular_velocity += (this.angular_force / this.angular_mass) * delta();

      this.position[0] += this.velocity[0] * delta();
      this.position[1] += this.velocity[1] * delta();

      this.angle       += this.angular_velocity * delta();

      if(Math.abs(this.angular_velocity) < 0.01) this.angular_velocity = 0;
    },
    updateGravity: function() {
      var force = system_get().gravityAt(this.position, this.mass);
      this.velocity[0] -= force[0] / this.mass;
      this.velocity[1] -= force[1] / this.mass;
    },
    update: function() {
      this.updateAssist();
      this.updateThrust();
      this.updateGravity();
      this.updatePhysics();
    }
  };
});

function ship_init_pre() {
  prop.ship={};

  prop.ship.player = new Ship();
}

function ship_update() {
  prop.ship.player.update();
}
