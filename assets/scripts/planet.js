
var Planet=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.title    = options.title || "";

      this.color    = new Color(options.color || "#fff");

      this.distance = options.distance || 0;
      this.radius   = options.radius   || 1;
      this.start_offset = options.offset || 0;

      this.period   = options.period   || 100; // seconds for a full trip

      this.parent   = options.parent || null;
      this.system   = options.system || null;

      this.mass     = options.mass || 1;

      this.position = [0, 0];

      this.offset   = this.start_offset;

      this.atmosphere = options.atmosphere || {
        thickness: 100,
        density:   1,
        colors: [
          [0.0, "#38f"]
        ]
      };

      if(this.atmosphere.colors)
        this.atmosphere.colors.push([1.0, "#000"]);

      this.planets = {};
      
      this.canvas = {
        planet: null,
        atmosphere: null
      };
      
      if(options.url) {
        this.load(options.url);
      } else {

      }

      this.render();

      if(options.planets) {
        for(var i in options.planets) {
          var p = options.planets[i];
          p.parent = this;
          p.system = this.system;
          this.planets[i] = new Planet(p);
        }
      }

    },
    parse: function(data) {

    },
    getPosition: function(absolute, time_offset) {
      if(!time_offset) time_offset = 0;
      var p = [0, 0];

      var offset = this.offset + ((time_offset / this.period) * Math.PI);

      p[0] = Math.sin(offset) * this.distance;
      p[1] = Math.cos(offset) * this.distance;

      if(absolute && this.parent) {
        var pp = this.parent.getPosition(true, time_offset);
        p[0] += pp[0];
        p[1] += pp[1];
      }

      return p;
    },
    getVelocity: function(absolute) {

      var p0 = this.getPosition(absolute, 0);
      var p1 = this.getPosition(absolute, 1);
      return [p1[0] - p0[0], p1[1] - p0[1]];

    },
    dampingAt: function(position) {
      var distance = distance2d(this.getPosition(true), position);
//      if(distance > this.radius + this.atmosphere.thickness) return 0;

      var density = Math.max(0.7, this.atmosphere.density);

      var damping = crange(this.radius * 0.5, distance, this.radius + this.atmosphere.thickness, density, 0);

      for(var p in this.planets) {
        damping += this.planets[p].dampingAt(position);
      }

      return damping;
    },
    velocityAt: function(position) { // for damping
      var velocity = this.getVelocity(true);

      var distance = distance2d(this.getPosition(true), position);

      var damping = crange(this.radius + this.atmosphere.thickness, distance, (this.radius + this.atmosphere.thickness) * 2, 1, 0);

      velocity[0] *= damping;
      velocity[1] *= damping;

      for(var p in this.planets) {
        var v = this.planets[p].velocityAt(position);
        velocity[0] += v[0];
        velocity[1] += v[1];
      }

      return velocity;
    },
    gravityAt: function(position, mass) {
      var pp        = this.getPosition(true);

      var distance  = distance2d([0, 0], [distance2d(pp, position), this.radius]);
//      var distance  = distance2d(pp, position);
      var pull      = (this.mass * mass * 100000) / (distance * distance);

      pull *= crange(this.radius, distance, this.radius * 1.414, 0.05, 1);

      var direction = Math.atan2((position[0] - pp[0]), (position[1] - pp[1]));

//      pull *= crange(this.radius * 0.5, distance, this.radius * 1.4, 0, 1);

      var force     = [pull * Math.sin(direction), pull * Math.cos(direction)];

      for(var p in this.planets) {
        var f = this.planets[p].gravityAt(position, mass);
        force[0] += f[0];
        force[1] += f[1];
      }

      return force;
    },
    renderPlanet: function() {
      var size   = Math.ceil(this.radius*2);
      var center = size/2;
      var cc     = canvas_new(size, size);

      cc.arc(center, center, center, 0, Math.PI/2);
      cc.fillStyle="#3f8";
      cc.fill();

      this.canvas.planet = cc;
    },
    render: function() {
      this.renderPlanet();
    },
    complete: function() {
      this.renderPlanet();
    },
    update: function() {
      for(var p in this.planets) {
        this.planets[p].update();
      }

      this.offset = (game_time() / this.period) * Math.PI + this.start_offset;
    },
    load: function(url) {
      this.content=new Content({
        type: "json",
        url: url,
        that: this,
        callback: function(status, data) {
          if(status == "ok") {
            this.parse(data);
          }
        }
      });
    }
  };
});
