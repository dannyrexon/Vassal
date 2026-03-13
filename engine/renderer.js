function createRenderer(scene,TILE_SIZE,MAP_WIDTH,MAP_HEIGHT,terrainLayer,vegetationLayer,riverLayer){

function render(map){

 terrainLayer.removeAll(true)
 vegetationLayer.removeAll(true)
 riverLayer.removeAll(true)

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

 const tile = map[y][x]

 const terrainSprite = terrainLayer.add(scene.add.image(
  x*TILE_SIZE,
  y*TILE_SIZE,
  "terrain",
  tile.terrain
 ))

 terrainSprite.setOrigin(0,0)

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

  const t = terrainLayer.add(scene.add.image(
   x*TILE_SIZE,
   y*TILE_SIZE,
   "transitions",
   frame
  ))

  t.setOrigin(0,0)

 }

 if(tile.terrain > 2){

  if(isCoast(nw,1)) drawTransition(0)
  if(isCoast(ne,1)) drawTransition(1)
  if(isCoast(sw,1)) drawTransition(2)
  if(isCoast(se,1)) drawTransition(3)

  if(isCoast(w,1)) drawTransition(4)
  if(isCoast(e,1)) drawTransition(5)

  if(isCoast(n,1)) drawTransition(6)
  if(isCoast(s,1)) drawTransition(7)

 }

 if(tile.terrain === 1){

  if(isCoast(nw,0)) drawTransition(8)
  if(isCoast(ne,0)) drawTransition(9)
  if(isCoast(sw,0)) drawTransition(10)
  if(isCoast(se,0)) drawTransition(11)

  if(isCoast(w,0)) drawTransition(12)
  if(isCoast(e,0)) drawTransition(13)

  if(isCoast(n,0)) drawTransition(14)
  if(isCoast(s,0)) drawTransition(15)

 }

 // Rivers

 if(tile.river){

  const n = map[y-1]?.[x]?.river
  const e = map[y]?.[x+1]?.river
  const s = map[y+1]?.[x]?.river
  const w = map[y]?.[x-1]?.river

  let frame = -1

  if(tile.terrain === 1){

   if(w) frame = 15
   else if(e) frame = 16
   else if(n) frame = 17
   else if(s) frame = 18

  } else {

   frame = getRiverFrame(n,e,s,w)

  }

  if(frame >= 0){

   const img = riverLayer.add(scene.add.image(
    x*TILE_SIZE,
    y*TILE_SIZE,
    "rivers",
    frame
   ))

   img.setOrigin(0,0)

  }

 }

 // Vegetation

 if(showVegetation && tile.vegetation){

  const img = vegetationLayer.add(scene.add.image(
   x*TILE_SIZE,
   y*TILE_SIZE,
   "terrain",
   tile.vegetation
  ))

  img.setOrigin(0,0)

 }

 }

}

return{render}

}

function isCoast(t,i){
 return t===i
}

function getRiverFrame(n,e,s,w){

 if(w && s && e && n) return 14
 if(w && s && e) return 13
 if(w && s && n) return 12
 if(w && s) return 11
 if(w && e && n) return 10
 if(w && e) return 9
 if(w && n) return 8
 if(w) return 7

 if(s && e && n) return 6
 if(s && e) return 5
 if(s && n) return 4
 if(s) return 3

 if(n && e) return 2
 if(e) return 1
 if(n) return 0

 return -1

}