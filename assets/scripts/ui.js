
function ui_init_pre() {
  prop.ui = {};
  prop.ui.pan = [0, 0];

  prop.ui.scale = 1/1000; // meters per pixel
}

function meters(m) {
  return m*prop.ui.scale;
}

function kilometers(km) {
  return meters(km*1000);
}

function ui_update_post() {
  prop.ui.pan[0] = -kilometers(prop.ship.player.position[0]);
  prop.ui.pan[1] =  kilometers(prop.ship.player.position[1]);
}
