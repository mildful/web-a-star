class Utils {

  static manhattan(pos1, pos2) {
    var d1 = Math.abs (pos1.x - pos2.x);
    var d2 = Math.abs (pos1.y - pos2.y);
    return d1 + d2;
  }

  static timer() {
    const start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            return time;
        }
    };
  }

}
