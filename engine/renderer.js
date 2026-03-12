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

// Coasts and transitions

const n = map[y-1]?.[x]?.terrain
const s = map[y+1]?.[x]?.terrain
const w = map[y]?.[x-1]?.terrain
const e = map[y]?.[x+1]?.terrain

const nw = map[y-1]?.[x-1]?.terrain
const ne = map[y-1]?.[x+1]?.terrain
const sw = map[y+1]?.[x-1]?.terrain
const se = map[y+1]?.[x+1]?.terrain

function drawTransition(frame){

 const t = scene.add.image(
  x*TILE_SIZE,
  y*TILE_SIZE,
  "transitions",
  frame
 )

 t.setOrigin(0,0)

 sprites.push(t)

}
if(tile.terrain > 2)
{
    if(isCoast(nw,1)) drawTransition(0)
    if(isCoast(ne,1)) drawTransition(1)
    if(isCoast(sw,1)) drawTransition(2)
    if(isCoast(se,1)) drawTransition(3)

    if(isCoast(w,1)) drawTransition(4)
    if(isCoast(e,1)) drawTransition(5)

    if(isCoast(n,1)) drawTransition(6)
    if(isCoast(s,1)) drawTransition(7)
}
if(tile.terrain === 1)
{
    if(isCoast(nw,0)) drawTransition(8)
    if(isCoast(ne,0)) drawTransition(9)
    if(isCoast(sw,0)) drawTransition(10)
    if(isCoast(se,0)) drawTransition(11)

    if(isCoast(w,0)) drawTransition(12)
    if(isCoast(e,0)) drawTransition(13)

    if(isCoast(n,0)) drawTransition(14)
    if(isCoast(s,0)) drawTransition(15)
}



// Vegetation

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

function isCoast(t, i){
 return t===i
}