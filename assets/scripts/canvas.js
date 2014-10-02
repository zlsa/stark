
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.enabled = true;

  prop.canvas.contexts={};

  // resize canvas to fit window?
  prop.canvas.resize=true;

  prop.canvas.size = [0, 0]
}

function canvas_init() {
  canvas_add("main");
  
  canvas_render_star();
}

function canvas_render_star() {
  var size = 8;
  prop.canvas.star = canvas_new(size, size);

  prop.canvas.star.fillStyle = prop.canvas.star.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  prop.canvas.star.fillStyle.addColorStop(0, "#fff");
  prop.canvas.star.fillStyle.addColorStop(0.5, "#fff");
  prop.canvas.star.fillStyle.addColorStop(1, "rgba(255, 255, 255, 0)");
  
  prop.canvas.star.fillRect(0, 0, size, size);

  prop.canvas.star_size = size;
}

function canvas_new(width, height) {
  return $("<canvas width='"+width+"' height='"+height+"'></canvas>").get(0).getContext("2d");
}

function canvas_resize() {
  if(prop.canvas.resize) {
    prop.canvas.size[0] = $(window).width();
    prop.canvas.size[1] = $(window).height();
  }
  for(var i in prop.canvas.contexts) {
    prop.canvas.contexts[i].canvas.height = prop.canvas.size[1];
    prop.canvas.contexts[i].canvas.width  = prop.canvas.size[0];
  }
}

function canvas_add(name) {
  $("#canvases").append("<canvas id='"+name+"-canvas'></canvas>");
  prop.canvas.contexts[name]=$("#"+name+"-canvas").get(0).getContext("2d");
}

function canvas_get(name) {
  return(prop.canvas.contexts[name]);
}

function canvas_clear(cc) {
  cc.clearRect(0, 0, prop.canvas.size[0], prop.canvas.size[1]);
}

/* DRAW */

/* BACKGROUND */

function canvas_draw_background(cc) {

}

function canvas_draw_ship(cc, ship) {
  cc.save();

  cc.translate(kilometers(ship.position[0]), -kilometers(ship.position[1]));
  cc.rotate(ship.angle);

  cc.scale(0.5, 0.5);

  var size = 320;

  var image = ship.model.images.normal;

  if(ship.controls[1] > 0.2)
    image = ship.model.images.engine;
  
  cc.drawImage(image, 0, 0, size, size, -size / 2, -size / 2, size, size);

  cc.restore();

  if(false) { // path

    cc.save();

    cc.strokeStyle = "#ff0";
    cc.lineWidth   = 2;

    cc.beginPath();

    cc.moveTo(kilometers(ship.path[0][0]), -kilometers(ship.path[0][1]));

    for(var i=1;i<ship.path.length;i++) {
      cc.lineTo(kilometers(ship.path[i][0]), -kilometers(ship.path[i][1]));
    }

    cc.stroke();

    cc.restore();
  }
}

function canvas_draw_ships(cc) {
  for(var i=0;i<prop.game.ships.auto.length;i++) {
    canvas_draw_ship(cc, prop.game.ships.auto[i]);
  }
  canvas_draw_ship(cc, prop.game.ships.player);
}

// SYSTEM

function canvas_draw_planet(cc, system, planet) {
  var p = planet.getPosition(true);

  if(planet.planets) {
    for(var i=0;i<planet.planets.length;i++) {
      canvas_draw_planet(cc, system, planet.planets[i]);
    }
  }

  if(canvas_is_visible([p[0], -p[1]], planet.radius * 2)) {
    cc.save();
    
    cc.translate(kilometers(p[0]), -kilometers(p[1]));
    
    cc.fillStyle = planet.color.getCssValue();

//    cc.beginPath();
//    cc.arc(0, 0, kilometers(planet.radius), 0, Math.PI*2);
//    cc.fill();

//    cc.rotate(game_time() * 0.001);

    if(planet.canvas.planet) {
      var offset = Math.ceil(kilometers(planet.radius)) + 2;
      var size   = Math.ceil(kilometers(planet.radius * 2))
      cc.drawImage(planet.canvas.planet.canvas, -offset, -offset, size, size);
    }

    if(planet.canvas.atmosphere) {
      var offset = Math.ceil(kilometers(planet.radius + planet.atmosphere.thickness)) + 2;
      var size   = Math.ceil(kilometers((planet.radius + planet.atmosphere.thickness) * 2))
      cc.drawImage(planet.canvas.atmosphere.canvas, -offset, -offset, size, size);
    }

    // cc.strokeStyle = "#f83";
    // cc.lineWidth   = 2;

    // var velocity = planet.getVelocity();

    // cc.beginPath();
    // cc.moveTo(0, 0);
    // cc.lineTo(velocity[0] * 0.5, -velocity[1] * 0.5);
    // cc.stroke();
    
    cc.restore();
  } else {
  }

}

function canvas_draw_pointer(cc, options) {

  var radius = (options.radius || Math.min(prop.canvas.size[0], prop.canvas.size[1]) / 2);
    
  cc.save();
  
  cc.textAlign    = "center";
  cc.textBaseline = "middle";

  cc.globalAlpha *= options.fade;

  var dist = 20; // distance from end of line to text

  var ta = [
      -Math.sin(options.direction) * (radius - options.length - dist),
      -Math.cos(options.direction) * (radius - options.length - dist)
  ];

  // OUTLINE
  cc.save();

  var border     = options.outline || 1;

  cc.strokeStyle = "rgba(0, 0, 0, 1.0)";
  cc.lineJoin    = "round";
  cc.lineWidth   = options.width + border * 2;

  cc.beginPath();
  cc.moveTo(-Math.sin(options.direction) * (radius - options.length - border), -Math.cos(options.direction) * (radius - options.length - border));
  cc.lineTo(-Math.sin(options.direction) * (radius -              0 + border), -Math.cos(options.direction) * (radius -              0 + border));
  cc.stroke();

  cc.lineWidth = border * 2;

  cc.font = "bold 12px Roboto Condensed";
  cc.strokeText(options.label, ta[0], ta[1]);

  cc.font = "bold 10px Roboto Condensed";
  cc.strokeText(options.secondary_label, ta[0], ta[1] - 12);
  
  cc.restore();

  // COLOR
  cc.fillStyle   = options.color;
  cc.strokeStyle = options.color;
  cc.lineWidth   = options.width;

  cc.beginPath();
  cc.moveTo(-Math.sin(options.direction) * (radius - options.length), -Math.cos(options.direction) * (radius - options.length));
  cc.lineTo(-Math.sin(options.direction) * (radius -              0), -Math.cos(options.direction) * (radius -              0));
  cc.stroke();

  cc.font = "bold 12px Roboto Condensed";
  cc.fillText(options.label, ta[0], ta[1]);

  cc.font = "bold 10px Roboto Condensed";
  cc.fillText(options.secondary_label, ta[0], ta[1] - 12);
  
  cc.restore();
}

function canvas_draw_planet_pointer(cc, system, planet) {
  var p = planet.getPosition(true);

  if(planet.planets) {
    for(var i=0;i<planet.planets.length;i++) {
      canvas_draw_planet_pointer(cc, system, planet.planets[i]);
    }
  }

  if(true) {
    var pan_km = [pixels_to_km(prop.ui.pan[0]), pixels_to_km(prop.ui.pan[1])];
    
    var direction = Math.atan2(-p[0] - pan_km[0], p[1] - pan_km[1]);
    
    var small_ring = pixels_to_km(Math.min(prop.canvas.size[0], prop.canvas.size[1]) / 2 - 20);
    var large_ring = pixels_to_km(Math.max(prop.canvas.size[0], prop.canvas.size[1]) / 2 + 20);
    
    var distance_to_viewport = distance2d([-p[0], p[1]], pan_km);
    var distance_to_parent   = 0;

    if(planet.parent) {
      distance_to_parent = planet.distance;
    }

    var length = scrange(small_ring * 0.8, distance_to_viewport, large_ring * 1.2, 0, 20);

    var max_distance = crange(10, planet.mass, 1200, 100000, 1200000);

    if(distance_to_parent > 0) {
      max_distance  *= crange(1500, distance_to_parent, 12000, 0.1, 1);
    }

    var fade = crange(0, distance_to_viewport, max_distance, 1, 0);
    fade    *= crange(small_ring * 0.8, distance_to_viewport, large_ring * 1.2, 0, 1);

    canvas_draw_pointer(cc, {
      radius:          kilometers(small_ring) + 10,

      direction:       direction,
      length:          length,
      width:           crange(0, planet.mass, 1200, 1.5, 12),

      label:           planet.name,
      secondary_label: to_distance(distance_to_viewport),

      color:           planet.color.getCssValue(),
      fade:            fade
    });

  }

}

function canvas_draw_ship_pointer(cc, ship) {
  var p = ship.position;

  if(true) {
    var pan_km = [pixels_to_km(prop.ui.pan[0]), pixels_to_km(prop.ui.pan[1])];
    
    var direction = Math.atan2(-p[0] - pan_km[0], p[1] - pan_km[1]);
    
    var small_ring = pixels_to_km(Math.min(prop.canvas.size[0], prop.canvas.size[1]) / 2 - 20);
    var large_ring = pixels_to_km(Math.max(prop.canvas.size[0], prop.canvas.size[1]) / 2 + 20);
    
    var distance_to_viewport = distance2d([-p[0], p[1]], pan_km);

    if(distance_to_viewport < small_ring * 0.8) return;

    var length = scrange(small_ring * 0.8, distance_to_viewport, large_ring * 1.2, 0, 20);

    var max_distance = 30000;

    max_distance    *= crange(0, ship.model.mass, 10, 0.5, 3);
    
    var ship_force   = distance2d(system_get().gravityAt(p, 1));
    max_distance    *= crange(5, ship_force, 30, 1, 0);

    var fade = crange(0, distance_to_viewport, max_distance, 1, 0);
    fade    *= crange(small_ring * 0.8, distance_to_viewport, large_ring * 1.2, 0, 1);

    var color = "#ccc";
    if(ship.type == "auto") color = "#888";

    canvas_draw_pointer(cc, {
      radius:          kilometers(small_ring) - 60,

      direction:       direction,
      length:          length,
      width:           crange(0, ship.model.mass, 10, 2.5, 5),

      label:           ship.model.name,
      secondary_label: to_distance(distance_to_viewport),

      color:           color,
      fade:            fade
    });

  }

}

function canvas_draw_starfield(cc) {
  var system = system_get();

  for(var i=0;i<system.starfield.length;i++) {
    var star = system.starfield[i];

    var depth = crange(0, star[1], 1, 0.5, 0.1);

    var pos = [
      mod(star[0][0] + (prop.ui.pan[0] * depth), prop.canvas.size[0]),
      mod(star[0][1] + (prop.ui.pan[1] * depth), prop.canvas.size[1])
    ];

//    cc.arc(pos[0], pos[1], crange(0, star[1], 1, 2, 0.5), 0, Math.PI*2);
//    cc.rect(pos[0], pos[1], crange(0, star[1], 1, 2, 0.5), crange(0, star[1], 1, 2, 0.5));
    var s    = prop.canvas.star_size;
    var size = crange(0, star[1], 1, s, 1);
    cc.drawImage(prop.canvas.star.canvas, pos[0] - s, pos[1] - s, size, size);
  }

}

function canvas_draw_system(cc) {
  var system = system_get();

  cc.fillStyle = system.star.color.getCssValue();
  
  cc.beginPath();
  cc.arc(0, 0, kilometers(system.star.radius), 0, Math.PI*2);
  cc.fill();

  for(var i=0;i<system.planets.length;i++) {
    canvas_draw_planet(cc, system, system.planets[i]);
  }

}

function canvas_draw_hud(cc) {
  var system = system_get();

  for(var i=0;i<system.planets.length;i++) {
    canvas_draw_planet_pointer(cc, system, system.planets[i]);
  }

  for(var i=0;i<prop.game.ships.auto.length;i++) {
    canvas_draw_ship_pointer(cc, prop.game.ships.auto[i]);
  }

  canvas_draw_planet_pointer(cc, system, system.star);

}

function canvas_is_visible(position, size) { // position in km
  var width  = prop.canvas.size[0] + kilometers(size) * 2;
  var height = prop.canvas.size[1] + kilometers(size) * 2;

  position = [kilometers(position[0]), kilometers(position[1])];
  
  position[0] += prop.ui.pan[0];
  position[1] += prop.ui.pan[1];
  if(position[0] < -width  / 2 || position[0] > width  / 2) return false;
  if(position[1] < -height / 2 || position[1] > height / 2) return false;
  return true;
}

function canvas_update_post() {
  if(!prop.canvas.enabled) return;
  var cc=canvas_get("main");

  cc.save();

  canvas_clear(cc);
  canvas_draw_background(cc);
  cc.restore();

  cc.save();

  canvas_draw_starfield(cc);

  cc.translate(prop.canvas.size[0] / 2, prop.canvas.size[1] / 2);

  cc.translate(prop.ui.pan[0], prop.ui.pan[1]);

  canvas_draw_system(cc);
  canvas_draw_ships(cc);

  cc.restore();

  cc.save();

  cc.translate(prop.canvas.size[0] / 2, prop.canvas.size[1] / 2);
  canvas_draw_hud(cc);
  cc.restore();

}
