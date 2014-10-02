
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.enabled = true;

  prop.canvas.contexts={};

  // resize canvas to fit window?
  prop.canvas.resize=true;

  prop.canvas.size={ // all canvases are the same size
    height:480,
    width:640
  };

}

function canvas_init() {
  canvas_add("main");
}

function canvas_new(width, height) {
  return $("<canvas width='"+width+"' height='"+height+"'></canvas>").get(0).getContext("2d");
}

function canvas_resize() {
  if(prop.canvas.resize) {
    prop.canvas.size.width  = $(window).width();
    prop.canvas.size.height = $(window).height();
  }
  for(var i in prop.canvas.contexts) {
    prop.canvas.contexts[i].canvas.height=prop.canvas.size.height;
    prop.canvas.contexts[i].canvas.width=prop.canvas.size.width;
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
  cc.clearRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
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
  var xoffset=Math.round(clamp(0, mod(ship.angle / (Math.PI*2) * 360, 360), 359))*48;
  xoffset=0;
  var size=96;
  if(ship.controls[1] > 0.2)
    cc.drawImage(ship.images.engine, xoffset, 0, size, size, -size/2, -size/2, size, size);
  else
    cc.drawImage(ship.images.normal, xoffset, 0, size, size, -size/2, -size/2, size, size);

  cc.restore();

  // cc.save()

  // cc.translate(kilometers(ship.position[0]), -kilometers(ship.position[1]));

  // var force = system_get().gravityAt(ship.position, 1);

  // cc.strokeStyle = "#38f";
  // cc.lineWidth   = 2;

  // cc.beginPath();
  // cc.moveTo(0, 0);
  // cc.lineTo(-force[0] * 0.5, force[1] * 0.5);
  // cc.stroke();


  // cc.strokeStyle = "#f83";
  // cc.lineWidth   = 2;

  // cc.beginPath();
  // cc.moveTo(0, 0);
  // cc.lineTo(ship.velocity[0] * 0.5, -ship.velocity[1] * 0.5);
  // cc.stroke();

  // cc.restore();

  return;

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

function canvas_draw_ships(cc) {
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
      var size = Math.ceil(planet.radius) + 4;
      cc.drawImage(planet.canvas.planet.canvas, -size, -size);
    }

    if(planet.canvas.atmosphere) {
      var size = Math.ceil((planet.radius + planet.atmosphere.thickness)) + 4;
      cc.drawImage(planet.canvas.atmosphere.canvas, -size, -size);
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

function canvas_draw_pointer(cc, system, planet) {
  var p = planet.getPosition(true);

  if(planet.planets) {
    for(var i=0;i<planet.planets.length;i++) {
      canvas_draw_pointer(cc, system, planet.planets[i]);
    }
  }

  if(true) {
    var direction = Math.atan2(-p[0] - prop.ui.pan[0], p[1] - prop.ui.pan[1]);

    var l = Math.min(prop.canvas.size.width, prop.canvas.size.height) / 2 - 20;
    var m = Math.max(prop.canvas.size.width, prop.canvas.size.height) / 2 + 20;
    
    var dist = 30;

    var distance = distance2d([-p[0], p[1]], prop.ui.pan);

    var len = scrange(l * 0.8, distance, m * 1.2, 0, 30);

    var force = distance2d(system_get().gravityAt(prop.ui.pan, 1));

    var rp = planet.getPosition();
    var distance_from_parent = distance2d(rp);

    var max_draw = crange(0, planet.mass, 1200, 50000, 350000);
    max_draw *= crange(0, force, 500, 1.8, 0.3);

    if(distance_from_parent > 1) {
      max_draw *= crange(1000, distance_from_parent, 10000, 0.03, 1);
    }

    var distance_visibility = 1; //crange(1000, distance, 10000, 1, crange(500, distance_from_parent, 10000, 0, 1));

    cc.save();
    
    cc.textAlign = "center";
    cc.textBaseline = "middle";

    cc.globalAlpha *= scrange(l * 0.8, distance, m * 1.2, 0, 1);

    // dark outline

    cc.save();

    cc.globalAlpha *= scrange(0.9, distance, max_draw, 1, 0.01);

    cc.strokeStyle = "rgba(32, 32, 32, 1.0)";
    cc.lineJoin    = "round";
    var border = 1;
    cc.lineWidth   = crange(1, planet.mass, 1200, 1.5, 12) + border * 2;

    cc.beginPath();
    cc.moveTo(-Math.sin(direction) * (l - len - border), -Math.cos(direction) * (l - len - border));
    cc.lineTo(-Math.sin(direction) * (l -   0 + border), -Math.cos(direction) * (l -   0 + border));
    cc.stroke();

    cc.lineWidth = border * 2;

    cc.font = "bold 12px Roboto Condensed";
    cc.strokeText(planet.name, -Math.sin(direction) * (l - len - dist), -Math.cos(direction) * (l - len - dist));

    cc.globalAlpha *= distance_visibility;

    cc.font = "bold 10px Roboto Condensed";
    cc.strokeText(to_distance(distance), -Math.sin(direction) * (l - len - dist), -Math.cos(direction) * (l - len - dist) - 12);
    
    cc.restore();

    // color text

    cc.globalAlpha *= scrange(0, distance, max_draw, 1, 0.01);

    cc.lineWidth   = crange(1, planet.mass, 1200, 1.5, 12);
    cc.strokeStyle = planet.color.getCssValue();
    cc.fillStyle   = planet.color.getCssValue();

    cc.beginPath();
    cc.moveTo(-Math.sin(direction) * (l - len), -Math.cos(direction) * (l - len));
    cc.lineTo(-Math.sin(direction) * (l -   0), -Math.cos(direction) * (l -   0));
    cc.stroke();

    cc.font = "bold 12px 'Roboto Condensed', sans-serif";
    cc.fillText(planet.name, -Math.sin(direction) * (l - len - dist), -Math.cos(direction) * (l - len - dist));

    cc.globalAlpha *= distance_visibility;

    cc.font = "bold 10px 'Roboto Condensed', sans-serif";
    cc.fillText(to_distance(distance), -Math.sin(direction) * (l - len - dist), -Math.cos(direction) * (l - len - dist) - 12);

    cc.restore();
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
    canvas_draw_pointer(cc, system, system.planets[i]);
  }

  canvas_draw_pointer(cc, system, system.star);

}

function canvas_is_visible(position, size) { // position in km
  var width  = prop.canvas.size.width  + kilometers(size) * 2;
  var height = prop.canvas.size.height + kilometers(size) * 2;

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

  cc.translate(prop.canvas.size.width/2, prop.canvas.size.height/2);
  cc.translate(prop.ui.pan[0], prop.ui.pan[1]);

  canvas_draw_system(cc);
  canvas_draw_ships(cc);

  cc.restore();

  cc.save();

  cc.translate(prop.canvas.size.width/2, prop.canvas.size.height/2);
  canvas_draw_hud(cc);
  cc.restore();

}
