const TileTypes = {
  EMPTY: ' ',
  WALL: 'X',

  START: 'S',
  GOAL: 'G'
};

class Map {

  constructor(width, height, options) {
    this.openList = [];
    this.closeList = [];
    this.start = null;
    this.goal = null;

    this.closeListListeners = [];
    this.openListListeners = [];

    return Array.isArray(width)
      ? this.constructFromArrays([...arguments])
      : this.constructRandomly(width, height, options);
  }

  arrayRowsIntoColumns(arr) {
    let res = [];
    for (let x = 0; x < arr[0].length; x++) {
      res[x] = [];
      for (let y = 0; y < arr.length; y++) {
        res[x][y] = arr[y][x] || null;
      }
    }
    return res;
  }

  constructFromArrays(lines) {
    // init
    this.width = lines[0].length;
    this.height = lines.length;
    this.wallFrequency = null;
    // detect start and goal
    lines.forEach((line, y) => {
      line.forEach((tile, x) => {
        if (tile === TileTypes.START) {
          lines[y][x] = TileTypes.EMPTY;
          this.start = { x, y };
        } else if (tile === TileTypes.GOAL) {
          lines[y][x] = TileTypes.EMPTY;
          this.goal = { x, y };
        }
      })
    });
    // reverse rows into columns
    this.matrix = this.arrayRowsIntoColumns(lines);
  }

  constructRandomly(width, height, options) {
    this.width = width;
    this.height = height;
    this.matrix = [];
    this.wallFrequency = options && !Number.isNaN(options.wallFrequency) ? options.wallFrequency : .1;
    // init matrix
    // TODO: optimisation
    for (let i = 0; i < this.width; i++) {
      this.matrix.push(TileTypes.EMPTY);
    }
    this.matrix.forEach((_, x) => {
      this.matrix[x] = [];
      for (let i = 0; i < this.width; i++) {
        this.matrix[x].push(TileTypes.EMPTY);
      }
      if (this.wallFrequency) {
        this.matrix[x].forEach((_, y) => {
          this.matrix[x][y] = (Math.random() <= this.wallFrequency)
            ? TileTypes.WALL
            : TileTypes.EMPTY;
        });
      }
    });
  }

  generateRandomStart() {
    let x = Math.floor(Math.random() * this.width);
    let y = Math.floor(Math.random() * this.height);
    while (this.matrix[x][y] != TileTypes.EMPTY) {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.height);
    }
    this.start = { x, y };
  }

  generateRandomGoal() {
    let x = Math.floor(Math.random() * this.width);
    let y = Math.floor(Math.random() * this.height);
    while (this.matrix[x][y] != TileTypes.EMPTY && x != this.start.x && y != this.start.y) {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.height);
    }
    this.goal = { x, y };
  }

  onCloseListUpdate(cb) {
    this.closeListListeners.push(cb);
  }
  onOpenListUpdate(cb) {
    this.openListListeners.push(cb);
  }

  iterate(cb) {
    this.matrix.forEach( (v, x) => this.matrix[x].forEach((v, y) => cb(x, y)) );
  }

  findpath(start, goal) {
    if (start)  {
      this.start = start;
    }
    if (goal) {
      this.goal = goal;
    }

    if (!this.start) {
      throw new Error('Start missing');
    }
    if (!this.goal) {
      throw new Error('Goal missing');
    }

    this.openList.push(this.start);
    return this.findRoute();
  }

  findRoute() {
    const node = this.openList.shift();

    if (node === undefined) {
      // END
      return [];
    }

    if (node.x === this.goal.x && node.y === this.goal.y) {
      // GOOD
      let route = [node];
      let prevNode = node.parent;
      while (prevNode) {
        route.push(prevNode);
        prevNode = prevNode.parent;
      }
      return route.reverse();
    }

    if (this.closeList.indexOf(node) <= -1) {
      let routeNode = node;
      if (node.d === undefined) routeNode = new RouteNode(node);
      this.closeList.push(routeNode);
      this.closeListListeners.forEach(cb => cb(routeNode));
      this.populateOpenList(routeNode);
    }

    return this.findRoute();
  }

  isUnknowNode(x, y) {
    return this.closeList.filter(routeNode => routeNode.x === x && routeNode.y === y).length === 0
      && this.openList.filter(routeNode => routeNode.x === x && routeNode.y === y).length === 0;
  }

  neighbors(node) {
    let res = [];
    const { x, y } = node;

    // top
    if (y-1 >= 0 && this.matrix[x] && this.matrix[x][y-1] === TileTypes.EMPTY && this.isUnknowNode(x, y-1)) {
      res.push({ x, y: y-1 });
    }
    // right
    if (x+1 < this.width && this.matrix[x+1] && this.matrix[x+1][y] === TileTypes.EMPTY && this.isUnknowNode(x+1, y)) {
      res.push({ x: x+1, y });
    }
    // bottom
    if (y+1 < this.height && this.matrix[x] && this.matrix[x][y+1] === TileTypes.EMPTY && this.isUnknowNode(x, y+1)) {
      res.push({ x, y: y+1 });
    }
    // left
    if (x-1 >= 0 && this.matrix[x-1] && this.matrix[x-1][y] === TileTypes.EMPTY && this.isUnknowNode(x-1, y)) {
      res.push({ x: x-1, y });
    }

    return res;
  }

  populateOpenList(parentNode) {
    let ns = this.neighbors(parentNode);

    if (ns <= 0) {
      console.warn('No more neigbhors.');
      console.warn('requested parent: ', parentNode);
      console.warn('closeList: ', this.closeList);
      return;
    }

    ns = ns.map(node => {
      let routeNode = new RouteNode(node, parentNode);
      // linear distance from start to reach this point
      routeNode.d += Utils.manhattan(node, parentNode);
      // remaining distance
      const l2 = Utils.manhattan(node, this.goal);
      routeNode.dPlusL2 = routeNode.d + l2;
      return routeNode;
    });
    // classer open list
    this.openList.push(...ns);
    this.closeListListeners.forEach(cb => cb(ns));
    //this.openList = this.openList.sort((prev, curr) => prev.dPlusL2 - curr.dPlusL2);
    this.openList = this.openList.sort((prev, curr) => {
      if (prev.dPlusL2 < curr.dPlusL2) {
        return -1;
      } else if (prev.dPlusL2 > curr.dPlusL2) {
        return 1;
      } else { // keyA == keyB
        if (prev.d > curr.d) {
          return -1;
        } else if (prev.d < curr.d) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  export() {
    let res = [ ...this.matrix ];
    res[this.start.x][this.start.y] = TileTypes.START;
    res[this.goal.x][this.goal.y] = TileTypes.GOAL;
    return this.arrayRowsIntoColumns(res);
  }

}
