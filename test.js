const map = new Map(
  [' ', ' ', ' ', ' ', ' ', ' '],
  [' ', 'X', ' ', ' ', ' ', ' '],
  [' ', 'G', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', 'X', ' ', ' '],
  [' ', ' ', 'X', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', 'X', ' '],
  [' ', ' ', 'X', ' ', 'X', ' '],
  [' ', 'X', 'X', ' ', ' ', ' '],
  [' ', ' ', 'X', ' ', ' ', ' '],
  [' ', ' ', ' ', 'X', ' ', ' '],
  [' ', 'X', ' ', ' ', ' ', ' '],
  [' ', 'X', ' ', ' ', ' ', 'X'],
  [' ', 'X', ' ', ' ', ' ', 'X'],
  ['X', ' ', 'X', ' ', ' ', ' '],
  [' ', 'X', ' ', 'S', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ']
);

const renderer = new Renderer(document.getElementById('container'));
renderer.drawGrid(6, 16);

map.iterate((x, y) => {
  if (map.matrix[x][y] === TileTypes.WALL)
    renderer.setColor('#d3d3d3', {x, y});
});
renderer.setColor('#00FF00', map.goal);
renderer.setColor('#0000ff', map.start);

map.onCloseListUpdate( routeNode => renderer.setColor('#ff0', {x: routeNode.x, y: routeNode.y}) );
map.onOpenListUpdate(routeNodes => {
  routeNodes.forEach(routeNode => renderer.setColor('#ffa500', {x: routeNode.x, y: routeNode.y}) )
});

map.findpath();
