function createWorldGen(MAP_WIDTH,MAP_HEIGHT){

function generate(settings){

 let map=[]

 for(let y=0;y<MAP_HEIGHT;y++){

  map[y]=[]

  for(let x=0;x<MAP_WIDTH;x++){
   map[y][x] = {
    terrain:0,
    vegetation:0,
    resource:0,
    river:false,
    road:false,
    explored: false,
    visible:false
   }
  }

 }

 for(let c=0;c<settings.continents;c++){

  let cx=Math.floor(Math.random()*MAP_WIDTH)
  let cy=Math.floor(Math.random()*MAP_HEIGHT)

  let size=settings.continent_size_min+
           Math.random()*(settings.continent_size_max-settings.continent_size_min)

  for(let i=0;i<size;i++){

   cx+=Math.floor(Math.random()*3)-1
   cy+=Math.floor(Math.random()*3)-1

   if(cx<0||cy<0||cx>=MAP_WIDTH||cy>=MAP_HEIGHT) continue

   const r=Math.random()

   if(r<0.30) map[cy][cx].terrain=5
   else if(r<0.80) map[cy][cx].terrain=6
   else if(r<0.90) map[cy][cx].terrain=7
   else if(r<0.97) map[cy][cx].terrain=8
   else map[cy][cx].terrain=9

  }

 }

 generateCoasts(map)
 generateVegetation(map)
 generateRivers(map,settings)

 return map

}

function generateCoasts(map){

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  if(map[y][x].terrain===0){

   const n=[
    map[y-1]?.[x-1]?.terrain,
    map[y-1]?.[x]?.terrain,
    map[y-1]?.[x+1]?.terrain,
    map[y]?.[x-1]?.terrain,
    map[y]?.[x+1]?.terrain,
    map[y+1]?.[x-1]?.terrain,
    map[y+1]?.[x]?.terrain,
    map[y+1]?.[x+1]?.terrain
   ]

   if(n.some(v=>v>=3)){
    map[y][x].terrain=1
   }

  }

 }

}

function generateVegetation(map){

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  const tile=map[y][x]
  const t=tile.terrain

  let options=[]

  if(t===5||t===6||t===7)
   options=[10,11,12,13]

  else if(t===8)
   options=[14]

  if(options.length===0) continue

  if(Math.random()<0.5){

   tile.vegetation=options[
    Math.floor(Math.random()*options.length)
   ]

  }

 }

}

function generateRivers(map,settings){

 const riverTarget = settings.rivers ?? 8
 const MIN_LENGTH = settings.river_min_length ?? 6

 let riversCreated = 0
 let attempts = 0
 const MAX_ATTEMPTS = riverTarget * 80

 const coastTiles=[]

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++)
  if(map[y][x].terrain===1)
   coastTiles.push({x,y})

 function distToCoast(x,y){

  let best=9999

  for(const c of coastTiles)
   best=Math.min(best,Math.abs(x-c.x)+Math.abs(y-c.y))

  return best

 }

 function hasRiverNeighbour(x,y,px,py){

  const dirs=[
   {x:-1,y:0},
   {x:1,y:0},
   {x:0,y:-1},
   {x:0,y:1}
  ]

  for(const d of dirs){

   const nx=x+d.x
   const ny=y+d.y

   if(nx===px && ny===py) continue

   if(map[ny]?.[nx]?.river)
    return true

  }

  return false

 }

 while(riversCreated < riverTarget && attempts < MAX_ATTEMPTS){

  attempts++

  let start=null

  for(let i=0;i<1000;i++){

   const x=Math.floor(Math.random()*MAP_WIDTH)
   const y=Math.floor(Math.random()*MAP_HEIGHT)

   const tile=map[y][x]
   const t=tile.terrain

   if(!(t===5||t===6||t===7)) continue

   const neighbors=[
    map[y-1]?.[x]?.terrain,
    map[y+1]?.[x]?.terrain,
    map[y]?.[x-1]?.terrain,
    map[y]?.[x+1]?.terrain
   ]

   if(neighbors.some(n=>n===1||n===2)) continue
   if(hasRiverNeighbour(x,y)) continue

   start={x,y}
   break

  }

  if(!start) continue

  let cx=start.x
  let cy=start.y

  const visited=new Set()
  const path=[]

  while(true){

   const key=cx+","+cy
   visited.add(key)

   path.push({x:cx,y:cy})

   const tile=map[cy][cx]

   if(tile.terrain===1) break

   const dirs=[
    {x:-1,y:0},
    {x:1,y:0},
    {x:0,y:-1},
    {x:0,y:1}
   ]

   let best=null
   let bestDist=9999

   for(const d of dirs){

    const nx=cx+d.x
    const ny=cy+d.y

    const next=map[ny]?.[nx]
    if(!next) continue

    const key2=nx+","+ny
    if(visited.has(key2)) continue

    if(next.terrain===8||next.terrain===9) continue

    if(hasRiverNeighbour(nx,ny,cx,cy)) continue

    const dist=distToCoast(nx,ny)

    if(dist<bestDist){
     bestDist=dist
     best={x:nx,y:ny}
    }

   }

   if(!best) break

   cx=best.x
   cy=best.y

  }

  // river must end on coast
  if(map[cy][cx].terrain !== 1) continue

  if(path.length < MIN_LENGTH) continue

  for(const p of path){

   const t=map[p.y][p.x]

   t.river=true
   // t.vegetation=0

  }

  riversCreated++

 }

}

function hasRiverNeighbour(map,x,y,px,py){

 const dirs=[
  {x:-1,y:0},
  {x:1,y:0},
  {x:0,y:-1},
  {x:0,y:1}
 ]

 for(const d of dirs){

  const nx=x+d.x
  const ny=y+d.y

  if(nx===px&&ny===py) continue

  if(map[ny]?.[nx]?.river)
   return true

 }

 return false

}

return{generate}

}