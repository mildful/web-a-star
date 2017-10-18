class RouteNode extends Node {

  constructor(node, parentRouteNode) {
    super(node.x, node.y);
    this.parent = parentRouteNode || null;
    this.d = parentRouteNode ? parentRouteNode.d : 0;
    this.dPlusL2 = null;
  }

}
