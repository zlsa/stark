
var Star=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.name        = "";

      this.system      = null;

      this.radius      = 1;
      this.mass        = 1;
      this.temperature = 5800;

      this.canvas = {
        star: null,
      };
      
      if(options.url) {
        this.load(options.url);
      }

      this.parse(options);

      this.render();

    },

    generate: function() {
      this.name = "Star";

      this.radius = random(200, 8000);

      this.mass  = crange(200, this.radius, 800, 7000, 3000);
      this.mass += crange(800, this.radius, 8000, 0, 5000);

      this.temperature = crange(200, this.radius, 8000, 8000, 3500);

      return this;
    },

    parse: function(data) {
      if(data.name) {
        this.name = data.name;
      }

      if(data.radius) {
        this.radius = data.radius;
      }

      if(data.mass) {
        this.mass = data.mass;
      }

      if(data.temperature) {
        this.temperature = data.temperature;
      }

      if(data.system) {
        this.system = data.system;
      }

    },
    getPosition: function() {
      return [0, 0];
    },
    dampingAt: function(position) {
      var distance = distance2d(position);

      if(distance > this.radius) return 0;

      var density = 5;
      var damping = crange(this.radius, distance, this.radius * 5, density, 0);

      return damping;
    },
    gravityAt: function(position, mass) {
      var pp        = [0, 0];

      var distance  = distance2d([distance2d(pp, position), this.radius]);
      var pull      = (this.mass * mass * 100000) / (distance * distance);

      pull *= crange(this.radius * 2, distance, this.radius * 10, 0.05, 1);

      var direction = Math.atan2((position[0] - pp[0]), (position[1] - pp[1]));

      var force     = [pull * Math.sin(direction), pull * Math.cos(direction)];

      return force;
    },
    renderStar: function() {
      var size   = Math.ceil(this.radius*2);
      var center = size/2;
      var cc     = canvas_new(size, size);

      cc.arc(center, center, center, 0, Math.PI/2);
      cc.fillStyle="#3f8";
      cc.fill();

      this.canvas.star = cc;
    },
    render: function() {
      this.renderStar();
    },
    update: function() {

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
      log("star save", LOG_DEBUG);

      var data = {};

      data.name         = this.name;

      data.temperature  = this.temperature;

      data.radius       = this.radius;

      data.mass         = this.mass;

      return data;
    }
  };
});
