
function input_init_pre() {
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

function input_update_pre() {
  if(prop.input.keys[prop.input.keysym.left]) {
    prop.ship.player.controls[0] = -1;
  } else if(prop.input.keys[prop.input.keysym.right]) {
    prop.ship.player.controls[0] = 1;
  } else {
    prop.ship.player.controls[0] = 0;
  }
  if(prop.input.keys[prop.input.keysym.up]) {
    prop.ship.player.controls[1] = 1;
  } else if(prop.input.keys[prop.input.keysym.down]) {
    prop.ship.player.controls[1] = -1;
  } else {
    prop.ship.player.controls[1] = 0;
  }
}
