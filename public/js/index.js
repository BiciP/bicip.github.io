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
            dijkstra: Dijkstra,
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
        this.weightElem = e.currentTarget;
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
    function MazeNode(id, parent) {
        this.id = id;
        this.x = parseInt(id.split("_")[0]);
        this.y = parseInt(id.split("_")[1]);
        this.parent = parent;
    }
    return MazeNode;
}());
/**
 * Dijkstra node
 */
var DijkstraNode = /** @class */ (function (_super) {
    __extends(DijkstraNode, _super);
    function DijkstraNode(id, parent, g) {
        var _this_1 = _super.call(this, id, parent) || this;
        _this_1.g = g;
        return _this_1;
    }
    return DijkstraNode;
}(MazeNode));
/**
 * A* Node for A* algorithm
 */
var AStarNode = /** @class */ (function (_super) {
    __extends(AStarNode, _super);
    function AStarNode(id, g, h, parent) {
        var _this_1 = _super.call(this, id, parent) || this;
        _this_1.g = g;
        _this_1.h = h;
        _this_1.f = _this_1.g + _this_1.h;
        return _this_1;
    }
    return AStarNode;
}(MazeNode));
/**
 * Algorithm superclass
 */
var Algorithm = /** @class */ (function () {
    function Algorithm(maze, start, end) {
        this.steps = [];
        this.pathLength = 0;
        this.maze = maze;
        this.startNode = start;
        this.endNode = end;
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
            neighbours.push(new MazeNode(id, node.id));
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
var Dijkstra = /** @class */ (function (_super) {
    __extends(Dijkstra, _super);
    function Dijkstra(maze, start, end) {
        var _this_1 = _super.call(this, maze, start, end) || this;
        _this_1.closed = {};
        _this_1.open = {};
        return _this_1;
    }
    Dijkstra.prototype.start = function () {
        this.ttc = Date.now();
        // Initialize the closed list
        for (var nodeId in this.maze) {
            if (this.maze.hasOwnProperty(nodeId)) {
                this.closed[nodeId] = new DijkstraNode(nodeId, null, Infinity);
            }
        }
        this.closed[this.startNode].g = 0;
        this.open[this.startNode] = this.closed[this.startNode];
        while (Object.keys(this.open).length > 0) {
            var Q = this.findBestNode();
            delete this.open[Q.id];
            // Loop through Q's neighbours
            for (var _i = 0, _a = this.getNodeNeighbours(Q); _i < _a.length; _i++) {
                var node = _a[_i];
                if (node.id === this.endNode) {
                    // We found the end.. Wrap it up
                    node.parent = Q.id;
                    this.ttc = Date.now() - this.ttc;
                    this.finish();
                    return this.steps;
                }
                else if (node.g === Infinity) {
                    node.parent = Q.id;
                    node.g = Q.g + this.maze[node.id];
                    this.open[node.id] = node;
                }
            }
        }
        this.ttc = Date.now() - this.ttc;
        return this.steps;
    };
    Dijkstra.prototype.finish = function () {
        var id = this.endNode;
        var path = [];
        do {
            var node = this.closed[id];
            this.pathLength += this.maze[id];
            path.push({ id: id, type: 'path' });
            id = node.parent;
        } while (id);
        path = path.reverse();
        this.steps = this.steps.concat(path);
    };
    Dijkstra.prototype.getNodeNeighbours = function (node) {
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
            neighbours.push(this.closed[id]);
        }
        return neighbours;
    };
    Dijkstra.prototype.findBestNode = function () {
        var minValue = Infinity;
        var minNode = null;
        for (var id in this.open) {
            if (!this.open.hasOwnProperty(id))
                throw new Error("Element with ID " + id + " is not in the open list.");
            var node = this.open[id];
            if (node.g > minValue)
                continue;
            minValue = node.g;
            minNode = node;
        }
        this.visitNode(minNode);
        return minNode;
    };
    Dijkstra.prototype.visitNode = function (node) {
        this.closed[node.id] = node;
        this.steps.push({ id: node.id, type: 'visited' });
    };
    return Dijkstra;
}(Algorithm));
var AStar = /** @class */ (function (_super) {
    __extends(AStar, _super);
    function AStar(maze, start, end) {
        var _this_1 = _super.call(this, maze, start, end) || this;
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
            this.pathLength += this.maze[id];
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
        for (var id in this.open) {
            var node = this.open[id];
            if (node.f < bestNode.bestF || // F is lower
                (node.f === bestNode.bestF && node.h <= bestNode.bestH)) { // or F is equal and H is lower
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
        for (var _i = 0, ids_3 = ids; _i < ids_3.length; _i++) {
            var id = ids_3[_i];
            if (!this.isValidId(id))
                continue;
            neighbours.push(new AStarNode(id, node.g + this.maze[id], this.getHeuristic(id), node.id));
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
    var clear = document.getElementById('clear-btn');
    var genWeightsBtn = document.getElementById('genWeights-btn');
    var clearWeightsBtn = document.getElementById('clearWeights-btn');
    var clearWallsBtn = document.getElementById('clearWalls-btn');
    var ttcParagraph = document.getElementById('ttc');
    var pathLengthPara = document.getElementById('path-length');
    var algInfo = document.getElementsByClassName('algorithm-info')[0];
    start.addEventListener('click', visualize);
    clear.addEventListener('click', clearCanvas);
    genWeightsBtn.addEventListener('click', generateWeights);
    clearWeightsBtn.addEventListener('click', clearWeights);
    clearWallsBtn.addEventListener('click', clearWalls);
    function clearCanvas() {
        var nodes = document.getElementsByClassName('maze-node');
        for (var i = 0; i < nodes.length; i++) {
            var type = nodes[i].getAttribute('type');
            if (['start', 'end', 'wall'].indexOf(type) === -1) {
                nodes[i].setAttribute('type', 'unknown');
            }
        }
    }
    function visualize() {
        clearCanvas();
        var SA = document.getElementById('selected-algorithm');
        var speed = document.getElementById('anim-speed');
        speed = parseInt(speed.value);
        var alg = new maze.algorithm[SA.value](maze.nodes, maze.startNode, maze.endNode);
        var steps = alg.start();
        console.log(alg.ttc + 'ms');
        console.log('Path length: ' + alg.pathLength);
        ttcParagraph.textContent = alg.ttc;
        pathLengthPara.textContent = alg.pathLength;
        algInfo.style.display = 'flex';
        steps.forEach(animate(showStep, speed));
    }
    function generateWeights() {
        for (var id in maze.nodes) {
            if (id === maze.startNode || id === maze.endNode || !maze.nodes[id])
                continue;
            var weight = Math.floor(Math.random() * 9) + 1;
            var node = document.querySelector("[nodeid=\"" + id + "\"]");
            var span = node.getElementsByTagName('span')[0];
            maze.nodes[id] = weight;
            span.textContent = weight === 1 ? '' : "" + weight;
        }
    }
    function clearWeights() {
        for (var id in maze.nodes) {
            if (maze.nodes[id]) {
                var node = document.querySelector("[nodeid=\"" + id + "\"]");
                var span = node.getElementsByTagName('span')[0];
                maze.nodes[id] = 1;
                span.textContent = '';
            }
        }
    }
    function clearWalls() {
        for (var id in maze.nodes) {
            if (!maze.nodes[id]) {
                var node = document.querySelector("[nodeid=\"" + id + "\"]");
                node.setAttribute('type', 'unknown');
                maze.nodes[id] = 1;
            }
        }
    }
    /* Listen for weight pressed */
    document.addEventListener('keypress', function (e) {
        if (isNaN(e.key) || e.key === "0")
            return;
        var nodeId = maze.weightElem.getAttribute('nodeid');
        maze.nodes[nodeId] = parseInt(e.key);
        maze.weightElem.getElementsByTagName('span')[0].textContent = e.key === "1" ? '' : e.key;
    });
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
