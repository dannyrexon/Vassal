function createRenderer(scene,TILE_SIZE,MAP_WIDTH,MAP_HEIGHT){

let sprites=[]

function render(map){

 sprites.forEach(s=>s.destroy())
 sprites=[]

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){
const tile = map[y][x]

const terrainSprite = scene.add.image(
 x*TILE_SIZE,
 y*TILE_SIZE,
 "terrain",
 tile.terrain
)

terrainSprite.setOrigin(0,0)

sprites.push(terrainSprite)

if(tile.vegetation > 0){

 const vegSprite = scene.add.image(
  x*TILE_SIZE,
  y*TILE_SIZE,
  "terrain",
  tile.vegetation
 )

 vegSprite.setOrigin(0,0)

 sprites.push(vegSprite)
}   

}

}

return{render}

}