function createWorldGen(MAP_WIDTH,MAP_HEIGHT){

function generate(settings){

 let map=[]

 for(let y=0;y<MAP_HEIGHT;y++){

  map[y]=[]

  for(let x=0;x<MAP_WIDTH;x++){
    map[y][x] = {
    terrain: 0,
    vegetation: 0,
    resource: 0,
    river: false,
    road: false
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

   if(r<0.30) map[cy][cx].terrain=5           // Plain
   else if(r<0.80) map[cy][cx].terrain=6      // Grassland
   else if(r<0.90) map[cy][cx].terrain=7      // Wetland
   else if(r<0.97) map[cy][cx].terrain=8      // Hill
   else map[cy][cx].terrain=9                 // Mountain

  }

 }

 generateCoasts(map)
 generateVegetation(map)
 
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
  const r=Math.random()
  if(r<0.95) map[y][x].terrain=1
  else map[y][x].terrain=2    
  }
 }

 }
}

function generateVegetation(map){

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  const tile = map[y][x]
  const t = tile.terrain

  let options = []

  if(t===5 || t===6 || t===7)
   options = [10,11,12,13]

  else if(t===8)
   options = [14]

  if(options.length===0) continue

  if(Math.random() < 0.5){

   tile.vegetation = options[
    Math.floor(Math.random()*options.length)
   ]

  }

 }

}

return{generate}

}