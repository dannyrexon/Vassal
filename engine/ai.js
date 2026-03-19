function runAITurn(aiPopulation, startTurn){

 setTimeout(()=>{
 },1000)

 // AI logic
 const dirs = [
  {x:0,y:-1},
  {x:1,y:0},
  {x:0,y:1},
  {x:-1,y:0}
 ]

 for(const u of aiPopulation.units){

  if(u.moveCurrent <= 0) continue

  // shuffle directions
  const shuffled = dirs.sort(()=>Math.random()-0.5)

  for(const d of shuffled){

   const nx = u.x + d.x
   const ny = u.y + d.y

   const tile = GameState.map[ny]?.[nx]
   if(!tile) continue

   // avoid coast + mountains
   if(tile.terrain === 1) continue   // coast
   if(tile.terrain === 8 || tile.terrain === 9) continue // mountains

   // move 1 step
   aiPopulation.moveUnit(u, nx, ny)

   u.moveCurrent = 0

   break
  }

 }

 setTimeout(()=>{
  startTurn()
 },500)

}