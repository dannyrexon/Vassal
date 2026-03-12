let SETTINGS=null
let TERRAIN_NAMES=null
let POPULATION_NAMES = null
let showVegetation = true

async function loadSettings(){

 const settingsReq=await fetch("map_settings.json")
 SETTINGS=await settingsReq.json()

 const terrainReq=await fetch("terrain_names.json")
 TERRAIN_NAMES=await terrainReq.json()

 const popReq = await fetch("population_names.json")
 POPULATION_NAMES = await popReq.json()

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

let population

const config = {
 type: Phaser.AUTO,
 width: window.innerWidth - 320,
 height: window.innerHeight - 32,
 parent: "game-container",
 pixelArt: true,
 roundPixels: true,
 scale: { mode: Phaser.Scale.NONE },
 scene: { preload, create, update }
}

const game=new Phaser.Game(config)

function preload(){

 const v = Date.now()

    this.load.spritesheet("terrain","graphics/terrain.png?v="+v, { frameWidth:64, frameHeight:64 })
    this.load.spritesheet("transitions","graphics/transitions.png?v="+v, { frameWidth:64, frameHeight:64 })
    this.load.spritesheet("rivers","graphics/rivers.png?v="+v, { frameWidth:64, frameHeight:64 })
    this.load.spritesheet("population","graphics/population.png?v="+v, { frameWidth:64, frameHeight:64 })

}

function onUnitMoved(unit){

 selectedTile = {x:unit.x, y:unit.y}

 //drawSelection()

 const textDiv = document.getElementById("tiletext")
 const icon = document.getElementById("unitIcon")

 const tile = GameState.map[unit.y][unit.x]

 const terrainName = TERRAIN_NAMES?.[tile.terrain] ?? "Undefined"

 let info =
  "Map: ["+unit.x+", "+unit.y+"]"+
  "<br>Terrain: "+terrainName

 if(tile.vegetation > 0){
  const vegName = TERRAIN_NAMES?.[tile.vegetation] ?? "Undefined"
  info += " (" + vegName + ")"
 }

 if(tile.river) info += "<br>River"

 const unitName = POPULATION_NAMES?.[unit.type] ?? "Unknown"

 info +=
 "<br><br>"+unitName+
 " ("+unit.moveCurrent+" of "+unit.moveTotal+" Moves)"

 textDiv.innerHTML = info

 icon.src = "graphics/population.png"
 icon.style.display = "block"
 icon.style.objectFit = "none"
 icon.style.objectPosition = "-" + (unit.type*64) + "px 0px"

}

function create(){

 sceneRef=this

 let terrainLayer
 let vegetationLayer
 let riverLayer
 let unitLayer
 let uiLayer

 terrainLayer = this.add.layer()
 vegetationLayer = this.add.layer()
 riverLayer = this.add.layer()
 unitLayer = this.add.layer()
 uiLayer = this.add.layer()

 unitLayer.setDepth(100)

 camera=this.cameras.main
 pointer=this.input.activePointer

 worldgen=createWorldGen(MAP_WIDTH,MAP_HEIGHT)
 renderer=createRenderer(
 sceneRef,
 TILE_SIZE,
 MAP_WIDTH,
 MAP_HEIGHT,
 terrainLayer,
 vegetationLayer,
 riverLayer,
 )
 minimap=createMinimap(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 cameraSystem=createCamera(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 population = createPopulationSystem(sceneRef,TILE_SIZE,unitLayer,onUnitCycle)
 inputSystem=createInput(sceneRef,pointer,SETTINGS,camera,population,MAP_WIDTH,MAP_HEIGHT,onUnitMoved)
 
 generateWorld()

 cameraSystem.setBounds()
 
 const canvas=this.sys.game.canvas

 canvas.addEventListener("mouseenter",()=>mouseInsideMap=true)
 canvas.addEventListener("mouseleave",()=>mouseInsideMap=false)

 // Starting population
 population.createUnit(6, 6, 0, 3) // x, y, type, moves
 population.createUnit(7, 8, 0, 3) // x, y, type, moves
 population.createUnit(12, 10, 0, 3) // x, y, type, moves
 
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

   const unit = population.getUnitAt(x,y)

   const tile = GameState.map[y][x]

    const terrain = tile.terrain
    const terrainName = TERRAIN_NAMES?.[terrain] ?? "Undefined"

   let info =
    "["+x+", "+y+"]"+
    "<br>"+terrainName

    if(tile.vegetation > 0)
    {
        const vegName = TERRAIN_NAMES?.[tile.vegetation] ?? "Undefined"
        info += " (" + vegName + ")"
    }

    if(tile.river) { info += "<br>River" }

   const textDiv = document.getElementById("tiletext")
   const icon = document.getElementById("unitIcon")

   textDiv.innerHTML = info
   icon.style.display = "none"
   icon.style.objectFit = "none"
   
   //drawSelection()
   
    if(unit){
    population.setActive(unit)
    sceneRef.tweens.add({

 targets: camera,

 scrollX: unit.x*TILE_SIZE - camera.width/2 + TILE_SIZE/2,
 scrollY: unit.y*TILE_SIZE - camera.height/2 + TILE_SIZE/2,

 duration: 250,
 ease: "Sine.easeOut"

})
    } else {
    population.setActive(null)
    }

    if(unit){

    const unitName = POPULATION_NAMES?.[unit.type] ?? "Unknown"

    textDiv.innerHTML +=
    "<br><br>" + unitName +
    " (" + unit.moveCurrent + " of " + unit.moveTotal + " Moves)"

    icon.src = "graphics/population.png"
    icon.style.display = "block"
    icon.style.objectPosition = "-" + (unit.type*64) + "px 0px"

}

//   const targetX = x * TILE_SIZE + TILE_SIZE / 2
//   const targetY = y * TILE_SIZE + TILE_SIZE / 2
//   camera.centerOn(targetX, targetY)

  }

 })

}

function update(){

 if(mouseInsideMap){
 inputSystem.update()
 }

 minimap.draw(GameState.map)
 population.update(this.time.now)

}

function generateWorld(){

 GameState.map = worldgen.generate(SETTINGS)

 renderer.render(GameState.map)

 minimap.setup()
 minimap.draw(GameState.map)

}

function onUnitCycle(unit){

 if(!unit) return

 selectedTile = {x:unit.x, y:unit.y}

 //drawSelection()

 sceneRef.tweens.add({

 targets: camera,

 scrollX: unit.x*TILE_SIZE - camera.width/2 + TILE_SIZE/2,
 scrollY: unit.y*TILE_SIZE - camera.height/2 + TILE_SIZE/2,

 duration: 250,
 ease: "Sine.easeOut"

})

 onUnitMoved(unit)

}

function drawSelection(){

 if(selectionGraphic) selectionGraphic.destroy()

 if(!selectedTile) return

 selectionGraphic=sceneRef.add.graphics()

 selectionGraphic.lineStyle(2,0xffff00,1)

 selectionGraphic.strokeRect(
  selectedTile.x*TILE_SIZE,
  selectedTile.y*TILE_SIZE,
  TILE_SIZE,
  TILE_SIZE
 )

}



}

loadSettings()