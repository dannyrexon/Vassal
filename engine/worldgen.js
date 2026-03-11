function createWorldGen(MAP_WIDTH,MAP_HEIGHT){

function generate(settings){

 let map=[]

 for(let y=0;y<MAP_HEIGHT;y++){

  map[y]=[]

  for(let x=0;x<MAP_WIDTH;x++) map[y][x]=0

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

   if(r<0.55) map[cy][cx]=2
   else if(r<0.8) map[cy][cx]=3
   else if(r<0.95) map[cy][cx]=4
   else map[cy][cx]=5

  }

 }

 generateCoasts(map)

 return map

}

function generateCoasts(map){

 for(let y=0;y<MAP_HEIGHT;y++)
 for(let x=0;x<MAP_WIDTH;x++){

  if(map[y][x]===0){

   const n=[
    map[y-1]?.[x],
    map[y+1]?.[x],
    map[y]?.[x-1],
    map[y]?.[x+1]
   ]

   if(n.some(v=>v>=2)) map[y][x]=1

  }

 }

}

return{generate}

}