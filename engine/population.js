function createPopulationSystem(scene, TILE_SIZE, unitLayer, onUnitCycle){

 let units = []

 function createUnit(x,y,type,move){

  const sprite = scene.add.sprite(
    x*TILE_SIZE + TILE_SIZE/2,
    y*TILE_SIZE + TILE_SIZE/2 - 16,
    "population",
    type
)

  unitLayer.add(sprite)

  const unit = {
   x,
   y,
   type,
   moveTotal: move,
   moveCurrent: move,
   active: false,
   sprite
  }

  units.push(unit)

  return unit
 }

 function getUnitAt(x,y){

  for(const u of units){
   if(u.x===x && u.y===y) return u
  }

  return null

 }

 function moveUnit(unit,x,y){

 unit.x = x
 unit.y = y

 // ensure visible during movement
 unit.sprite.visible = true
 const wasActive = unit.active
 unit.active = false

 scene.tweens.add({

  targets: unit.sprite,
  x: x*TILE_SIZE + TILE_SIZE/2,
  y: y*TILE_SIZE + TILE_SIZE/2 - 16,
  duration: 200,
  ease: "Linear",

  onComplete: () => {

 if(unit.moveCurrent <= 0){

  const next = getNextUnitWithMoves()

  if(next){
   setActive(next)
  } else {
   setActive(null)
  }

  if(onUnitCycle){
   onUnitCycle(next)
  }

  return
 }
   // otherwise restore blinking
   if(wasActive){
    unit.active = true
   }

  }

 })

}

 function setActive(unit){

 for(const u of units){
  u.active = false
  u.sprite.visible = true
 }

 if(unit) { unit.active = true }

 }

 function getActiveUnit(){

 for(const u of units){
  if(u.active) return u
 }

 return null

 }

 function getNextUnitWithMoves(){

 for(const u of units){
  if(u.moveCurrent > 0){
   return u
  }
 }

 return null

 }

 let blinkTimer = 0
 let blinkState = true

function update(time){

 if(time - blinkTimer < 500) return

 blinkTimer = time
 blinkState = !blinkState

 for(const u of units){

  if(u.active){
   u.sprite.visible = blinkState
  }

 }

 }

 return{
 createUnit,
 getUnitAt,
 moveUnit,
 setActive,
 getActiveUnit,
 getNextUnitWithMoves,
 update,
 units
}

}