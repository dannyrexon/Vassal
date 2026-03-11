function createCamera(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE){

function setBounds(){

 camera.setBounds(
 0,
 0,
 MAP_WIDTH*TILE_SIZE,
 MAP_HEIGHT*TILE_SIZE
 )

}

return{setBounds}

}