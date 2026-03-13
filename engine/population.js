function createPopulationSystem(scene, TILE_SIZE, unitLayer, onUnitCycle,checkEndTurn){

 let units = []
 let activeUnit = null

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
   sprite,
   isMoving: false
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

 if(unit.isMoving) return

 unit.x = x
 unit.y = y

 unit.isMoving = true

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

   unit.isMoving = false

   if(unit.moveCurrent <= 0){

    const next = getNextUnitWithMoves()

    if(next){
     setActive(next)
    } else {
     setActive(null)
    }

    if(onUnitCycle){
      setTimeout(()=>{
      onUnitCycle(next)
      },300)
    }   

    checkEndTurn()    

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

 // deactivate previous
 if(activeUnit){
  activeUnit.active = false
  activeUnit.sprite.visible = true
 }

 activeUnit = unit

 if(activeUnit){
  activeUnit.active = true
 }

}

 function getActiveUnit(){
 return activeUnit
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

 if(activeUnit){
  activeUnit.sprite.visible = blinkState
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