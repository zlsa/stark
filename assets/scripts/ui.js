
function ui_init_pre() {
  prop.ui = {};
  prop.ui.pan = [0, 0];

  prop.ui.scale = 1/1500; // meters per pixel
}

function meters(m) {
  return m*prop.ui.scale;
}

function kilometers(km) {
  return meters(km*1000);
}

function pixels_to_km(px) {
  return (px / 1000) / prop.ui.scale;
}

function ui_update_post() {
  prop.ui.pan[0] = -kilometers(prop.game.ships.player.position[0]);
  prop.ui.pan[1] =  kilometers(prop.game.ships.player.position[1]);
}
