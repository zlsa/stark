
function input_init_pre() {
  prop.input={};

  prop.input.controls = [0, 0];

  prop.input.assist = {
    gravity: false
  };

  prop.input.button={
    none:0,
    left:1,
    middle:2,
    right:3
  };

  prop.input.keys={};

  prop.input.keysym={
    tab:     9,
    shift:   16,
    control: 17,
    space:   32,
    x:       88,
    left:    37,
    up:      38,
    right:   39,
    down:    40,
    enter:   13,
    escape:  27,
  };
}

function input_done() {
  $(window).keydown(function(e) {
    prop.input.keys[e.which]=true;
    if(input_keydown(e.which))
      return false;
  });

  $(window).keyup(function(e) {
    prop.input.keys[e.which]=false;
  });

  $("#debug-command").keydown(function(e) {
    if(e.which == prop.input.keysym.enter) {
      input_command_run($(this).val());
    }
  });

}

function input_command_run(value) {
  var cmd  = value.substr(0, value.indexOf(" "));
  var data = value.substr(value.indexOf(" ") + 1);

  if(value.indexOf(" ") < 0) {
    cmd = value;
    data = "";
  }

  if(cmd == "teleport") {
    var planet = data.split(" ");
    if(!data || planet.length == 0) {
      prop.game.ships.player.teleport();
    } else {
      prop.game.ships.player.teleport(planet);
    }
  } else if(cmd == "ifuel") {
    var amount = parseFloat(data);
    prop.game.ships.player.fuel.impulse.set(amount);
  } else if(cmd == "jfuel") {
    var amount = parseFloat(data);
    prop.game.ships.player.fuel.jump.set(amount);
  } else if(cmd == "speedup") {
    prop.game.speedup = parseFloat(data);
  } else if(cmd == "save") {
    storage.set("savegame", prop.game.save());
  } else if(cmd == "gen") {
    prop.game.generate();
  } else if(cmd == "restore") {
    prop.game.restore(storage.get("savegame"));
  }

  $("#debug").addClass("hidden");
  $("#debug-command").val("");
  $("#debug-command").blur();
}

function input_keydown(keycode) {
  if(keycode == prop.input.keysym.tab) {
    $("#debug").toggleClass("hidden");
    if(!$("#debug").hasClass("hidden")) {
      $("#debug-command").focus();
    } else {
      $("#debug-command").blur();
    }
    return true;
  } else if(keycode == prop.input.keysym.esc) {
    $("#debug").addClass("hidden");
    $("#debug-command").blur();
    return true;
  }
  return false;
  // called with the users' key-repeat settings
}

function input_update_pre() {
  if(prop.input.keys[prop.input.keysym.left]) {
    prop.input.controls[0] = -1;
  } else if(prop.input.keys[prop.input.keysym.right]) {
    prop.input.controls[0] = 1;
  } else {
    prop.input.controls[0] = 0;
  }
  if(prop.input.keys[prop.input.keysym.up]) {
    prop.input.controls[1] = 1;
  } else {
    prop.input.controls[1] = 0;
  }
  if(prop.input.keys[prop.input.keysym.down]) {
    prop.input.assist.gravity = true;
  } else {
    prop.input.assist.gravity = false;
  }
}
