/*
export / import
place walls
place start
place goal
rejouer animation
afficher le temps de generation de la map
afficher temps generation goal / start
afficher temps resolution en gros
afficher temps rendu
capacité de faire de multiples imports / exports pour avoir de la data (NN)
*/

function generateAndResolveMap() {
  const w = +document.querySelector('.settings input[name="width"]').value;
  const h = +document.querySelector('.settings input[name="height"]').value;
  const wallFrequency = +document.querySelector('.settings input[name="wall-frequency"]').value;
  const map = new Map(w, h, { wallFrequency });

  map.generateRandomStart();
  map.generateRandomGoal();
  const route = map.findpath();

  return { map, route };
}

let timeouts = []; // prevents from render issues when spamming 'generate' button :)
function renderMap(renderer, map, route) {
  // clear !
  timeouts.forEach(id => clearTimeout(id));
  timeouts = [];
  renderer.clear();
  // grid
  renderer.drawGrid(map.width, map.height);
  // walls
  map.iterate((x, y) => {
    if (map.matrix[x][y] === TileTypes.WALL)
      renderer.setColor('#a5bdd9', {x, y}); //B0C4DE
  });
  // lists
  let closeList = map.closeList;
  closeList.shift();
  if (route.length > 0) {
    closeList.pop();
  }
  closeList.forEach((routeNode, i) => {
    timeouts.push(setTimeout(() => {
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
    }, i*15));
  });
  // start
  renderer.setColor('#0000ff', {x: map.start.x, y: map.start.y});
  // goal
  renderer.setColor('#00FF00', {x: map.goal.x, y: map.goal.y});
}

function doIt() {
  const { map, route } = generateAndResolveMap();
  const ts = +document.querySelector('.settings input[name="tile-size"]').value;
  const renderer = new Renderer(document.getElementById('canvas'), ts);
  renderMap(renderer, map, route);
}

function writePerformance(infos) {

}

// generation
doIt();
document.getElementsByClassName('generate-btn')[0].addEventListener('click', e => doIt());

// settings
let settingsVisible = true;
const settingsOverlay = document.getElementsByClassName('settings')[0];
settingsOverlay.style.display = settingsVisible ? 'block' : 'none';
document.getElementsByClassName('settings-btn')[0].addEventListener('click', e => {
  settingsVisible = !settingsVisible;
  settingsOverlay.style.display = settingsVisible ? 'block' : 'none';
});
