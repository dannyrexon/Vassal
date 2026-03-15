const SOCIAL_CLASS = {
 PEASANT: 0,
 BURGHER: 1,
 CLERGY: 2,
 NOBLE: 3
}

const SOCIAL_CLASS_NAME = [
 "Peasantry",
 "Bourgeoisie",
 "Clergy",
 "Nobility"
]

function createPopulationSystem(scene, TILE_SIZE, unitLayer, onUnitCycle, checkEndTurn, onUnitMoved)
{

 let units = []
 let activeUnit = null

 function createUnit(x,y,type,socialClass,move,vision){

 const container = scene.add.container(
  x*TILE_SIZE + TILE_SIZE/2,
  y*TILE_SIZE + TILE_SIZE/2
 )

 const sprite = scene.add.sprite(
  0,
  -16,
  "population",
  type
 )

 const statusBox = scene.add.rectangle(
  -TILE_SIZE/2 + 6,
  TILE_SIZE/2 - 43,
  18,
  24,
  0xffff00
 )

 statusBox.setOrigin(0,0)
 statusBox.setStrokeStyle(2,0x000000)

 const statusText = scene.add.text(
  -TILE_SIZE/2 + 9,
  TILE_SIZE/2 - 40,
  "-",
 {
  fontFamily:"monospace",
  weight:"bold",
  fontSize:"16px",
  color:"#000000",
  stroke:"#000000",
  strokeThickness:1
 }
 )

 container.add(statusBox)
 container.add(statusText)
 container.add(sprite)
 
 unitLayer.add(container)

 const unit = {
  x,
  y,
  type,
  socialClass,
  moveTotal: move,
  moveCurrent: move,
  active: false,
  container,
  sprite,
  statusBox,
  statusText,
  isMoving: false,
  vision,

  order: null,

 setOrder(order){
  this.order = order
  this.statusText.setText(order ? order : "-")
 }
 }

 units.push(unit)

 return unit
}

 

function getNextUnitAfter(unit){

 const index = units.indexOf(unit)

 for(let i=index+1;i<units.length;i++){
  if(units[i].moveCurrent > 0 && units[i].order !== "F"){
   return units[i]
  }
 }

 for(let i=0;i<index;i++){
  if(units[i].moveCurrent > 0 && units[i].order !== "F"){
   return units[i]
  }
 }

 return null

}

 function getUnitAt(x,y){

  for(const u of units){
   if(u.x===x && u.y===y) return u
  }

  return null

 }

 function moveUnit(unit,x,y){

 if(unit.isMoving) return

 const targetX = x
 const targetY = y
 
 unit.isMoving = true

 // ensure visible during movement
 unit.container.visible = true
 const wasActive = unit.active
 unit.active = false

 scene.tweens.add({

  targets: unit.container,
  x: x*TILE_SIZE + TILE_SIZE/2,
  y: y*TILE_SIZE + TILE_SIZE/2,
  duration: 200,
  ease: "Linear",

  onComplete: () => {
   
   unit.isMoving = false

   unit.x = targetX
   unit.y = targetY

   // if unit still has moves left, clear order
   if(unit.moveCurrent > 0){
   unit.setOrder(null)
   }
   
   if(onUnitMoved){
    onUnitMoved(unit)
   }

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
  activeUnit.container.visible = true
 }

 activeUnit = unit

 if(activeUnit){
  // reset order when unit becomes active
  activeUnit.setOrder(null)
  activeUnit.active = true
 }

}

 function getActiveUnit(){
 return activeUnit
}

 function getNextUnitWithMoves(){

 for(const u of units){
  if(u.moveCurrent > 0 && u.order !== "F"){
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

 if(activeUnit.isMoving){
  activeUnit.container.visible = true
 } else {
  activeUnit.container.visible = blinkState
 }

}

}

function updateOrderDisplay(unit){

 let letter = "-"

 if(unit.order){
  letter = unit.order
 }

 unit.statusText.setText(letter)

}

function setUnitOrder(unit,order){

 unit.order = order

 updateOrderDisplay(unit)

}

 return{
 createUnit,
 getUnitAt,
 moveUnit,
 setActive,
 getActiveUnit,
 getNextUnitWithMoves,
 getNextUnitAfter,
 update,
 setUnitOrder,
 units
}

}