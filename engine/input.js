function createInput(scene,pointer,settings,camera,population,MAP_WIDTH,MAP_HEIGHT,onUnitMoved,checkEndTurn){

function getMoveCost(unit,nx,ny){

 const fromTile = GameState.map[unit.y][unit.x]
 const toTile   = GameState.map[ny][nx]

 const terrainCost = settings.movement_cost?.[toTile.terrain] ?? 1

 if(terrainCost >= 99) return 99

 let cost = terrainCost

 const dx = nx - unit.x
 const dy = ny - unit.y

 const isCardinalMove = (dx === 0 || dy === 0)

 if(fromTile.river && toTile.river && isCardinalMove){
  cost = 1
 }

 return cost
}


function getNextUnitAfter(unit){

 const units = population.units
 const index = units.indexOf(unit)

 for(let i=index+1;i<units.length;i++){
  if(units[i].moveCurrent > 0){
   return units[i]
  }
 }

 for(let i=0;i<index;i++){
  if(units[i].moveCurrent > 0){
   return units[i]
  }
 }

 return null
}


// SKIP TURN (SPACE)
scene.input.keyboard.on("keydown-SPACE", ()=>{

 const unit = population.getActiveUnit()

 if(!unit) return
 if(unit.isMoving) return

 unit.moveCurrent = 0

 const next = getNextUnitAfter(unit)

 if(next){

  population.setActive(next)

  setTimeout(()=>{
   onUnitMoved(next)
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

 const next = getNextUnitAfter(unit)

 if(!next) return

 population.setActive(next)

 setTimeout(()=>{
  onUnitMoved(next)
 },300)

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

 population.moveUnit(unit,nx,ny)

 unit.moveCurrent -= cost

 if(onUnitMoved){
  onUnitMoved(unit)
 }

 checkEndTurn()

})



function update(){

 const speed=settings.scroll_speed
 const edge=settings.scroll_edge

 const w = scene.scale.width
 const h = scene.scale.height

 if(pointer.x<edge) camera.scrollX-=speed
 if(pointer.x>w-edge) camera.scrollX+=speed
 if(pointer.y<edge) camera.scrollY-=speed
 if(pointer.y>h-edge) camera.scrollY+=speed

}

return{update}

}