
function input_init() {
  prop.input={};

  prop.input.button={
    none:0,
    left:1,
    middle:2,
    right:3
  };

  prop.input.keys={};

  prop.input.keysym={
    shift:16,
    control:17,
    x:88,
    left:37,
    up:38,
    right:39,
    down:40,
  };
}

function input_done() {
  $(window).keydown(function(e) {
    prop.input.keys[e.which]=true;
    input_keydown(e.which);
  });

  $(window).keyup(function(e) {
    prop.input.keys[e.which]=false;
    console.log(e.which);
  });

}

function input_keydown(keycode) {
  // called with the users' key-repeat settings
}

function input_update() {
  var d=delta();
  if(prop.input.keys[prop.input.keysym.up]) {
    prop.quad.target[1] += 3*d;
  } else if(prop.input.keys[prop.input.keysym.down]) {
    prop.quad.target[1] -= 3*d;
  }
  if(prop.input.keys[prop.input.keysym.x]) {
    prop.quad.flip = true;
  } else {
    prop.quad.flip = false;
  }
  if(prop.input.keys[prop.input.keysym.right]) {
    prop.quad.target[0] += 3*d;
  } else if(prop.input.keys[prop.input.keysym.left]) {
    prop.quad.target[0] -= 3*d;
  }
}
