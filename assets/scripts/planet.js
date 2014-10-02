
var Planet=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.name      = "";

      this.color     = new Color("#fff");
      this.image     = null;
      this.image_url = null;

      this.distance     = 1;
      this.radius       = 1;
      this.start_offset = 0;
      this.period       = 100;

      this.parent   = null;
      this.system   = null;

      this.mass     = 1;

      this.position = [0, 0];

      this.offset   = 0;

      this.type     = "rocky";

      this.environment = {
        craters: 0,
      };

      this.atmosphere = {
        thickness: 2,
        density:   0.5,
        colors: [

        ]
      };

      this.planets = [];

      this.canvas = {
        planet: null,
        atmosphere: null
      };
      
      this.content = {};

      this.parse(options);

    },
    parse: function(data) {
      if(data.parent) {
        this.parent = data.parent;
      }

      if(data.system) {
        this.system = data.system;
      }

      this.name = data.name || this.name;
      
      if(data.color) {
        this.color = new Color(data.color);
      }

      if(data.distance) {
        this.distance = data.distance;
      }

      if(data.radius) {
        this.radius = data.radius;
      }

      if(data.offset) {
        this.start_offset = radians(data.offset);
        this.offset       = this.start_offset;
      }

      if(data.period) {
        this.period = data.period;
      }

      if(data.mass) {
        this.mass = data.mass;
      }

      if(data.type) {
        this.type = data.type;
      }

      if(data.environment) {
        this.environment = data.environment;
        if(!this.environment.craters) {
          this.environment.craters = 0;
        }
      }

      if(data.atmosphere) {
        this.atmosphere = data.atmosphere;
        if(!this.atmosphere.thickness) {
          this.atmosphere.thickness = 2;
        }

        if(!this.atmosphere.density) {
          this.atmosphere.density = 0;
        }

        if(!this.atmosphere.colors) {
          this.atmosphere.colors = [];
        }
      }

      if(data.image || data.image_url) {
        this.image_url = data.image || data.image_url;

        this.content.image = new Content({
          url: "assets/images/planets/" + this.image_url,
          type: "image",
          that: this,
          callback: function(status, data) {
            this.image = data;
          }
        });
      }

      if(data.planets) {
        for(var i=0;i<data.planets.length;i++) {
          var p = data.planets[i];
          p.parent = this;
          p.system = this.system;
          this.planets[i] = new Planet(p);
        }
      }

    },
    getChild: function(name) {
      name = name.toLowerCase();
      
      for(var i=0;i<this.planets.length;i++) {
        if(this.planets[i].name.toLowerCase() == name) return this.planets[i];
      }

      return null;
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

      var density = Math.max(1, this.atmosphere.density);

      var radius   = Math.max(this.radius, 60);

      var damping = crange(radius * 0.5, distance, radius + this.atmosphere.thickness, density, 0);
      damping *= crange(60, radius, 100, 0.8, 1);

      for(var i=0;i<this.planets.length;i++) {
        damping += this.planets[i].dampingAt(position);
      }

      return damping;
    },
    velocityAt: function(position) { // for damping
      var velocity = this.getVelocity(true);

      var distance = distance2d(this.getPosition(true), position);

      var radius   = Math.max(this.radius, 60);

      var damping = crange(radius + this.atmosphere.thickness, distance, (radius + this.atmosphere.thickness) * 2, 1, 0);

      velocity[0] *= damping;
      velocity[1] *= damping;

      for(var i=0;i<this.planets.length;i++) {
        var v = this.planets[i].velocityAt(position);
        velocity[0] += v[0];
        velocity[1] += v[1];
      }

      return velocity;
    },
    gravityAt: function(position, mass) {
      var pp        = this.getPosition(true);

      var radius    = Math.max(this.radius, 40);

      var distance  = distance2d([0, 0], [distance2d(pp, position), radius]);
      var pull      = (this.mass * mass * 100000) / (distance * distance);

      pull *= crange(radius, distance, radius * 1.414, 0.05, 1);

      var direction = Math.atan2((position[0] - pp[0]), (position[1] - pp[1]));

//      pull *= crange(this.radius * 0.5, distance, this.radius * 1.4, 0, 1);

      var force     = [pull * Math.sin(direction), pull * Math.cos(direction)];

      for(var i=0;i<this.planets.length;i++) {
        var f = this.planets[i].gravityAt(position, mass);
        force[0] += f[0];
        force[1] += f[1];
      }

      return force;
    },

    renderGasPlanet: function(cc, size, scale) {
      var center = size/2;

      var radius = kilometers(this.radius * scale) * 10;
      cc.fillStyle = cc.createRadialGradient(center, -radius, radius, center, -radius, radius + kilometers(this.radius * 2 * scale));

      var s = crange(10, this.radius, 1000, 3, 0.05) * 0.03;

      for(var i=0;i<kilometers(this.radius * 2 * scale);i+=3) {
        var c = new Color(this.color);
        c.setHsvComponentValue(c.getHsvComponentValue() * crange(-1, srt(5098, i * s), 1, 0.8, 1.1));
        cc.fillStyle.addColorStop(i / kilometers(this.radius * scale) / 2, c.getCssValue());
      }

      cc.arc(center, center, kilometers(this.radius * scale), 0, Math.PI * 2);
      cc.fill();
    },
    renderRockyPlanet: function(cc, size, scale) {
      var center = size/2;

      var s = crange(10, this.radius, 1000, 0.4, 3) * scale;

      var height = 1;

      cc.save();

      cc.arc(center, center, kilometers(this.radius * scale) + 0.5, 0, Math.PI * 2);
      cc.fillStyle = this.color.getCssValue();
      cc.fill();

      cc.clip();

      var tilesize = 10;

      var feature_number = this.radius * this.radius * 0.025 * random(0.7, 1.3);

      for(var i=0;i<feature_number;i++) {
        var c = new Color(this.color);
        var x = random(0, size);
        var y = random(0, size);

        var change = random(0.7, 1.1);
        var crater = (random(0, 3)) < this.environment.craters && change < 1;
        
        var feature_size = random(kilometers(4) * s, kilometers(30) * s);

        if(crater) feature_size *= 1.2;

        c.setHsvComponentValue(c.getHsvComponentValue() * change);

        if(crater) {
          cc.fillStyle = cc.createRadialGradient(x, y + feature_size * 0.5, 0, x, y, feature_size * 2);
        } else {
          cc.fillStyle = cc.createRadialGradient(x, y, 0, x, y, feature_size * 2);
        }

        if(crater) {
          cc.fillStyle.addColorStop(0,   c.setOpacity(0).getCssValue());
          cc.fillStyle.addColorStop(0.7, c.setOpacity(1).getCssValue());
          cc.fillStyle.addColorStop(1,   c.setOpacity(0).getCssValue());
        } else {
          cc.fillStyle.addColorStop(0, c.getCssValue());
          cc.fillStyle.addColorStop(1, c.setOpacity(0).getCssValue());
        }

        cc.fillRect(x - feature_size * 2, y - feature_size * 2, feature_size * 4, feature_size * 4);

      }

      cc.restore();

      cc.arc(center, center, kilometers(this.radius * scale) + 1, 0, Math.PI * 2);
      cc.fillStyle = cc.createRadialGradient(center, center, 0, center, center, center);
      cc.fillStyle.addColorStop(0.0, "rgba(0, 0, 0, 0.10)");
      cc.fillStyle.addColorStop(0.5, "rgba(0, 0, 0, 0.32)");
      cc.fillStyle.addColorStop(0.9, "rgba(0, 0, 0, 0.65)");
      cc.fillStyle.addColorStop(1.0, "rgba(0, 0, 0, 0.75)");

      cc.fill();
    },
    renderPlanet: function() {
      var scale  = 2;
      var size   = Math.ceil(kilometers(this.radius * 2 * scale)) + 4;
      var center = size/2;
      var cc     = canvas_new(size, size);

      if(!this.image) {
        cc.save();

        if(this.type == "gas") {
          this.renderGasPlanet(cc, size, scale);
        } else if(this.type == "rocky") {
          this.renderRockyPlanet(cc, size, scale);
        } else {
          cc.arc(center, center, kilometers(this.radius), 0, Math.PI * 2);
          cc.fillStyle = this.color.getCssValue();
          cc.fill();
        }
        cc.restore();
      } else {
        cc.drawImage(this.image, 1, 1, kilometers(this.radius * 2 * scale), kilometers(this.radius * 2 * scale));
      }

      this.canvas.planet = cc;
    },
    renderAtmosphere: function() {
      if(!this.atmosphere || !this.atmosphere.colors || this.atmosphere.colors.length < 1) {
        var c = new Color(this.color);
        c.setHsvComponentValue(c.getHsvComponentValue() * 0.7);
        this.atmosphere.colors = [
//          [0, c.getCssValue()]
        ];
//        return;
      }

      if(this.atmosphere.colors.length < 1) return;

      if(this.atmosphere.colors && this.atmosphere.colors.length >= 1) {
        this.atmosphere.colors.push([1.0, this.atmosphere.colors[this.atmosphere.colors.length-1][1]]);
      }

      var size   = Math.ceil(kilometers(this.radius + this.atmosphere.thickness) * 2) + 2;
      var center = size/2;
      var cc     = canvas_new(size, size);
      
      var radius = kilometers(this.radius) / center;

      cc.fillStyle = cc.createRadialGradient(center, center, 0, center, center, kilometers(this.radius + this.atmosphere.thickness));

      cc.fillStyle.addColorStop(radius * 0,    new Color(this.atmosphere.colors[0][1]).setOpacity(0).getCssValue());
      if(!this.image) {
        cc.fillStyle.addColorStop(radius * 0.96, new Color(this.atmosphere.colors[0][1]).setOpacity(0.5).getCssValue());
      } else {
        cc.fillStyle.addColorStop(radius * 0.96, new Color(this.atmosphere.colors[0][1]).setOpacity(0.2).getCssValue());
      }

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
      console.log("rendering planet " + this.name);
      
      var start = time();

      this.renderPlanet();
      this.renderAtmosphere();

      var elapsed = time() - start;

      console.log("took " + elapsed.toFixed(4) + " seconds to render " + this.name);
    },
    
    update: function() {

      if(this.start_offset < 0) {
        this.offset = -(game_time() / this.period) * Math.PI + Math.abs(this.start_offset);
      } else {
        this.offset = (game_time() / this.period) * Math.PI + Math.abs(this.start_offset);
      }

      var pos = this.getPosition(true);
      if(canvas_is_visible([pos[0], -pos[1]], this.radius * 2) && !this.canvas.planet) {
        this.render();
      }

      for(var i=0;i<this.planets.length;i++) {
        this.planets[i].update();
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
    },

    save: function() {
      log("planet save", LOG_FLOOD);

      var data = {};
      
      data.name  = this.name;
      data.color = this.color.getSaveableValue();

      data.image_url    = this.image_url;

      data.distance     = this.distance;
      data.radius       = this.radius;
      data.offset       = degrees(this.start_offset);
      
      data.period       = this.period;

      data.mass         = this.mass;

      data.type         = this.type;
      data.environment  = this.environment;

      data.atmosphere   = this.atmosphere;

      data.planets      = [];

      for(var i in this.planets) {
        data.planets.push(this.planets[i].save());
      }

      return data;
    }
  };
});
