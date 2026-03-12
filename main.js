let SETTINGS=null
let TERRAIN_NAMES=null
let showVegetation = true

async function loadSettings(){

 const settingsReq=await fetch("map_settings.json")
 SETTINGS=await settingsReq.json()

 const terrainReq=await fetch("terrain_names.json")
 TERRAIN_NAMES=await terrainReq.json()

 startGame()

}

function startGame(){

const TILE_SIZE=SETTINGS.tile_size
const MAP_WIDTH=SETTINGS.map_width
const MAP_HEIGHT=SETTINGS.map_height

let camera
let pointer
let selectedTile=null
let mouseInsideMap=false

let sceneRef
let selectionGraphic=null

let worldgen
let renderer
let minimap
let cameraSystem
let inputSystem

const config={
 type:Phaser.AUTO,
 width:window.innerWidth-320,
 height:window.innerHeight-32,
 parent:"game-container",
 pixelArt:true,
 roundPixels:true,
 scene:{preload,create,update}
}

const game=new Phaser.Game(config)

function preload(){

 const v = Date.now()

 this.load.spritesheet("terrain","graphics/terrain.png?v="+v,{
  frameWidth:64,
  frameHeight:64
 })

 this.load.spritesheet("transitions","graphics/transitions.png?v="+v,{
  frameWidth:64,
  frameHeight:64
 })

  this.load.spritesheet("rivers","graphics/rivers.png?v="+v,{
  frameWidth:64,
  frameHeight:64
 })

}

function create(){

 sceneRef=this

 camera=this.cameras.main
 pointer=this.input.activePointer

 worldgen=createWorldGen(MAP_WIDTH,MAP_HEIGHT)
 renderer=createRenderer(sceneRef,TILE_SIZE,MAP_WIDTH,MAP_HEIGHT)
 minimap=createMinimap(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 cameraSystem=createCamera(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 inputSystem=createInput(pointer,game,SETTINGS,camera)

 generateWorld()

 cameraSystem.setBounds()

 const canvas=this.sys.game.canvas

 canvas.addEventListener("mouseenter",()=>mouseInsideMap=true)
 canvas.addEventListener("mouseleave",()=>mouseInsideMap=false)

 document.getElementById("toggleVeg").onclick = () => {

 showVegetation = !showVegetation

 const btn = document.getElementById("toggleVeg")

 btn.innerText = showVegetation
 ? "Hide Vegetation"
 : "Show Vegetation"

 renderer.render(GameState.map)

}

 document.getElementById("regen").onclick=generateWorld

 this.input.on("pointerdown",(p)=>{

  const x=Math.floor(p.worldX/TILE_SIZE)
  const y=Math.floor(p.worldY/TILE_SIZE)

  if(x>=0 && y>=0 && x<MAP_WIDTH && y<MAP_HEIGHT){

   selectedTile={x,y}

   const tile = GameState.map[y][x]

    const terrain = tile.terrain
    const terrainName = TERRAIN_NAMES?.[terrain] ?? "Undefined"

   let info =
    "Map: ["+x+", "+y+"]"+
    "<br>Terrain: "+terrainName

    if(tile.vegetation > 0){

    const vegName = TERRAIN_NAMES?.[tile.vegetation] ?? "Undefined"

    info += " (" + vegName + ")"

    }

   document.getElementById("tileinfo").innerHTML = info
   drawSelection()

  }

 })

}

function update(){

 if(!mouseInsideMap) return

 inputSystem.update()
 minimap.draw(GameState.map)

}

function generateWorld(){

 GameState.map = worldgen.generate(SETTINGS)

 renderer.render(GameState.map)

 minimap.setup()
 minimap.draw(GameState.map)

}

function drawSelection(){

 if(selectionGraphic) selectionGraphic.destroy()

 if(!selectedTile) return

 selectionGraphic=sceneRef.add.graphics()

 selectionGraphic.lineStyle(3,0xffff00,1)

 selectionGraphic.strokeRect(
  selectedTile.x*TILE_SIZE,
  selectedTile.y*TILE_SIZE,
  TILE_SIZE,
  TILE_SIZE
 )

}

}

loadSettings()