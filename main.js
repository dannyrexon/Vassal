let SETTINGS=null
let TERRAIN_NAMES=null
let POPULATION_NAMES=null
let showVegetation=true

async function loadSettings(){

 const settingsReq=await fetch("map_settings.json")
 SETTINGS=await settingsReq.json()

 const terrainReq=await fetch("terrain_names.json")
 TERRAIN_NAMES=await terrainReq.json()

 const popReq=await fetch("population_names.json")
 POPULATION_NAMES=await popReq.json()

 startGame()
}

function startGame(){

const TILE_SIZE=SETTINGS.tile_size
const MAP_WIDTH=SETTINGS.map_width
const MAP_HEIGHT=SETTINGS.map_height

let currentTurn=1
let turnState="PLAYER"   // PLAYER | ENDING | STARTING

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

const config={
 type:Phaser.AUTO,
 width:window.innerWidth-320,
 height:window.innerHeight-32,
 parent:"game-container",
 pixelArt:true,
 roundPixels:true,
 scale:{mode:Phaser.Scale.NONE},
 scene:{preload,create,update}
}

const game=new Phaser.Game(config)

function preload(){

 const v=Date.now()

 this.load.spritesheet("terrain","graphics/terrain.png?v="+v,{frameWidth:64,frameHeight:64})
 this.load.spritesheet("transitions","graphics/transitions.png?v="+v,{frameWidth:64,frameHeight:64})
 this.load.spritesheet("rivers","graphics/rivers.png?v="+v,{frameWidth:64,frameHeight:64})
 this.load.spritesheet("population","graphics/population.png?v="+v,{frameWidth:64,frameHeight:64})
 this.load.image("hidden","graphics/hidden.png?v="+v)
}

function startTurn(){

 turnState="STARTING"

 currentTurn++

 for(const u of population.units){
  u.moveCurrent=u.moveTotal
 }

 const firstUnit=population.units[0]

 if(firstUnit){
  activateUnit(firstUnit)
 }

 updateTurnInfo()

 setTimeout(()=>{
  turnState="PLAYER"
 },200)
}

function endTurn(){

 if(turnState!=="PLAYER") return

 turnState="ENDING"

 setTimeout(()=>{
  startTurn()
 },500)
}

function checkEndTurn(){

 if(turnState!=="PLAYER") return

 for(const u of population.units){
  if(u.moveCurrent>0) return
 }

 endTurn()
}

function onUnitMoved(unit){

 selectedTile={x:unit.x,y:unit.y}
 explore(unit)

 renderer.render(GameState.map)
 updateInfoPanel(unit.x,unit.y)
 
}

function activateUnit(unit){

 if(!unit) return

 population.setActive(unit)

 selectedTile={x:unit.x,y:unit.y}

 updateInfoPanel(unit.x,unit.y)

 sceneRef.tweens.killTweensOf(camera)

 sceneRef.tweens.add({
  targets:camera,
  scrollX:unit.x*TILE_SIZE-camera.width/2+TILE_SIZE/2,
  scrollY:unit.y*TILE_SIZE-camera.height/2+TILE_SIZE/2,
  duration:250,
  ease:"Sine.easeOut"
 })
}

function create(){

 sceneRef=this

 let terrainLayer=this.add.layer()
 let vegetationLayer=this.add.layer()
 let riverLayer=this.add.layer()
 let unitLayer=this.add.layer()
 let uiLayer=this.add.layer()
 let fogLayer = this.add.layer()

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
  fogLayer
 )

 minimap=createMinimap(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 cameraSystem=createCamera(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)

 population=createPopulationSystem(sceneRef,TILE_SIZE,unitLayer,
    onUnitCycle,checkEndTurn,onUnitMoved)

 inputSystem=createInput(
  sceneRef,
  pointer,
  SETTINGS,
  camera,
  population,
  MAP_WIDTH,
  MAP_HEIGHT,
  onUnitMoved,
  checkEndTurn
 )

 generateWorld()

 cameraSystem.setBounds()

 const canvas=this.sys.game.canvas

 canvas.addEventListener("mouseenter",()=>mouseInsideMap=true)
 canvas.addEventListener("mouseleave",()=>mouseInsideMap=false)

 population.createUnit(6,6,0,3,1)  // x,y,type,moves,vision
 population.createUnit(7,8,1,3,1)
 population.createUnit(12,10,2,3,1)
 population.createUnit(15,8,3,3,1)

 for(const unit of population.units){
 explore(unit)
 }
 renderer.render(GameState.map)

 const firstUnit=population.units[0]

 if(firstUnit){
  activateUnit(firstUnit)
 }

 updateTurnInfo()

 document.getElementById("toggleVeg").onclick=()=>{
  showVegetation=!showVegetation
  const btn=document.getElementById("toggleVeg")
  btn.innerText=showVegetation?"Hide Vegetation":"Show Vegetation"
  renderer.render(GameState.map)
 }

 document.getElementById("regen").onclick=generateWorld

 this.input.on("pointerdown",(p)=>{

  const x=Math.floor(p.worldX/TILE_SIZE)
  const y=Math.floor(p.worldY/TILE_SIZE)

  if(x>=0 && y>=0 && x<MAP_WIDTH && y<MAP_HEIGHT){

   selectedTile={x,y}

   const unit=population.getUnitAt(x,y)

   if(unit) activateUnit(unit)
   else population.setActive(null)

   updateInfoPanel(x,y)
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

 GameState.map=worldgen.generate(SETTINGS)

 minimap.setup()
 minimap.draw(GameState.map)

 for(const unit of population.units){
 explore(unit)
 }

 renderer.render(GameState.map)

}

function explore(unit){

 const tile = GameState.map[unit.y][unit.x]

 let radius = unit.vision

 // hill bonus
 if(tile.terrain === 8){
  radius += 1
 }

 for(let dy=-radius; dy<=radius; dy++)
 for(let dx=-radius; dx<=radius; dx++){

  const x = unit.x + dx
  const y = unit.y + dy

  if(!GameState.map[y]?.[x]) continue

  GameState.map[y][x].explored = true

 }

}


function onUnitCycle(unit){

 activateUnit(unit)
}

function updateInfoPanel(x,y){

 const textDiv=document.getElementById("tiletext")
 const icon=document.getElementById("unitIcon")

 const tile=GameState.map[y][x]
 const unit=population.getUnitAt(x,y)

 const terrainName=TERRAIN_NAMES?.[tile.terrain]??"Undefined"

 let info=
  "Turn: "+currentTurn+
  "<br>Map: ["+x+", "+y+"]"+
  "<br>Terrain: "+terrainName

 if(tile.vegetation>0){

  const vegName=TERRAIN_NAMES?.[tile.vegetation]??"Undefined"

  info+=" ("+vegName+")"
 }

 if(tile.river) info+="<br>River"

 icon.style.display="none"

 if(unit){

  const unitName=POPULATION_NAMES?.[unit.type]??"Unknown"

  info+="<br><br>"+unitName+
  " ("+formatMoves(unit.moveCurrent)+" of "+formatMoves(unit.moveTotal)+" Moves)"

  icon.src="graphics/population.png"
  icon.style.display="block"
  icon.style.objectFit="none"
  icon.style.objectPosition="-"+(unit.type*64)+"px 0px"
  icon.onclick = () => {
   activateUnit(unit)
  }

 }

 textDiv.innerHTML=info
}

function formatMoves(moves){

 const whole=Math.floor(moves/3)
 const rem=moves%3

 if(rem===0) return whole.toString()

 const frac=rem+"/3"

 if(whole===0) return frac

 return whole+" "+frac
}

function updateTurnInfo(){

 if(selectedTile){
  updateInfoPanel(selectedTile.x,selectedTile.y)
 }
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