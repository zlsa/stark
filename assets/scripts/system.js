
var System=Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};

      this.name  = null;

      this.star  = null;

      this.planets = [];

      if(options.url) {
        this.load(options.url);
      } else {
        this.parse(options);
      }

      this.starfield = [];

    },

    generate: function() {
      Math.seedrandom(time());

      this.name = "Untitled System 42";

      this.star = new Star({
        system: this
      }).generate();

      this.planets = [];

      var planet_number = randint(3, 8);
      for(var i=0;i<planet_number;i++) {
        var planet = new Planet({
          system: this
        });
        this.planets.push(planet);
        planet.generate(i, planet_number);
      }

      return this;
    },

    parse: function(data) {
      console.log(data);

      if(data.name) {
        this.name = data.name;
      }
      
      if(data.star) {
        this.star.parse(data.star);
      }

      if(data.planets) {
        for(var i=0;i<data.planets.length;i++) {
          //        if(data.planets[i].offset) {
          //          data.planets[i].offset = radians(data.planets[i].offset);
          //        }
          if(this.planets.length > i) {
            this.planets[i].parse(data.planets[i]);
          } else {
            var p = data.planets[i];
            p.system = this;
            var planet = new Planet(p);
            this.planets.push(planet);
          }
        }
      }

    },

    /* misc stuff */

    closestPlanet: function(position, touching) {
      if(!touching) touching = false;
      var closest_planet = null;
      var closest        = Infinity;

      for(var i=0;i<this.planets.length;i++) {
        var p = this.planets[i].closestPlanet(position, touching);
        if(p[1] < closest) {
          closest_planet = p[0];
          closest        = p[1];
        }
      }
      return closest_planet;
    },
    generateStarfield: function() {
      return;
      var density = 120; // px per star

      var number = (prop.canvas.size[0] * prop.canvas.size[1]) / density / density;

      console.log(number);

      var rng = new Math.seedrandom("starfield");

      this.starfield = [];

      for(var i=0;i<number;i++) {
        var position = [
          rng() * prop.canvas.size[0],
          rng() * prop.canvas.size[1],
        ];
        var depth = rng();
        this.starfield.push([position, depth]);
      }

    },
    resize: function() {
      this.generateStarfield();
    },
    getChild: function(name) {
      name = name.toLowerCase();
      
      for(var i=0;i<this.planets.length;i++) {
        if(this.planets[i].name.toLowerCase() == name) return this.planets[i];
      }

      return null;
    },
    gravityAt: function(position, mass) {
      var force = [0, 0];

      for(var i=0;i<this.planets.length;i++) {
        var f = this.planets[i].gravityAt(position, mass);
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

      for(var i=0;i<this.planets.length;i++) {
        var v = this.planets[i].velocityAt(position);
        velocity[0] += v[0];
        velocity[1] += v[1];
      }

      return velocity;
    },
    dampingAt: function(position) {
      var damping = 0;

      for(var i=0;i<this.planets.length;i++) {
        damping += this.planets[i].dampingAt(position);
      }

      damping += this.star.dampingAt(position);
      return damping;
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
//      for(var p in this.planets) {
//        this.planets[p].render();
//      }
    },

    update: function() {
      for(var p in this.planets) {
        this.planets[p].update();
      }
    },

    save: function() {
      var data = {};

      log("system save", LOG_DEBUG);

      data.name  = this.name;

      data.star  = this.star.save();

      data.planets = [];

      for(var i in this.planets) {
        data.planets.push(this.planets[i].save());
      }
      
      return data;
    }
  };
});

function system_init_pre() {
  prop.system = {};

  prop.system.systems = [];
  
  prop.system.root = "assets/systems/";
}

function system_init() {
//  system_load("sol");
}

function system_generate(name) {
  if(!name) name = "Untitled System 42";
  
  var s = new System();
  s.generate();

  system_add(s);
}

function system_load(name, url) {
  if(!url) {
    url = prop.system.root + name + ".json";
  }
  system_add(new System({
    url: url
  }));
}

function system_add(system) {
  if(prop.game && prop.game.system)
    prop.game.systems.push(system);
  else
    prop.system.systems.push(system);
}

function system_get() {
  return prop.game.system;
}

function system_update() {

}
