// Diagnostic only. Call after a completed MotionForce outer tick, before another tick or membership mutation.
// Read plain storage; do not read SpatialMotion.current or FieldReading.energy (both can evaluate the field).
export function snapshotMotion({ motion, ids, nodes, wrapper, tuning, layout, links, limits, epoch }) {
  if (!motion || motion.pending !== null || motion.rereading !== null) throw Error('Snapshot requires a complete outer-tick boundary');
  const field=motion.field;
  if(ids.length!==field.count || !motion.reading)throw Error('A complete live field and its cached reading are required');
  const array=value=>value===undefined?null:Array.from(value);
  const directions={};for(let low=0;low<ids.length;low++)for(let high=low+1;high<ids.length;high++)directions[low+':'+high]={...field.direction(low,high)};
  const caches={};for(const name of ['force','next','nextPositions','nextVelocity','moves','travelled'])caches[name]=array(motion[name]);
  return {format:'live-docs-motion-replay/1',epoch,ids:[...ids],nodes:nodes.map(node=>({id:node.id,x:node.x,y:node.y,z:node.z,fx:node.fx,fy:node.fy,fz:node.fz,vx:node.vx,vy:node.vy,vz:node.vz,directoryPath:node.directoryPath,shellFiles:node.shellFiles,shellBody:node.shellBody,symbolCount:node.symbolCount})),
    field:{radii:array(field.radii),springs:field.springs.map(spring=>({...spring})),settings:{...field.settings},softness:array(field.softness),mass:array(field.mass),directions},
    motion:{positions:array(motion.positions),velocity:array(motion.velocity),anchor:array(motion.anchor),held:motion.held,settings:{...motion.settings},caches,
      reading:{stiffness:motion.reading.stiffness,overlaps:motion.reading.overlaps,worstOverlap:motion.reading.worstOverlap},pending:null,rereading:null},
    wrapper:{...wrapper,part:Number.isFinite(wrapper.part)?wrapper.part:'Infinity'},tuning:{...tuning},layout,links:links.map(link=>({...link,source:typeof link.source==='string'?link.source:link.source.id,target:typeof link.target==='string'?link.target:link.target.id})),limits:{...limits}};
}
