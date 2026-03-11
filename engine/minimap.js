function createMinimap(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE){

let canvas
let ctx
let scale

let hoverX=null
let hoverY=null
let dragging=false

let currentMap=null

const COLORS={
 0:"#2b6cff",
 1:"#4ea6ff",
 2:"#4fbf4f",
 3:"#6fe36f",
 4:"#888888",
 5:"#bbbbbb"
}

function setup(){

 canvas=document.getElementById("minimap")
 ctx=canvas.getContext("2d")

 const width=240

 scale=width/MAP_WIDTH

 canvas.width=width
 canvas.height=MAP_HEIGHT*scale

 canvas.addEventListener("mousedown",(e)=>{
  dragging=true
  handleMove(e)
  draw(currentMap)
 })

 canvas.addEventListener("mousemove",(e)=>{

  const rect=canvas.getBoundingClientRect()

  hoverX=(e.clientX-rect.left)/scale
  hoverY=(e.clientY-rect.top)/scale

  if(dragging) handleMove(e)

  draw(currentMap)

 })

 window.addEventListener("mouseup",()=>dragging=false)

 canvas.addEventListener("mouseleave",()=>{
  hoverX=null
  hoverY=null
  draw(currentMap)
 })

}

function handleMove(e){

 const rect=canvas.getBoundingClientRect()

 const mx=(e.clientX-rect.left)/scale
 const my=(e.clientY-rect.top)/scale

 const worldX=mx*TILE_SIZE
 const worldY=my*TILE_SIZE

 camera.centerOn(worldX,worldY)

 camera.scrollX=Phaser.Math.Clamp(
  camera.scrollX,
  0,
  MAP_WIDTH*TILE_SIZE-camera.width
 )

 camera.scrollY=Phaser.Math.Clamp(
  camera.scrollY,
  0,
  MAP_HEIGHT*TILE_SIZE-camera.height
 )

}

function draw(map){

 if(!map) return

 currentMap=map

 ctx.globalAlpha=1
 ctx.clearRect(0,0,canvas.width,canvas.height)

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  ctx.fillStyle=COLORS[map[y][x]]

  ctx.fillRect(x*scale,y*scale,scale,scale)

 }

 const viewTilesX=camera.width/TILE_SIZE
 const viewTilesY=camera.height/TILE_SIZE

 const camTileX=camera.scrollX/TILE_SIZE
 const camTileY=camera.scrollY/TILE_SIZE

 ctx.lineWidth=2
 ctx.strokeStyle="#00ffff"

 ctx.strokeRect(
  camTileX*scale,
  camTileY*scale,
  viewTilesX*scale,
  viewTilesY*scale
 )

 if(hoverX!==null){

  const hoverScrollX=(hoverX*TILE_SIZE)-camera.width/2
  const hoverScrollY=(hoverY*TILE_SIZE)-camera.height/2

  let hoverTileX=hoverScrollX/TILE_SIZE
  let hoverTileY=hoverScrollY/TILE_SIZE

  const maxTileX=MAP_WIDTH-viewTilesX
  const maxTileY=MAP_HEIGHT-viewTilesY

  hoverTileX=Math.max(0,Math.min(maxTileX,hoverTileX))
  hoverTileY=Math.max(0,Math.min(maxTileY,hoverTileY))

  ctx.lineWidth=2
  ctx.strokeStyle="#ffff00"

  ctx.strokeRect(
   hoverTileX*scale,
   hoverTileY*scale,
   viewTilesX*scale,
   viewTilesY*scale
  )

 }

}

return{
 setup,
 draw
}

}