

function createPopulationSystem(scene, TILE_SIZE, unitLayer,
 onUnitCycle, checkEndTurn, onUnitMoved, isAI=false)
{

 let units = []
 let activeUnit = null

 function createUnit(x,y,type,socialClass,move,vision,combatType,attack,defense){

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

 const color = isAI ? 0xff4444 : 0xffff00

 const statusBox = scene.add.rectangle(
  -TILE_SIZE/2 + 6,
  TILE_SIZE/2 - 43,
  18,
  24,
  color
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
  combatType,
  attack,
  defense,

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

 // forward
 for(let i=index+1;i<units.length;i++){
  if(units[i].moveCurrent > 0 && units[i].order !== "F"){
   return units[i]
  }
 }

 // wrap-around
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

 const enemy = this.enemy?.getUnitAt(x,y)

if(enemy){

 if(unit.isMoving) return

 unit.isMoving = true

 const dx = x - unit.x
 const dy = y - unit.y

 const halfX = unit.x + dx * 0.5
 const halfY = unit.y + dy * 0.5

 scene.tweens.add({

  targets: unit.container,
  x: halfX*TILE_SIZE + TILE_SIZE/2,
  y: halfY*TILE_SIZE + TILE_SIZE/2,
  duration: 120,
  ease: "Linear",

  onComplete: ()=>{

   unit.isMoving = false

   // snap back
   unit.container.x = unit.x*TILE_SIZE + TILE_SIZE/2
   unit.container.y = unit.y*TILE_SIZE + TILE_SIZE/2

   showCombatDialog(unit, enemy, isAI)

  }

 })

 return
}

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

   const tile = GameState.map[unit.y]?.[unit.x]

   // Remove fractions of moves if not on road or river
   if(tile && !tile.road && !tile.river && unit.moveCurrent < 3){
    unit.moveCurrent = 0
   }

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

  if(onUnitCycle){
   setTimeout(()=>{
    onUnitCycle(next)
   },300)
  }

 } else {

  setActive(null)

  // ONLY player population should end turn
  if(checkEndTurn){
   setTimeout(()=>{
    checkEndTurn()
   },50) // small delay ensures tween fully settles
  }

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
  if(u.moveCurrent > 0 && (u.order === null || u.order === "M" || u.order === "W")){
   return u
  }
 }

 return null
}

 let blinkTimer = 0
 let blinkState = true

function update(time, isAI=false){

 if(UI_LOCK){

  if(activeUnit){
   activeUnit.container.visible = true
  }

  return
 }

 // ALWAYS update visibility every frame
 for(const u of units){

  if(isAI){

  const tile = GameState.map[u.y]?.[u.x]

  if(!tile || !tile.visible){
   u.container.visible = false
   continue
  }

  }

  // default visible
  if(u !== activeUnit){
   u.container.visible = true
  }

 }

 // blinking logic (only for active unit)
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