
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

/* GROUND */

function canvas_draw_ground(cc) {
  var width = Math.ceil(prop.canvas.size.width/2)*2;
  var height = Math.ceil(prop.canvas.size.height/2)*2;
  cc.fillStyle="#333";
  cc.fillRect(-width / 2, 0, width, 10);

  cc.fillStyle="#f00";
  var size = 12;
  cc.fillRect(-size/2 + meters(prop.ui.pan[0]+prop.quad.target[0]), -meters(prop.quad.target[1])-size/2, size, size);

  cc.fillStyle="#aaa";
  size = 6;
  cc.fillRect(-size/2 + meters(prop.ui.pan[0]+prop.quad.target[0]), -meters(prop.quad.target[1])-size/2, size, size);
}

/* GRID */

function canvas_draw_grid(cc) {
  cc.fillStyle="#aaa";
  var spacing=100;
  var width = Math.ceil(prop.canvas.size.width/2) + spacing;
  var x = -(meters(prop.ui.pan[0]) % spacing);
  for(var i=-width-x;i<width+x;i+=spacing) {
    var j = i;// + meters(prop.ui.pan[0]);
    cc.fillRect(j-5, -50, 10, 10);
  }
}

/* QUAD */

function canvas_draw_quad(cc, quad) {
  cc.save();
  var width  = meters(0.6);
  var height = Math.ceil(meters(0.07)) - 2;
  var x=meters(quad.body.position[0]);
  var y=meters(quad.body.position[1]);
  cc.translate(x, -y);
  
  var vspeed = -quad.autopilot.vspeed.get() * 30;
  var hspeed =  quad.autopilot.hspeed.get() * 30;

  cc.save();

  cc.rotate(-quad.body.angle);

  cc.fillStyle="#38f";
  cc.fillRect(-width / 2, -height / 2, width, height);
  cc.fillStyle="#222";
  width = meters(0.2);
  cc.fillRect(-width / 2, height / 2, width, height);

  cc.beginPath();

  var thrust=-meters(quad.power.left_actual*0.5);
  cc.moveTo(meters(-0.2), 0);
  cc.lineTo(meters(-0.2), thrust);

  thrust=-meters(quad.power.right_actual*0.5);
  cc.moveTo(meters(0.2), 0);
  cc.lineTo(meters(0.2), thrust);

  cc.strokeStyle="#f22";
  cc.lineWidth=4;
  cc.stroke();
  
  cc.restore();

  cc.beginPath();
  cc.strokeStyle = "#f83";
  cc.lineWidth=2;
  cc.moveTo(0, 0);
  cc.lineTo(hspeed, vspeed);
  cc.stroke();

  cc.restore();
}

function canvas_draw_quads(cc) {
  for(var i=0;i<prop.quad.quads.length;i++) {
    canvas_draw_quad(cc, prop.quad.quads[i]);
  }
}

function canvas_update() {
  var cc=canvas_get("main");
  cc.save();
  
  canvas_clear(cc);
  cc.translate(Math.round(prop.canvas.size.width/2), Math.round(prop.canvas.size.height/2));
  
  cc.translate(0, meters(prop.ui.pan[1]));

  cc.save();
  canvas_draw_ground(cc);
  cc.restore();

  cc.save();
  canvas_draw_grid(cc);
  cc.restore();

  cc.translate(meters(prop.ui.pan[0]), 0);
  
  cc.save();
  canvas_draw_quads(cc);
  cc.restore();

  cc.restore();
}
