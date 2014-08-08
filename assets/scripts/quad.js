
var Quad=Fiber.extend(function() {
  return {
    init: function(options) {
      this.power = {
        left: 0,
        right: 0,
        left_actual: 0,
        right_actual: 0,
        max: 3
      };
      
      var shape = new p2.Rectangle(0.6, 0.07);
      this.body = new p2.Body({
        mass: 0.2,
        position: [0, 3]
      });
      
      shape.material = new p2.Material();

      prop.world.world.addContactMaterial(
        new p2.ContactMaterial(shape.material, prop.world.ground.material, {
          friction: 1,
          restitution : 0.0,
          stiffness : Number.MAX_VALUE,
          relaxation: 0
        })
      );
      
      this.body.addShape(shape);
      this.body.angularDamping=0.5;

      prop.world.world.addBody(this.body);
      
      this.autopilot = {
        vspeed: new PID(0.3, 0.4, 0.0),
        hspeed: new PID(5, 2, 1),
        angular_velocity: new PID(0.14, 0.0, 0.0)
      };
    },

    target: function() {
      return prop.quad.target;
      var position_target = [10, 10];
      return position_target;
    },

    updateAutopilot: function() {
      var target=this.target();

      var target_position = target[0];
      var target_altitude = target[1];
      var target_hspeed = crange(-60, target_position - this.body.position[0], 60, -30, 30);

      var target_vspeed = crange(-60, target_altitude - this.body.position[1], 60, -40, 40);

      this.autopilot.vspeed.target = target_vspeed;
      this.autopilot.vspeed.input  = this.body.velocity[1];
      this.autopilot.vspeed.tick();

      this.autopilot.hspeed.target = target_hspeed;
      this.autopilot.hspeed.input  = this.body.velocity[0];
      this.autopilot.hspeed.tick();

      var target_angle=crange(-30, this.autopilot.hspeed.get(), 30, Math.PI/2, -Math.PI/2);
      if(prop.quad.flip) target_angle+=Math.PI;
      var target_angular_velocity = crange(-Math.PI/2, angle_difference(this.body.angle, target_angle), Math.PI/2, Math.PI*4, -Math.PI*4);

      this.autopilot.angular_velocity.target = target_angular_velocity;
      this.autopilot.angular_velocity.input  = this.body.angularVelocity;
      this.autopilot.angular_velocity.tick();

      this.power.left   = this.autopilot.vspeed.get() * Math.cos(target_angle);
      this.power.right  = this.autopilot.vspeed.get() * Math.cos(target_angle);
      this.power.left  -= this.autopilot.angular_velocity.get();
      this.power.right += this.autopilot.angular_velocity.get();
    },

    updatePower: function() {

      var left=clamp(-1, this.power.left, 1);
      var right=clamp(-1, this.power.right, 1);

      var add=8*delta();

      if(left > this.power.left_actual+add+0.001)
        this.power.left_actual+=add;
      else if(left < this.power.left_actual-add-0.001)
        this.power.left_actual-=add;
      else
        this.power.left_actual=left;

      if(right > this.power.right_actual+add+0.001)
        this.power.right_actual+=add;
      else if(right < this.power.right_actual-add-0.001)
        this.power.right_actual-=add;
      else
        this.power.right_actual=right;

      var v=this.body.angle;
      var thrust=this.power.max*this.power.left_actual;
      var force=[-Math.sin(v)*thrust, Math.cos(v)*thrust];
      var point=[0,0];
      this.body.toWorldFrame(point,[-0.3,0]);
      this.body.applyForce(force,point);

      thrust=this.power.max*this.power.right_actual;
      force=[-Math.sin(v)*thrust, Math.cos(v)*thrust];
      point=[0,0];
      this.body.toWorldFrame(point,[0.3,0]);
      this.body.applyForce(force,point);
    },
    update: function() {
      this.updateAutopilot();
      this.updatePower();
    }
  };
});

function quad_init_pre() {
  prop.quad={};
  prop.quad.quads=[];
  prop.quad.target=[5,1];
  prop.quad.flip=false;
}

function quad_init() {
  quad_add(new Quad({

  }));
}

function quad_add(quad) {
  prop.quad.quads.push(quad);
}

function quad_update() {
  for(var i=0;i<prop.quad.quads.length;i++) {
    prop.quad.quads[i].update();
  }
}
