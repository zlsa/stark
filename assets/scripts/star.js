
var Star=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.title    = options.title || "";

      this.color    = new Color(options.color || "#fff");

      this.radius   = options.radius   || 1;

      this.system   = options.system || null;

      this.mass     = options.mass || 1;

      this.canvas = {
        star: null,
      };
      
      if(options.url) {
        this.load(options.url);
      } else {

      }

      this.render();

    },
    parse: function(data) {

    },
    getPosition: function() {
      return [0, 0];
    },
    dampingAt: function(position) {
      var distance = distance2d(position);

      if(distance > this.radius) return 0;

      var density = 1000;
      var damping = crange(this.radius, distance, this.radius * this.falloff, density, 0);
      return damping;
    },
    gravityAt: function(position, mass) {
      var pp        = [0, 0];

      var distance  = distance2d([0, 0], [distance2d(pp, position), this.radius]);
      var pull      = (this.mass * mass * 100000) / (distance * distance);

//      pull *= crange(this.radius * 0, distance, this.radius * 1.414, 0, 1);

      var direction = Math.atan2((position[0] - pp[0]), (position[1] - pp[1]));

//      pull *= crange(0, distance, this.radius, 0, 1);

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
    }
  };
});
