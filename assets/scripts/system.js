
var System=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.title = options.title || null;
      this.name  = options.name || null;

      this.star  = null;

      var s = options.star;
      if(s) {
        s.system  = this;
        this.star = new Star(s);
      }

      this.planets = {};

      if(options.url) {
        this.load(options.url);
      }

      if(options.planets) {
        for(var i in options.planets) {
          var p = options.planets[i];
          p.system = this.system;
          this.planets[i] = new Planet(p);
        }
      }

    },
    gravityAt: function(position, mass) {
      var force = [0, 0];

      for(var p in this.planets) {
        var f = this.planets[p].gravityAt(position, mass);
        force[0] += f[0];
        force[1] += f[1];
      }

      f = this.star.gravityAt(position, mass);
      force[0] += f[0];
      force[1] += f[1];

      return force;
    },
    velocityAt: function(position) {
      var velocity = [0, 0];

      for(var p in this.planets) {
        var v = this.planets[p].velocityAt(position);
        velocity[0] += v[0];
        velocity[1] += v[1];
      }

      return velocity;
    },
    dampingAt: function(position) {
      var damping = 0;

      for(var p in this.planets) {
        damping += this.planets[p].dampingAt(position);
      }

      damping += this.star.dampingAt(position);
      return damping;
    },
    parse: function(data) {
      this.title = data.title;
      
      data.star.system = this;
      this.star = new Star(data.star);

      for(var i in data.planets) {
        if(data.planets[i].offset) data.planets[i].offset = radians(data.planets[i].offset);
        var p = data.planets[i];
        p.name = i;
        p.system = this;
        var planet = new Planet(p);
        this.planets[i] = planet;
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

    render: function() {
      for(var p in this.planets) {
        this.planets[p].render();
      }
    },

    update: function() {
      for(var p in this.planets) {
        this.planets[p].update();
      }
    },

    save: function() {
      var data = {};

      log("system save", LOG_DEBUG);

      data.title = this.title;
      data.name  = this.name;

      data.star  = this.star.save();

      data.planets = {};

      for(var i in this.planets) {
        data.planets[i] = this.planets[i].save();
      }
      
      return data;
    }
  };
});

function system_init_pre() {
  prop.system = {};
  prop.system.systems = {};
  
  prop.system.root = "assets/systems/";
}

function system_init() {
  system_load("sol");
}

function system_load(name, url) {
  if(!url) {
    url = prop.system.root + name + ".json";
  }
  system_add(new System({
    name: name,
    url: url
  }));
}

function system_add(system) {
  prop.system.systems[system.name] = system;
}

function system_get() {
  return prop.game.system;
}

function system_update() {

}
