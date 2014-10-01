
var Planet=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.distance = options.distance || 0;
      this.radius   = options.radius   || 1;
      this.offset   = options.offset   || 0;

      this.period   = options.period   || 100; // seconds for a full trip

      this.parent   = options.parent || null;
      this.system   = options.system || null;

      this.mass     = options.mass || 1;

      this.position = [0, 0];

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
    getPosition: function(absolute) {
      var p = [0, 0];
      p[0] = Math.sin(this.offset) * this.distance;
      p[1] = Math.cos(this.offset) * this.distance;

      if(absolute && this.parent) {
        var pp = this.parent.getPosition(true);
        p[0] += pp[0];
        p[1] += pp[1];
      }

      return p;
    },
    gravityAt: function(position, mass) {
      var pp        = this.getPosition(true);

      var distance  = distance2d([0, 0], [distance2d(pp, position), this.radius]);
//      var distance  = distance2d(pp, position);
      var pull      = (this.mass * mass) / (distance * distance);

      var direction = Math.atan2((position[0] - pp[0]), (position[1] - pp[1]));

//      pull *= crange(0, distance, this.radius, 0, 1);

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

      this.offset = (game_time() / this.period) * Math.PI;
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
