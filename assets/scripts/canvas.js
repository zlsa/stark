
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.font    = "'Exo 2', sans-serif";

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
  return;
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

// UTIL

function canvas_outline_text(cc, text, position, border) {
  if(!border) border = 1;

  cc.save();
  cc.strokeStyle = "rgba(0, 0, 0, 1.0)";
  cc.lineJoin    = "round";
  cc.lineWidth   = border * 2;

  cc.strokeText(text, position[0], position[1]);
  cc.restore();

  cc.fillText(text, position[0], position[1]);

}

/************ SHIP *************/

function canvas_draw_ship(cc, ship) {
  cc.save();

  cc.translate(kilometers(ship.position[0]), -kilometers(ship.position[1]));
  cc.rotate(ship.angle);

  cc.scale(0.5, 0.5);

  var size = 320;

  var image = ship.model.images.normal;

  if(ship.thrust > 0.001)
    image = ship.model.images.engine;
  
  cc.drawImage(image, 0, 0, size, size, -size / 2, -size / 2, size, size);

  cc.restore();

}

/************ SHIPS *************/

function canvas_draw_ships(cc) {
  for(var i=0;i<prop.game.ships.auto.length;i++) {
    canvas_draw_ship(cc, prop.game.ships.auto[i]);
  }
  canvas_draw_ship(cc, prop.game.ships.player);
}

/************ PLANET *************/

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

    cc.restore();
  } else {

  }

}

function canvas_draw_planet_stats(cc, system, planet) {
  var p = planet.getPosition(true);

  if(planet.planets) {
    for(var i=0;i<planet.planets.length;i++) {
      canvas_draw_planet_stats(cc, system, planet.planets[i]);
    }
  }

  var padding = [40, 60];

  if(canvas_is_visible([p[0], -p[1]], planet.radius * 2)) {
    var pan_km = [pixels_to_km(prop.ui.pan[0]), pixels_to_km(prop.ui.pan[1])];
    
    var direction = Math.atan2(-p[0] - pan_km[0], p[1] - pan_km[1]);
    
    var small_ring = pixels_to_km(Math.min(prop.canvas.size[0], prop.canvas.size[1]) / 2 - 20);
    var large_ring = pixels_to_km(Math.max(prop.canvas.size[0], prop.canvas.size[1]) / 2 + 20);
    
    var distance_to_viewport = distance2d([-p[0], p[1]], pan_km);

    distance_to_viewport    *= crange(0, planet.mass, 120, 3, 0.5);

    var alpha = scrange(small_ring * 0.3, distance_to_viewport, large_ring * 0.5, 1, 0);

    if(alpha >= 0.0001) {
      
      cc.save();

      cc.translate(-(prop.canvas.size[0] * 0.5) + padding[0] - ((1 - alpha) * 40), -(prop.canvas.size[1] * 0.5) + padding[0]);

      cc.globalAlpha = alpha;

      var rows = [];

      rows.push(["name", planet.name]);
      rows.push(["type", capitalize(planet.getType())]);
      rows.push(["temperature", planet.getTemperature().toFixed(1) + " °C"]);

      for(var i=0;i<rows.length;i++) {
        rows[i][0] = rows[i][0].toUpperCase();
      }

      cc.font = "14px " + prop.canvas.font;

      var col_padding = 4;
      var xoffset = 0;
      
      for(var i=0;i<rows.length;i++) {
        xoffset = Math.max(cc.measureText(rows[i][0]).width, xoffset);
      }

      xoffset += 4;

      var offset  = 0;

      var height  = rows.length * 18;

      var temp_offset = 0;

      cc.textAlign = "left";
      
      cc.fillStyle = "#ddd";

      for(var i=0;i<rows.length;i++) {
        
        temp_offset = 0;

        if(rows[i][0] != "") {
          cc.save();
          cc.textAlign = "right";
          cc.globalAlpha *= 0.8;
          cc.fillText(rows[i][0], xoffset - col_padding - ((1 - alpha) * 20), (i * 18) - offset);
          cc.restore();
        } else {
          temp_offset = -cc.measureText(rows[i][1]).width / 2;
        }

        cc.save();
        cc.font = "bold 14px " + prop.canvas.font;
        if(i == 0) {
          cc.save();
          var c = new Color(planet.color);
          c.setHsvComponentSaturation(clamp(0, c.getHsvComponentSaturation(), 90));
          c.setHsvComponentValue(clamp(128, c.getHsvComponentValue(), 255));
          cc.fillStyle = c.getCssValue();
          var box_padding = [2, 9];
          cc.fillRect(xoffset + col_padding + temp_offset - box_padding[0], (i * 18) - offset - box_padding[1],
                      cc.measureText(rows[i][1]).width + box_padding[0] * 2, box_padding[1] * 2);
          cc.fillStyle = "#000";
          cc.fillText(rows[i][1], xoffset + col_padding + temp_offset, (i * 18) - offset);
          cc.restore();
        } else {
          cc.fillText(rows[i][1], xoffset + col_padding + temp_offset, (i * 18) - offset);
        }
        cc.restore()
      }

      cc.restore();

    }
  }
}

/************ POINTERS *************/

function canvas_draw_pointer(cc, options) {

  var radius = (options.radius || Math.min(prop.canvas.size[0], prop.canvas.size[1]) / 2);
    
  cc.save();
  
  cc.globalAlpha *= options.fade;
  cc.globalAlpha *= crange(0, options.length, 10, 0, 1);

  var dist = 30; // distance from end of line to text

  var primary_offset = 4;
  var secondary_offset = -8;

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

  cc.font = "bold 12px " + prop.canvas.font;
  cc.strokeText(options.label, ta[0], ta[1] + primary_offset);

  cc.font = "bold 10px " + prop.canvas.font;
  cc.strokeText(options.secondary_label, ta[0], ta[1] + secondary_offset);
  
  cc.restore();

  // COLOR
  cc.fillStyle   = options.color;
  cc.strokeStyle = options.color;
  cc.lineWidth   = options.width;

  cc.beginPath();
  cc.moveTo(-Math.sin(options.direction) * (radius - options.length), -Math.cos(options.direction) * (radius - options.length));
  cc.lineTo(-Math.sin(options.direction) * (radius -              0), -Math.cos(options.direction) * (radius -              0));
  cc.stroke();

  cc.font = "bold 12px " + prop.canvas.font;
  cc.fillText(options.label, ta[0], ta[1] + primary_offset);

  cc.font = "bold 10px " + prop.canvas.font;
  cc.fillText(options.secondary_label, ta[0], ta[1] + secondary_offset);
  
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

    var max_distance = crange(10, planet.mass, 1200, 300000, 2000000);

    if(distance_to_parent > 0) {
      max_distance  *= crange(3000, distance_to_parent, 12000, 0.1, 1);
    }

    var fade = crange(0, distance_to_viewport, max_distance, 1, 0);

    var color = planet.color;
    if(!color) {
      color = new Color().setColorTemperatureValue(planet.temperature); // stars
    }
    color = color.getCssValue();

    var inset = scrange(3200, distance_to_viewport, 6000, 60, 0);
    inset    *=  crange(3000, distance_to_parent,   3500,  1, 0);

    canvas_draw_pointer(cc, {
      radius:          kilometers(small_ring) + 10 - inset,

      direction:       direction,
      length:          length,
      width:           crange(0, planet.mass, 1200, 1.5, 12),

      label:           planet.name,
      secondary_label: to_distance(distance_to_viewport),

      color:           color,
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

    var color = "#ccc";
    if(ship.type == "auto") color = "#888";

    canvas_draw_pointer(cc, {
      radius:          kilometers(small_ring) - 120,

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

/* FUEL */

function canvas_draw_ring_gauge(cc, options) {

  var amount     = options.amount;
  var thickness  = options.thickness || 3;
  var radius     = options.radius || 30;
  var fade       = options.fade  || 1;
  var spill      = options.spill || 0;
  var stops      = options.stops || false;
  var stop_width = options.stop_width || 1;
  var max        = radians(options.max || 360);
  var start      = radians(options.start) || (Math.PI - (max * 0.5));

  cc.lineWidth = thickness;
  cc.lineEnd   = "butt";

  cc.save();

  cc.beginPath();
  cc.rotate(-Math.PI * 0.5 + start);
  cc.arc(0, 0, radius - thickness * 0.5 - 2, 0, amount * max);
  cc.stroke();

  cc.lineWidth = 1;
  cc.beginPath();
  cc.arc(0, 0, radius - 0.5, 0, max);
  cc.stroke();
  
  cc.restore();

  if(stops) {
    cc.save();

    cc.lineWidth = stop_width;

    var stop_min = radius - thickness - spill - 2;
    var stop_max = radius + 0         + spill;

    cc.rotate(-Math.PI + start);

    cc.beginPath();
    cc.moveTo(0, stop_min);
    cc.lineTo(0, stop_max);

    cc.rotate(max);

    cc.moveTo(0, stop_min);
    cc.lineTo(0, stop_max);

    cc.stroke();

    cc.restore();
  }

  if(options.label) {
    cc.font = "bold 14px " + prop.canvas.font;
    cc.fillText(options.label, 0, 0);
  }
}

function canvas_draw_fuel_hud(cc, ship, type) {
  var padding = [40, 20];
  var radius = 40;

  if(type == "jump") padding[0] += radius * 2 + 20;

  cc.save();
  cc.translate(-prop.canvas.size[0] / 2 + padding[0] + radius, prop.canvas.size[1] / 2 - padding[1] - radius);

  var fraction   = ship.fuel[type].getFraction();

  var warning    = scrange(0.15, fraction, 0.20, 1, 0);
  var blink      = scrange(0.05, fraction, 0.10, 1, 0);

  var alpha      = crange(-1, Math.sin(game_time() * 6), 1, 1 - (0.6 * blink), 1);

  cc.globalAlpha = alpha;

  cc.fillStyle   = new Color("#ddd").blend(new Color("f42"), warning).getCssValue();

  cc.strokeStyle = cc.fillStyle;

  var fuel_type  = ship.model.fuel[type].type;
  var label      = prop.ship.fuels[fuel_type].element;

  canvas_draw_ring_gauge(cc, {
    radius:     radius,
    thickness:  6,
    stops:      true,
    stop_width: 1,
    spill:      0,

    label:      label,
    
    amount:     fraction,
    max:        315
  });

  cc.restore();
}

/************ STARFIELD **************/

function canvas_draw_starfield(cc) {
  return;
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

/************ MAIN ELEMENTS **************/

function canvas_draw_system(cc) {
  var system = system_get();

  cc.fillStyle = new Color().setColorTemperatureValue(system.star.temperature).getCssValue();
  
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

  for(var i=0;i<system.planets.length;i++) {
    canvas_draw_planet_stats(cc, system, system.planets[i]);
  }

  canvas_draw_planet_pointer(cc, system, system.star);

  canvas_draw_fuel_hud(cc, prop.game.ships.player, "impulse");
  canvas_draw_fuel_hud(cc, prop.game.ships.player, "jump");

}

/************ HELPER *************/

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

/************ UPDATE *************/

function canvas_update_post() {
  if(!prop.canvas.enabled) return;
  var cc=canvas_get("main");

  cc.textAlign    = "center";
  cc.textBaseline = "middle";

  cc.save();
  canvas_clear(cc);
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
