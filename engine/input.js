function createInput(scene,pointer,settings,camera,population,MAP_WIDTH,MAP_HEIGHT,onUnitMoved){

scene.input.keyboard.on("keydown",(e)=>{

 const unit = population.getActiveUnit()

 if(!unit) return
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

 population.moveUnit(unit,nx,ny)

 unit.moveCurrent -= 1

 if(onUnitMoved){
  onUnitMoved(unit)
 }

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