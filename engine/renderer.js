function createRenderer(scene,TILE_SIZE,MAP_WIDTH,MAP_HEIGHT){

let sprites=[]

function render(map){

 sprites.forEach(s=>s.destroy())
 sprites=[]

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  const img=scene.add.image(
   x*TILE_SIZE,
   y*TILE_SIZE,
   "terrain",
   map[y][x].terrain
  )

  img.setOrigin(0,0)

  sprites.push(img)

 }

}

return{render}

}