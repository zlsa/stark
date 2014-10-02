
function gl_init_pre() {
  prop.gl = {};

  prop.gl.size   = [0, 0];
  prop.gl.aspect = 1;

  prop.canvas.enabled = false;
  prop.gl.enabled = false;
}

function gl_init_context() {
  prop.gl.context = null;

  var canvas = $("<canvas></canvas>");
  $("#canvases").append(canvas);
  canvas = canvas.get(0);
  
  try {
    prop.gl.context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    prop.gl.enabled = true;
  } catch(e) {
    
  }
  
  if(!prop.gl.context) {
    alert("Couldn't initialize WebGL; falling back to canvas.");
    prop.canvas.enabled = true;
    prop.gl.context = null;
  }

}

function gl_resize() {
  var gl = prop.gl.context;
  
  var width  = $(window).width();
  var height = $(window).height();
  
  prop.gl.size   = [width, height];
  prop.gl.aspect = height / width;

  gl.viewport(0, 0, width, height);

  prop.gl.context.canvas.width  = width;
  prop.gl.context.canvas.height = height;

}

function gl_compile_shader(gl, id) {
  var el   = $("#" + id);

  if(el.length == 0) {
    return null;
  }

  var text = el.text();
  var type = el.attr("type");

  var shader = null;
  
  if(type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if(type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, text);
  
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;

}

function gl_init_buffer(vertices) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(vertices)), gl.STATIC_DRAW);

  return buffer;
}


function gl_init_shaders() {
  var gl = prop.gl.context;

  var fragmentShader = gl_compile_shader(gl, "fragment-shader");
  var vertexShader   = gl_compile_shader(gl, "vertex-shader");
  
  // Create the shader program
  
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  // If creating the shader program failed, alert
  
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
    return false;
  }
  
  gl.useProgram(program);
  
  prop.gl.vertex_position_attribute = gl.getAttribLocation(shaderProgram, "a_VertexPosition");
  gl.enableVertexAttribArray(prop.gl.vertex_position_attribute);
}


function gl_init() {
  gl_init_context();

  if(!prop.gl.enabled) {
    return;
  }

  var gl = prop.gl.context;

  gl.clearColor(0.0, 1.0, 0.0, 1.0);

  //    gl.enable(gl.DEPTH_TEST);
  //    gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);


  if(gl_init_shaders()) {
    prop.gl.buffer = gl_init_buffer([
      [ 1,  1, 0],
      [-1,  1, 0],
      [ 1, -1, 0],
      [-1, -1, 0],
    ]);
  }
  
}

function gl_update() {
  var gl = prop.gl.context;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, prop.gl.buffer);
  gl.vertexAttribPointer(prop.gl.vertex_position_attribute, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
