export function normalizeActivityCatalogue(source){
  if(!Array.isArray(source))return [];
  return source.map(row=>Array.isArray(row)?{
    code:row[0],name:row[1],project:row[2],directorate:row[3],sdgs:row[4],au:row[5]
  }:row&&typeof row==="object"?{
    code:row.code,name:row.name,project:row.project,directorate:row.directorate,sdgs:row.sdgs,au:row.au
  }:null).filter(row=>row&&row.code&&row.name&&row.directorate);
}
