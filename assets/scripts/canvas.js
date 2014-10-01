
function canvas_init_pre() {
  prop.canvas={};

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
    prop.canvas.size.width=$(window).width();
    prop.canvas.size.height=$(window).height();
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

  cc.save()

  cc.translate(kilometers(ship.position[0]), -kilometers(ship.position[1]));

  var force = system_get().gravityAt(ship.position, 1);

  cc.strokeStyle = "#38f";
  cc.lineWidth   = 2;

  cc.beginPath();
  cc.moveTo(0, 0);
  cc.lineTo(-force[0] * 0.5, force[1] * 0.5);
  cc.stroke();


  cc.strokeStyle = "#f83";
  cc.lineWidth   = 2;

  cc.beginPath();
  cc.moveTo(0, 0);
  cc.lineTo(ship.velocity[0] * 0.5, -ship.velocity[1] * 0.5);
  cc.stroke();

  cc.restore();

  cc.save();

  cc.strokeStyle = "#f0f";
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
  canvas_draw_ship(cc, prop.ship.player);
}

// SYSTEM

function canvas_draw_planet(cc, system, planet) {
  cc.save();
  
  var p = planet.getPosition();

  cc.translate(kilometers(p[0]), -kilometers(p[1]));
  
  cc.fillStyle = "#999";

  cc.beginPath();
  cc.arc(0, 0, kilometers(planet.radius), 0, Math.PI*2);
  cc.fill();
  
  for(var i in planet.planets) {
    canvas_draw_planet(cc, system, planet.planets[i]);
  }

  cc.restore();
}

function canvas_draw_system(cc) {
  var system = system_get();

  cc.fillStyle = "#fff";

  cc.beginPath();
  cc.arc(0, 0, 100, 0, Math.PI*2);
  cc.fill();
  
  for(var i in system.planets) {
    canvas_draw_planet(cc, system, system.planets[i]);
  }

}

function canvas_update_post() {
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
}
