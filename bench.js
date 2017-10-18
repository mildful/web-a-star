const x = 95; //95
const y = 45; //45
console.log('Generate map...');
console.time('map_generation');
const map = new Map(x, y, { wallFrequency: .25 }); //.25
console.timeEnd('map_generation');

console.log('Generate start...');
console.time('start_generation');
map.generateRandomStart();
console.log(`[${map.start.x}, ${map.start.y}]`);
console.timeEnd('start_generation');

console.log('Generate goal...');
console.time('goal_generation');
map.generateRandomGoal();
console.log(`[${map.goal.x}, ${map.goal.y}]`);
console.timeEnd('goal_generation');

console.log('Finding path...');
console.time('astar');
const route = map.findpath();
console.timeEnd('astar');
console.log('final route: ', route);

console.log('Rendering...');
console.time('rendering');
const renderer = new Renderer(document.getElementById('canvas'), 20);
// grid
renderer.drawGrid(x, y);
// walls
map.iterate((x, y) => {
  if (map.matrix[x][y] === TileTypes.WALL)
    renderer.setColor('#a5bdd9', {x, y}); //B0C4DE
});
// TODO: mettre ca dans render
// lists
let closeList = map.closeList;
closeList.shift();
closeList.pop();
closeList.forEach((routeNode, i) => {
  setTimeout(() => {
    renderer.setColor('#ffa600', {x: routeNode.x, y: routeNode.y});
    if (i === closeList.length - 1) {
      // open list
      map.openList.forEach( routeNode => {
        renderer.setColor('#cc8500', {x: routeNode.x, y: routeNode.y});
      });
      // route
      route.shift();
      route.pop();
      route.forEach(node => renderer.setColor('#ff0', {x: node.x, y: node.y}))
    }
  }, i*15);
});
// start
renderer.setColor('#0000ff', {x: startX, y: startY});
// goal
renderer.setColor('#00FF00', {x: goalX, y: goalY});
// path
//renderer.path(map.closeList);
console.timeEnd('rendering');


// file:///C:/Users/cflodrops/datas/lazycoding-posts/a-star/index.html
