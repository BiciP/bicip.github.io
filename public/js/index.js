var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Maze = /** @class */ (function () {
    function Maze() {
        this.nodes = {};
        this.nodeSize = 35;
        this.mouseDown = false;
        this.algorithm = {
            astar: AStar,
        };
        var _this = this;
        this.canvas = document.getElementById('maze-canvas');
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(_this)); // Sets mouseDown to false
        this.initiateMaze();
    }
    Maze.prototype.initiateMaze = function () {
        this.height = Math.floor(this.canvas.parentElement.clientHeight / this.nodeSize);
        this.width = Math.floor(this.canvas.parentElement.clientWidth / this.nodeSize);
        for (var y = 0; y < this.height; y++) {
            var row = document.createElement('tr');
            for (var x = 0; x < this.width; x++) {
                var nodeId = x + "_" + y;
                var cell = this.createCell(nodeId);
                this.nodes[nodeId] = 1;
                row.appendChild(cell);
            }
            this.canvas.appendChild(row);
        }
        this.declareStartingNode();
        this.declareEndingNode();
    };
    Maze.prototype.declareStartingNode = function () {
        this.startNode = "0_0";
        var node = this.getNodeElement(this.startNode);
        node.setAttribute('type', 'start');
    };
    Maze.prototype.declareEndingNode = function () {
        this.endNode = this.width - 1 + "_" + (this.height - 1);
        var node = this.getNodeElement(this.endNode);
        node.setAttribute('type', 'end');
    };
    Maze.prototype.createCell = function (id) {
        var td = document.createElement('td');
        var span = document.createElement('span');
        var _this = this;
        span.classList.add('node-span');
        td.setAttribute('nodeId', id);
        td.setAttribute('type', 'unknown');
        td.classList.value = 'maze-node';
        td.addEventListener('mousedown', this.onMouseDown.bind(_this));
        td.addEventListener('mouseup', this.onMouseUp.bind(_this));
        td.addEventListener('mouseenter', this.onMouseEnter.bind(_this));
        td.appendChild(span);
        return td;
    };
    Maze.prototype.onMouseDown = function (e) {
        this.mouseDown = true;
        var elem = e.currentTarget;
        var id = elem.getAttribute('nodeid');
        if (id !== this.startNode && id !== this.endNode) {
            this.changeNode(id);
        }
        else if (id === this.startNode) {
            this.movingStartNode = id;
        }
        else if (id === this.endNode) {
            this.movingEndNode = id;
        }
    };
    Maze.prototype.onMouseUp = function (e) {
        this.mouseDown = false;
        this.movingStartNode = false;
        this.movingEndNode = false;
    };
    Maze.prototype.onMouseEnter = function (e) {
        var elem = e.currentTarget;
        if (this.mouseDown) {
            var id = elem.getAttribute('nodeid');
            if (this.movingStartNode) {
                this.changeNode(this.movingStartNode, 'unknown', 1);
                this.changeNode(id, 'start', 1);
                this.startNode = id;
                this.movingStartNode = id;
                return;
            }
            if (this.movingEndNode) {
                this.changeNode(this.movingEndNode, 'unknown', 1);
                this.changeNode(id, 'end', 1);
                this.endNode = id;
                this.movingEndNode = id;
                return;
            }
            if (id !== this.startNode && id !== this.endNode) {
                /* Change the nodes... */
                this.changeNode(id);
            }
        }
    };
    Maze.prototype.changeNode = function (id, newType, newTypeVal) {
        if (newType === void 0) { newType = null; }
        if (newTypeVal === void 0) { newTypeVal = 0; }
        var elem = this.getNodeElement(id);
        if (!newType) {
            if (elem.getAttribute('type') === 'wall') {
                elem.setAttribute('type', 'unknown');
                this.nodes[id] = 1;
            }
            else {
                elem.setAttribute('type', 'wall');
                this.nodes[id] = 0;
            }
        }
        else {
            elem.setAttribute('type', newType);
            this.nodes[id] = newTypeVal;
        }
    };
    Maze.prototype.getNodeElement = function (id) {
        return document.querySelector("[nodeid=\"" + id + "\"]");
    };
    return Maze;
}());
/**
 * Maze node superclass
 */
var MazeNode = /** @class */ (function () {
    function MazeNode(id) {
        this.id = id;
        this.x = parseInt(id.split("_")[0]);
        this.y = parseInt(id.split("_")[1]);
    }
    return MazeNode;
}());
/**
 * A* Node for A* algorithm
 */
var AStarNode = /** @class */ (function (_super) {
    __extends(AStarNode, _super);
    function AStarNode(id, g, h, parent) {
        var _this_1 = _super.call(this, id) || this;
        _this_1.g = g;
        _this_1.h = h;
        _this_1.f = _this_1.g + _this_1.h;
        _this_1.parent = parent;
        return _this_1;
    }
    return AStarNode;
}(MazeNode));
/**
 * Algorithm superclass
 */
var Algorithm = /** @class */ (function () {
    function Algorithm(maze, start) {
        this.steps = [];
        this.maze = maze;
        this.startNode = start;
    }
    Algorithm.prototype.start = function () {
        throw new Error('This algorithm does not have a start method.');
    };
    Algorithm.prototype.getNodeNeighbours = function (node) {
        var ids = [
            node.x + 1 + "_" + node.y,
            node.x - 1 + "_" + node.y,
            node.x + "_" + (node.y + 1),
            node.x + "_" + (node.y - 1),
        ];
        var neighbours = [];
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            if (!this.isValidId(id))
                continue;
            neighbours.push(new MazeNode(id));
        }
        return neighbours;
    };
    Algorithm.prototype.isValidId = function (id) {
        if (this.maze[id])
            return true;
        return false;
    };
    Algorithm.prototype.visitNode = function (node) {
        this.steps.push({ id: node.id, type: 'visited' });
    };
    Algorithm.prototype.seeNode = function (node) {
        this.steps.push({ id: node.id, type: 'seen' });
    };
    return Algorithm;
}());
var AStar = /** @class */ (function (_super) {
    __extends(AStar, _super);
    function AStar(maze, start, end) {
        var _this_1 = _super.call(this, maze, start) || this;
        _this_1.open = {};
        _this_1.closed = {};
        _this_1.endNode = new AStarNode(end, 1, 0, null);
        _this_1.startNode = new AStarNode(start, 0, 0, null);
        return _this_1;
    }
    AStar.prototype.start = function () {
        this.ttc = Date.now();
        // Initiate the closed list
        for (var _i = 0, _a = Object.keys(this.maze); _i < _a.length; _i++) {
            var nodeid = _a[_i];
            this.closed[nodeid] = false;
        }
        // Add start node to the open list
        this.open[this.startNode.id] = this.startNode;
        // Loop through open list
        while (Object.keys(this.open).length > 0) {
            var q = this.findBestNode();
            delete this.open[q.id];
            for (var _b = 0, _c = this.getNodeNeighbours(q); _b < _c.length; _b++) {
                var n = _c[_b];
                if (n.id === this.endNode.id) {
                    // We're finished here...
                    this.visitNode(n);
                    // Before we return we have to add the path steps aswell
                    this.ttc = Date.now() - this.ttc;
                    this.finish();
                    return this.steps;
                }
                else if (this.open[n.id] && this.open[n.id].f < n.f) {
                    // We've seen this node...
                    this.seeNode(n);
                }
                else if (!this.closed[n.id] || this.closed[n.id].f > n.f) {
                    // We've seen the node and added it to open list
                    this.seeNode(n);
                    this.open[n.id] = n;
                }
            }
        }
        this.ttc = Date.now() - this.ttc;
        return this.steps;
    };
    AStar.prototype.finish = function () {
        var id = this.endNode.id;
        var path = [];
        do {
            var node = this.closed[id];
            path.push({ id: id, type: 'path' });
            id = node.parent;
        } while (id);
        path = path.reverse();
        this.steps = this.steps.concat(path);
    };
    AStar.prototype.findBestNode = function () {
        var bestNode = {
            bestF: Infinity,
            bestH: Infinity,
            node: null,
        };
        for (var _i = 0, _a = Object.keys(this.open); _i < _a.length; _i++) {
            var id = _a[_i];
            var node = this.open[id];
            if (node.f < bestNode.bestF || // F is lower
                (node.f === bestNode.bestF && node.h < bestNode.bestH)) { // or F is equal and H is lower
                bestNode.bestF = node.f;
                bestNode.bestH = node.h;
                bestNode.node = node;
            }
        }
        this.visitNode(bestNode.node);
        return bestNode.node;
    };
    AStar.prototype.getNodeNeighbours = function (node) {
        var ids = [
            node.x + 1 + "_" + node.y,
            node.x - 1 + "_" + node.y,
            node.x + "_" + (node.y + 1),
            node.x + "_" + (node.y - 1),
        ];
        var neighbours = [];
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            if (!this.isValidId(id))
                continue;
            neighbours.push(new AStarNode(id, node.g + 1, this.getHeuristic(id), node.id));
        }
        return neighbours;
    };
    AStar.prototype.getHeuristic = function (id) {
        var x = parseInt(id.split("_")[0]);
        var y = parseInt(id.split("_")[1]);
        return Math.abs(this.endNode.x - x) + Math.abs(this.endNode.y - y);
    };
    AStar.prototype.visitNode = function (node) {
        this.closed[node.id] = node;
        this.steps.push({ id: node.id, type: 'visited' });
    };
    return AStar;
}(Algorithm));
window.onload = function () {
    var maze = new Maze();
    var start = document.getElementById('start-btn');
    start.addEventListener('click', visualize);
    function visualize(e) {
        var SA = document.getElementById('selected-algorithm');
        var alg = new maze.algorithm[SA.value](maze.nodes, maze.startNode, maze.endNode);
        var steps = alg.start();
        console.log(alg.ttc + 'ms');
        steps.forEach(animate(showStep, 50));
    }
};
function showStep(step) {
    var node = document.querySelector("[nodeid=\"" + step.id + "\"]");
    var type = node.getAttribute('type');
    if (!(type === 'start' || type === 'end')) {
        var span = node.getElementsByTagName('span')[0];
        var clone = span.cloneNode(true);
        span.parentElement.replaceChild(clone, span);
        node.setAttribute('type', step.type);
    }
}
function animate(fn, delay) {
    return function (x, i) {
        setTimeout(function () {
            fn(x);
        }, i * delay);
    };
}
