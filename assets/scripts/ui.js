
function ui_init_pre() {
  prop.ui = {};
  prop.ui.pan = [0, 0];

  prop.ui.scale = 100; // pixels per meter
}

function meters(m) {
  return m*prop.ui.scale;
}

function ui_update_post() {
  prop.ui.pan[0] = -prop.quad.quads[0].body.position[0];
  prop.ui.pan[1] =  prop.quad.quads[0].body.position[1];
}
