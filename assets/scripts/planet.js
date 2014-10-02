
var Planet=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.title    = options.title || "";

      this.color    = new Color(options.color || "#fff");
      this.image    = null;

      this.distance = options.distance || 0;
      this.radius   = options.radius   || 1;
      this.start_offset = options.offset || 0;

      this.period   = options.period   || 100; // seconds for a full trip

      this.parent   = options.parent || null;
      this.system   = options.system || null;

      this.mass     = options.mass || 1;

      this.position = [0, 0];

      this.offset   = Math.abs(this.start_offset);

      this.atmosphere = options.atmosphere || {
        thickness: 0,
        density:   0.5,
        colors: [

        ]
      };

      this.planets = {};
      
      this.canvas = {
        planet: null,
        atmosphere: null
      };
      
      if(options.url) {
        this.load(options.url);
      }
      
      this.content = {};

      if(options.image) {
        this.content.image = new Content({
          url: "assets/images/planets/" + options.image,
          type: "image",
          that: this,
          callback: function(status, data) {
            this.image = data;
            console.log("image!");
          }
        });
      }

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

      var density = Math.max(0.5, this.atmosphere.density);

      var damping = crange(this.radius * 0.5, distance, this.radius + this.atmosphere.thickness, density, 0);
      damping *= crange(20, this.radius, 100, 10, 1);

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

      if(!this.image) {
        cc.arc(center, center, center, 0, Math.PI * 2);
        cc.fillStyle = this.color.getCssValue();
        cc.fill();
      } else {
        cc.drawImage(this.image, 0, 0, size, size);
      }

      this.canvas.planet = cc;
    },
    renderAtmosphere: function() {
      if(!this.atmosphere || !this.atmosphere.colors || this.atmosphere.colors.length < 1) {
        var c = new Color(this.color);
        c.setHsvComponentValue(c.getHsvComponentValue() * 0.7);
        this.atmosphere.colors = [
          [0, c.getCssValue()]
        ];
//        return;
      }

      if(this.atmosphere.colors && this.atmosphere.colors.length >= 1) {
        this.atmosphere.colors.push([1.0, this.atmosphere.colors[this.atmosphere.colors.length-1][1]]);
      }

      var size   = Math.ceil(kilometers(this.radius + this.atmosphere.thickness) * 2);
      var center = size/2;
      var cc     = canvas_new(size, size);
      
      var radius = kilometers(this.radius) / center;

      cc.fillStyle = cc.createRadialGradient(center, center, 0, center, center, center);

      cc.fillStyle.addColorStop(radius * 0,     new Color(this.atmosphere.colors[0][1]).setOpacity(0).getCssValue());
      cc.fillStyle.addColorStop(radius * 0.95, new Color(this.atmosphere.colors[0][1]).setOpacity(0.1).getCssValue());

      for(var i=0;i<this.atmosphere.colors.length;i++) {
        var color = this.atmosphere.colors[i];
        var opacity = crange(0, color[0], 1, 1, 0);
        var position = crange(0, color[0], 1, radius, 1);
        cc.fillStyle.addColorStop(position, new Color(color[1]).setOpacity(opacity).getCssValue());
      }

      cc.arc(center, center, center, 0, Math.PI * 2);
      cc.fill();

      this.canvas.atmosphere = cc;
    },
    render: function() {
      this.renderPlanet();
      this.renderAtmosphere();
    },
    complete: function() {
      this.render();
      for(var p in this.planets) {
        this.planets[p].complete();
      }
    },
    update: function() {
      for(var p in this.planets) {
        this.planets[p].update();
      }

      if(this.start_offset < 0) {
        this.offset = -(game_time() / this.period) * Math.PI + Math.abs(this.start_offset);
      } else {
        this.offset = (game_time() / this.period) * Math.PI + Math.abs(this.start_offset);
      }
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
