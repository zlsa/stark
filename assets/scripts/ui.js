
function ui_init_pre() {
  prop.ui = {};
  prop.ui.pan = [0, 0];

  prop.ui.scale = 1/1500; // meters per pixel

  prop.ui.stats_types = ["system", "planet", "ship", "debug"];
  prop.ui.stats = prop.ui.stats_types.indexOf("planet");
  prop.ui.stats_lowpass = new Lowpass(20);
  prop.ui.stats_lowpass.target = prop.ui.stats;
  prop.ui.stats_lowpass.value  = prop.ui.stats;
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

function ui_stats_amount(type) {
  var id = prop.ui.stats_types.indexOf(type);
  return clamp(-1, prop.ui.stats_lowpass.value - id, 1);
}

function ui_show_debug_input() {
  $("#debug").removeClass("hidden");
  $("#debug-command").focus();
  $("#debug-command").val("");
}

function ui_hide_debug_input() {
  $("#debug").addClass("hidden");
  $("#debug-command").val("");
  $("#debug-command").blur();
}

function ui_toggle_debug_input() {
  $("#debug").toggleClass("hidden");
  if(!$("#debug").hasClass("hidden")) {
    ui_show_debug_input();
  } else {
    ui_hide_debug_input();
  }
}

function ui_update_post() {
  prop.ui.pan[0] = -kilometers(prop.game.ships.player.position[0]);
  prop.ui.pan[1] =  kilometers(prop.game.ships.player.position[1]);

  prop.ui.stats = clamp(0, prop.ui.stats, prop.ui.stats_types.length - 1);

  prop.ui.stats_lowpass.target = prop.ui.stats;
  prop.ui.stats_lowpass.tick(game_delta() * 20);
}

