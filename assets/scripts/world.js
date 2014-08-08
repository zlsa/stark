
function world_init_pre() {
  prop.world = {};
  prop.world.world = new p2.World({
    gravity:[0, -9]
  });

  prop.world.ground = new p2.Body({
    mass: 0
  });

  prop.world.ground.material = new p2.Material();

  var groundShape = new p2.Plane();
  prop.world.ground.addShape(groundShape);
  prop.world.world.addBody(prop.world.ground)
}

function world_update_post() {
  prop.world.world.step(delta());
}
