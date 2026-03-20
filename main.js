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
let turnState="PLAYER"   // PLAYER | ENDING | AI | STARTING

let camera
let pointer
let selectedTile=null
let mouseInsideMap=false

let sceneRef
let selectionGraphic=null
let selectionBlinkTimer

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
 this.load.spritesheet("roads","graphics/roads.png?v="+v,{frameWidth:64,frameHeight:64})
 this.load.spritesheet("population","graphics/population.png?v="+v,{frameWidth:64,frameHeight:64})
  this.load.image("hidden","graphics/hidden.png?v="+v)
}

function startTurn(){

 turnState="STARTING"

 currentTurn++

 updateVisibility()
 renderer.render(GameState.map)

 for(const u of population.units){
  u.moveCurrent = u.moveTotal // replenish moves
  // clear temporary orders at start of turn
  if(u.order === "M" || u.order === "W" || u.order === "S"){
  u.setOrder(null)
 }

 // AI units replenish moves
 for(const u of aiPopulation.units){
  u.moveCurrent = u.moveTotal
 }

 }

 // find first unit that should act
 const firstUnit = population.getNextUnitWithMoves()

 if(firstUnit){
  activateUnit(firstUnit)
 } else {
  population.setActive(null)
 }

 updateTurnInfo()

 setTimeout(()=>{
  turnState="PLAYER"
 },200)

}

function endTurn(){

 if(turnState !== "PLAYER") return

 turnState = "AI"

 // wait for last movement to visually finish
 setTimeout(()=>{
  turnState = "AI"
  runAITurn(aiPopulation, startTurn)
 },500)

}



function checkEndTurn(){

 if(turnState !== "PLAYER") return

 for(const u of population.units){

  if(u.moveCurrent > 0 && (u.order === null || u.order === "M" || u.order === "W")){
   return
  }

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
 unit.setOrder(null)

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

function updateVisibility(){

 // reset
 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){
   const tile = GameState.map[y][x]
   tile.visible = false
  
 // roads are always visible
   if(tile.road){
   tile.visible = true
   tile.explored = true
  }
 }

 // reveal from all units
 for(const unit of population.units){
 
  let radius = unit.vision

  const tile = GameState.map[unit.y][unit.x]

  if(tile.terrain === 8){
   radius += 1
  }

  for(let dy=-radius; dy<=radius; dy++)
  for(let dx=-radius; dx<=radius; dx++){

   const x = unit.x + dx
   const y = unit.y + dy

   const t = GameState.map[y]?.[x]
   if(!t) continue

   t.visible = true
   t.explored = true

  }

 }

}

function create(){

 sceneRef=this

 let terrainLayer=this.add.layer()
 let vegetationLayer=this.add.layer()
 let riverLayer=this.add.layer()
 let roadLayer=this.add.layer()
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
  roadLayer,
  fogLayer
 )

 minimap=createMinimap(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)
 cameraSystem=createCamera(camera,MAP_WIDTH,MAP_HEIGHT,TILE_SIZE)

 population=createPopulationSystem(sceneRef,TILE_SIZE,unitLayer,
    onUnitCycle,checkEndTurn,onUnitMoved, false)
 aiPopulation = createPopulationSystem(sceneRef,TILE_SIZE,unitLayer,
 null,null,null, true)

 inputSystem=createInput(
 sceneRef,
 pointer,
 SETTINGS,
 camera,
 population,
 MAP_WIDTH,
 MAP_HEIGHT,
 onUnitMoved,
 checkEndTurn,
 activateUnit,
 renderer
)

 generateWorld()

 cameraSystem.setBounds()

 const canvas=this.sys.game.canvas

 canvas.addEventListener("mouseenter",()=>mouseInsideMap=true)
 canvas.addEventListener("mouseleave",()=>mouseInsideMap=false)

 // Starting population
 population.createUnit(6,6, TYPE.PEASANT, SOCIAL_CLASS.PEASANT, 3,1)  // x,y,type, social class, moves, vision
 population.createUnit(7,8, TYPE.MERCHANT, SOCIAL_CLASS.BURGHER, 3,1)
 population.createUnit(12,10, TYPE.CLERIC, SOCIAL_CLASS.CLERGY, 3,1)
 population.createUnit(15,8, TYPE.NOBLE, SOCIAL_CLASS.NOBLE,3,1)

 // AI units
 aiPopulation.createUnit(8,6, TYPE.PAGAN_COMMONER, null, 3,1)

 for(const unit of population.units){
 explore(unit)
 }
 renderer.render(GameState.map)

 const firstUnit=population.units[0]

 if(firstUnit){
  activateUnit(firstUnit)
 }

 updateTurnInfo()


 // DEBUG BUTTONS -----------------------------------------

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

   if(unit)
   {
      activateUnit(unit)
      if(selectionGraphic) selectionGraphic.destroy()
   }
   else 
   {
     population.setActive(null)
     drawSelection()
   }

   updateInfoPanel(x,y)
   
  }
 })

 document.getElementById("exploreAll").onclick = () => {

 for(let y=0; y<MAP_HEIGHT; y++){
  for(let x=0; x<MAP_WIDTH; x++){
   GameState.map[y][x].explored = true
  }
 }

 renderer.render(GameState.map)

}

// END OF DEBUG BUTTONS -----------------------------------------

}

function update(){

 if(mouseInsideMap){
  inputSystem.update()
 }

 minimap.draw(GameState.map)
 population.update(this.time.now)
 aiPopulation.update(this.time.now, true)
}

function generateWorld(){
 GameState.map=worldgen.generate(SETTINGS)
 minimap.setup()
 for(const unit of population.units){
    explore(unit)
 }
 minimap.draw(GameState.map)
 renderer.render(GameState.map)
 
}

function explore(unit){

 let radius = unit.vision

 const tile = GameState.map[unit.y][unit.x]

 // Hill sight bonus
 if(tile.terrain === 8){
  radius += 1
 }

 for(let dy=-radius; dy<=radius; dy++)
 for(let dx=-radius; dx<=radius; dx++){

  const x = unit.x + dx
  const y = unit.y + dy

  const t = GameState.map[y]?.[x]
  if(!t) continue

  t.explored = true
  t.visible = true

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
  "Location: ["+x+", "+y+"]"+
  "<br>Terrain: "+terrainName
  "<br>Vegetation: "
  let vegName = "None"

 if(tile.vegetation>0){
  vegName=TERRAIN_NAMES?.[tile.vegetation]??"Undefined"
 }
 info+="<br>Vegetation: "+vegName

 let riv = "No"

 if(tile.river) riv = "Yes"
 info+="<br>River: "+riv

 icon.style.display="none"

 if(unit){

  const unitName=POPULATION_NAMES?.[unit.type]??"Unknown"

  info+="<br><br>"+unitName+
  " ("+formatMoves(unit.moveCurrent)+" of "+formatMoves(unit.moveTotal)+" Moves)"

  icon.src="graphics/population.png"
  icon.style.display="block"
  icon.style.objectFit="none"

  const cols = 10
  const col = unit.type % cols
  const row = Math.floor(unit.type / cols)
  icon.style.objectPosition = `-${col*64}px -${row*64}px`

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

 const turnEl = document.getElementById("turnNumber")
 if(turnEl) turnEl.innerText = currentTurn

 if(selectedTile){
  updateInfoPanel(selectedTile.x,selectedTile.y)
 }
}

function drawSelection(){

 if(selectionBlinkTimer){
  selectionBlinkTimer.remove()
  selectionBlinkTimer = null
 }

 if(selectionGraphic) selectionGraphic.destroy()

 if(!selectedTile) return

 selectionGraphic = sceneRef.add.graphics()

 selectionGraphic.lineStyle(4,0xffffff,1)

 selectionGraphic.strokeRect(
  selectedTile.x*TILE_SIZE,
  selectedTile.y*TILE_SIZE,
  TILE_SIZE,
  TILE_SIZE
 )

 selectionBlinkTimer = sceneRef.time.addEvent({
  delay:500,
  loop:true,
  callback:()=>{
   if(selectionGraphic){
    selectionGraphic.visible = !selectionGraphic.visible
   }
  }
 })
}



}

loadSettings()