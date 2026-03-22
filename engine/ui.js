window.UI_LOCK = false

window.showCombatDialog = function(attacker, defender, attackerIsAI){

 showDialog()

 attacker._hp = 3
 defender._hp = 3

 const attackerName = POPULATION_NAMES?.[attacker.type] ?? "Unknown"
 const defenderName = POPULATION_NAMES?.[defender.type] ?? "Unknown"

document.getElementById("attackerName").innerText = attackerName
document.getElementById("defenderName").innerText = defenderName

renderHP(attacker, document.getElementById("attackerHP"))
renderHP(defender, document.getElementById("defenderHP"))

function setIcon(el, type){

 const cols = 10
 const col = type % cols
 const row = Math.floor(type / cols)

 const pos = `-${col*64}px -${row*64}px`

 el.querySelector(".iconBase").style.backgroundPosition = pos
 el.querySelector(".iconFlash").style.backgroundPosition = pos
}

setIcon(document.getElementById("attackerIcon"), attacker.type)
setIcon(document.getElementById("defenderIcon"), defender.type)

document.getElementById("attackerStats").innerHTML =
 `Attack: ${attacker.attack}`

document.getElementById("defenderStats").innerHTML =
 `Defense: ${defender.defense}`
 
 document.getElementById("combatDialog").style.display = "block"

const fightBtn = document.getElementById("fightBtn")
const cancelBtn = document.getElementById("cancelBtn")

const actions = document.getElementById("combatActions")

if(attackerIsAI){

 actions.style.display = "none"

 // auto-start combat after short delay
 setTimeout(()=>{
  resolveCombat(attacker, defender)
 }, 1000)

} else {

 actions.style.display = "flex"

}

fightBtn.onclick = () => {
 resolveCombat(attacker, defender)
}

cancelBtn.onclick = () => {
 closeCombatDialog()
}

}

window.closeCombatDialog = function (){
 hideDialog()
 document.getElementById("combatDialog").style.display = "none"
}

// Combat functions
function renderHP(unit, el){

 let stars = ""

 for(let i=0;i<unit._hp;i++){
  stars += "★"
 }

 for(let i=unit._hp;i<3;i++){
  stars += "☆"
 }

 el.innerText = stars
}

function flashIcon(el){

 const flash = el.querySelector(".iconFlash")

 flash.style.opacity = "1"

 setTimeout(()=>{
  flash.style.opacity = "0"
 }, 100)
}

function shakeIcon(el){

 let i = 0

 const interval = setInterval(()=>{

  const dx = (Math.random()-0.5) * 6
  const dy = (Math.random()-0.5) * 6

  el.style.transform = `translate(${dx}px, ${dy}px)`

  i++

  if(i > 4){
   clearInterval(interval)
   el.style.transform = "translate(0px, 0px)"
  }

 }, 30)
}

function resolveCombat(attacker, defender){

 const attackerIcon = document.getElementById("attackerIcon")
 const defenderIcon = document.getElementById("defenderIcon")

 document.getElementById("fightBtn").style.visibility = "hidden"
 document.getElementById("cancelBtn").style.visibility = "hidden"

 function round(){

  // roll 1–10
  const atkRoll = Math.floor(Math.random()*10)+1
  const defRoll = Math.floor(Math.random()*10)+1

  const atkTotal = atkRoll + attacker.attack
  const defTotal = defRoll + defender.defense

  if(atkTotal > defTotal){

   // attacker wins round
   flashIcon(defenderIcon)
   shakeIcon(defenderIcon)
   defender._hp--

  } else {

   // defender wins (ties go to defender)
   flashIcon(attackerIcon)
   shakeIcon(attackerIcon)
   attacker._hp--

  }

  // update UI
  renderHP(attacker, document.getElementById("attackerHP"))
  renderHP(defender, document.getElementById("defenderHP"))

  // check end
  if(attacker._hp <= 0 || defender._hp <= 0){

   setTimeout(()=>{
    endCombat(attacker, defender)
   }, 700)

   return
  }

  // slower pacing
  setTimeout(round, 600)
 }

 round()
}

function endCombat(attacker, defender){

const attackerIcon = document.getElementById("attackerIcon")
const defenderIcon = document.getElementById("defenderIcon")



let loserIcon

if(attacker._hp > 0){
 loserIcon = defenderIcon
} else {
 loserIcon = attackerIcon
}

// hide loser
loserIcon.style.opacity = "0"

// short pause so player sees result
setTimeout(()=>{

 closeCombatDialog()

 // reset for next combat
 attackerIcon.style.opacity = "1"
 defenderIcon.style.opacity = "1"
 document.getElementById("fightBtn").style.visibility = "visible"
 document.getElementById("cancelBtn").style.visibility = "visible"

}, 1000)

}

// Dialog functions
function showDialog(){
 UI_LOCK = true
 document.getElementById("modalOverlay").style.display = "block"
  if(sceneRef?.input?.keyboard){
  sceneRef.input.keyboard.enabled = false
 }
}

function hideDialog(){
 UI_LOCK = false
 document.getElementById("modalOverlay").style.display = "none"
 if(sceneRef?.input?.keyboard){
  sceneRef.input.keyboard.enabled = true
 }
 UI_LOCK = false
}


