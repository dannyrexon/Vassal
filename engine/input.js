function createInput(scene,pointer,settings,camera,population,MAP_WIDTH,MAP_HEIGHT,
 onUnitMoved,checkEndTurn,activateUnit,renderer){


function getMoveCost(unit,nx,ny){

 const fromTile = GameState.map[unit.y][unit.x]
 const toTile   = GameState.map[ny][nx]

 const terrainCost = settings.movement_cost?.[toTile.terrain] ?? 1

 if (fromTile.river || fromTile.road){
  // SPECIAL RULE: always allow entering open terrain (plain/grass/wetland)
  const isOpenTerrain =
  (toTile.terrain === 5 || toTile.terrain === 6 || toTile.terrain === 7)
  
  if(unit.moveCurrent < 3 && isOpenTerrain && !toTile.river && !toTile.road){
    return 0
  }
 }
 
 if(terrainCost >= 99) return 99

 let cost = terrainCost

 const dx = nx - unit.x
 const dy = ny - unit.y

 const isCardinalMove = (dx === 0 || dy === 0)

 if(fromTile.river && toTile.river && isCardinalMove){
  return 1
 }

if(fromTile.road && toTile.road){
 return 1
}

// Walking to a hill always depletes all remaining movement unless there is a road there
 if(toTile.terrain === 8){
    cost = unit.moveCurrent
 }


 return cost
}


function getNextUnitAfter(unit){

 const units = population.units
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

// KEYBOARD INPUT HANDLERS


// SKIP TURN (S)
scene.input.keyboard.on("keydown-S", ()=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return

 unit.moveCurrent = 0
 unit.setOrder("S")

 const next = getNextUnitAfter(unit)

 if(next){

  population.setActive(next)

  setTimeout(()=>{
   activateUnit(next)
  },300)

 }
 else{

  population.setActive(null)
  checkEndTurn()

 }

})


// WAIT COMMAND (W)
scene.input.keyboard.on("keydown-W", ()=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return

 unit.setOrder("W")

 const next = getNextUnitAfter(unit)

 if(!next) return

 population.setActive(next)

 

 setTimeout(()=>{
  activateUnit(next)
 },300)

})

// BUILD ROAD (S)
scene.input.keyboard.on("keydown-R", ()=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return

 const tile = GameState.map[unit.y][unit.x]

 tile.road = true

 unit.moveCurrent = 0
 unit.setOrder("R")

 renderer.render(GameState.map)

 const next = getNextUnitAfter(unit)

 if(next){

  population.setActive(next)

  setTimeout(()=>{
   activateUnit(next)
  },300)

 } else {

  population.setActive(null)
  checkEndTurn()

 }

})

// FORTIFY COMMAND (F)
scene.input.keyboard.on("keydown-F", ()=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return

 unit.moveCurrent = 0
 unit.setOrder("F")

 const next = getNextUnitAfter(unit)

 if(next){

  population.setActive(next)

  setTimeout(()=>{
   activateUnit(next)
  },300)

 }
 else{

  population.setActive(null)
  checkEndTurn()

 }

})


// MOVE COMMAND
scene.input.keyboard.on("keydown",(e)=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return
 if(unit.moveCurrent <= 0) return

 let dx = 0
 let dy = 0
 
 switch(e.code){

  case "Numpad8": dy = -1; break
  case "Numpad2": dy = 1; break
  case "Numpad4": dx = -1; break
  case "Numpad6": dx = 1; break

  case "Numpad7": dx = -1; dy = -1; break
  case "Numpad9": dx = 1; dy = -1; break
  case "Numpad1": dx = -1; dy = 1; break
  case "Numpad3": dx = 1; dy = 1; break

  default: return

 }

 const nx = unit.x + dx
 const ny = unit.y + dy

 if(nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT) return

 const cost = getMoveCost(unit,nx,ny)

 if(cost > unit.moveCurrent) return
 if(cost >= 99) return

 const enemy = aiPopulation.getUnitAt(nx,ny)

 population.moveUnit(unit,nx,ny)

 unit.moveCurrent -= cost
 if(cost == 0) unit.moveCurrent = 0
 unit.setOrder("M")

 if(onUnitMoved){
  onUnitMoved(unit)  
 }

})



function update(){

 const edge = settings.scroll_edge
 const maxSpeed = settings.scroll_speed

 const w = scene.scale.width
 const h = scene.scale.height

 const px = pointer.position.x
 const py = pointer.position.y

 let dx = 0
 let dy = 0

 if(px < edge){
  dx = -(edge - px) / edge
 }

 if(px > w - edge){
  dx = (px - (w - edge)) / edge
 }

 if(py < edge){
  dy = -(edge - py) / edge
 }

 if(py > h - edge){
  dy = (py - (h - edge)) / edge
 }

 camera.scrollX += dx * maxSpeed
 camera.scrollY += dy * maxSpeed

}



return{update}

}