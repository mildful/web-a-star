class Renderer {

  constructor(canvas, tileSize) {
    this.tileSize = tileSize || 40;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(xCount, yCount) {
    this.canvas.width = xCount * this.tileSize + 1;
    this.canvas.height = yCount * this.tileSize + 1;

    // vertical lines
    for (let x = 0; x <= this.canvas.width; x += this.tileSize) {
        this.ctx.moveTo(0.5 + x, 0);
        this.ctx.lineTo(0.5 + x, this.canvas.height);
    }

    // horizontal lines
    for (let y = 0; y <= this.canvas.height; y += this.tileSize) {
        this.ctx.moveTo(0, 0.5 + y);
        this.ctx.lineTo(this.canvas.width, 0.5 + y);
    }

    this.ctx.strokeStyle = '#a6a6a6';
    this.ctx.stroke();
  }

  setColor(color, tile) {
    const x = tile.x * this.tileSize;
    const y = tile.y * this.tileSize;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x+1, y+1, this.tileSize-1, this.tileSize-1);
  }

  path(path) {
    const first = this.getPixelPosFromTilePos(path.shift());
    this.ctx.moveTo(first.x, first.y);

    this.ctx.beginPath();

    let prevPath = null;
    let flyMode = false;
    path.forEach((pos, i) => {
      const {x, y} = this.getPixelPosFromTilePos(pos);

      if (!flyMode && prevPath && Utils.manhattan({x, y}, prevPath) > this.tileSize) {
        flyMode = true;
        // close old path (*NO* FLY MODE PATH)
        this.ctx.strokeStyle = 'green';
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(prevPath.x, prevPath.y);
      }
      if (flyMode && prevPath && Utils.manhattan({x, y}, prevPath) <= this.tileSize) {
        flyMode = false;
        // close old path (FLY MODE PATH)
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(prevPath.x, prevPath.y);
      }

      this.ctx.lineTo(x, y);
      prevPath = {x, y};
    });

    this.ctx.strokeStyle = flyMode ? 'red' : 'green';
    this.ctx.stroke();
  }

  getPixelPosFromTilePos(pos) {
    return {
      x: (pos.x * this.tileSize) + (this.tileSize / 2),
      y: (pos.y * this.tileSize) + (this.tileSize / 2)
    };
  }

}
