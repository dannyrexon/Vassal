function createInput(pointer,game,settings,camera){

function update(){

 const speed=settings.scroll_speed
 const edge=settings.scroll_edge

 const w=game.config.width
 const h=game.config.height

 if(pointer.x<edge) camera.scrollX-=speed
 if(pointer.x>w-edge) camera.scrollX+=speed
 if(pointer.y<edge) camera.scrollY-=speed
 if(pointer.y>h-edge) camera.scrollY+=speed

}

return{update}

}