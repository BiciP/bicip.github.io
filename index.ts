class Maze {
    canvas: HTMLElement;
    nodes: object = {};
    startNode: string;
    endNode: string;
    width: number;
    height: number;
    nodeSize: number = 35;
    mouseDown: Boolean = false;
    movingStartNode: any;
    movingEndNode: any;
    algorithm: object = {
        astar: AStar,
        dijkstra: Dijkstra,
    };
    weightElem: HTMLElement;

    constructor() {
        const _this = this;
        this.canvas = document.getElementById('maze-canvas');
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(_this)); // Sets mouseDown to false
        this.initiateMaze();
    }

    initiateMaze() {
        this.height = Math.floor(this.canvas.parentElement.clientHeight/this.nodeSize);
        this.width = Math.floor(this.canvas.parentElement.clientWidth/this.nodeSize);

        for (let y=0; y<this.height; y++) {
            const row = document.createElement('tr');

            for (let x=0; x<this.width; x++) {
                const nodeId = `${x}_${y}`;
                const cell = this.createCell(nodeId);
                this.nodes[nodeId] = 1;
                row.appendChild(cell);
            }

            this.canvas.appendChild(row);
        }

        this.declareStartingNode();
        this.declareEndingNode();
    }

    declareStartingNode() {
        this.startNode = `0_0`;
        const node = this.getNodeElement(this.startNode);
        node.setAttribute('type', 'start');
    }

    declareEndingNode() {
        this.endNode = `${this.width-1}_${this.height-1}`;
        const node = this.getNodeElement(this.endNode);
        node.setAttribute('type', 'end');
    }

    createCell(id: string) {
        const td = document.createElement('td');
        const span = document.createElement('span');
        const _this = this;

        span.classList.add('node-span');

        td.setAttribute('nodeId', id);
        td.setAttribute('type', 'unknown');
        td.classList.value = 'maze-node';
        td.addEventListener('mousedown', this.onMouseDown.bind(_this));
        td.addEventListener('mouseup', this.onMouseUp.bind(_this));
        td.addEventListener('mouseenter', this.onMouseEnter.bind(_this));
        td.appendChild(span);

        return td;
    }

    onMouseDown(e: any) {
        this.mouseDown = true;

        const elem: HTMLTableDataCellElement = e.currentTarget;
        const id: string = elem.getAttribute('nodeid');
        if (id !== this.startNode && id !== this.endNode) {
            this.changeNode(id);
        } else if (id === this.startNode) {
            this.movingStartNode = id;
        } else if (id === this.endNode) {
            this.movingEndNode = id;
        }
    }

    onMouseUp(e: Event) {
        this.mouseDown = false;
        this.movingStartNode = false;
        this.movingEndNode = false;
    }

    onMouseEnter(e: any) {
        this.weightElem = e.currentTarget;
        const elem: HTMLTableDataCellElement = e.currentTarget; 
        if (this.mouseDown) {

            const id: string = elem.getAttribute('nodeid');

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
    }

    changeNode(id: string, newType: string = null, newTypeVal: number = 0) {
        const elem = this.getNodeElement(id);
        if (!newType) {
            if (elem.getAttribute('type') === 'wall') {
                elem.setAttribute('type', 'unknown');
                this.nodes[id] = 1;
            } else {
                elem.setAttribute('type', 'wall');
                this.nodes[id] = 0;
            }
        } else {
            elem.setAttribute('type', newType);
            this.nodes[id] = newTypeVal;
        }
    }

    getNodeElement(id: string) {
        return document.querySelector(`[nodeid="${id}"]`);
    }
}

/**
 * Maze node superclass
 */
class MazeNode {
    x: number;
    y: number;
    id: string;
    parent: string;

    constructor(id: string, parent: string) {
        this.id = id;
        this.x = parseInt(id.split("_")[0]);
        this.y = parseInt(id.split("_")[1]);
        this.parent = parent;
    }
}

/**
 * Dijkstra node
 */
class DijkstraNode extends MazeNode {
    g: number;

    constructor(id: string, parent: string, g: number) {
        super(id, parent);
        this.g = g;
    }
}

/**
 * A* Node for A* algorithm
 */
class AStarNode extends MazeNode {
    h: number;
    g: number;
    f: number;
    parent: string;

    constructor(id: string, g: number, h: number, parent: string) {
        super(id, parent);
        this.g = g;
        this.h = h;
        this.f = this.g + this.h;
    }
}

/**
 * Algorithm superclass
 */

class Algorithm {
    maze: object;
    startNode: any;
    endNode: any;
    steps: Array<object> = [];
    ttc: number;
    pathLength: number = 0;

    constructor(maze: object, start: any, end: any) {
        this.maze = maze;
        this.startNode = start;
        this.endNode = end;
    }

    start() {
        throw new Error('This algorithm does not have a start method.');
    }

    getNodeNeighbours(node: any) {
        const ids: Array<string> = [
            `${node.x+1}_${node.y}`,
            `${node.x-1}_${node.y}`,
            `${node.x}_${node.y+1}`,
            `${node.x}_${node.y-1}`,
        ];

        const neighbours: Array<any> = [];

        for (const id of ids) {
            if (!this.isValidId(id)) continue;
            neighbours.push(new MazeNode(id, node.id));
        }

        return neighbours;
    }

    isValidId(id) {
        if (this.maze[id]) return true;
        return false;
    }

    visitNode(node: any) {
        this.steps.push({ id: node.id, type: 'visited' });
    }

    seeNode(node: any) {
        this.steps.push({ id: node.id, type: 'seen' });
    }
}

class Dijkstra extends Algorithm {
    closed: object = {};
    open: object = {};

    constructor(maze: object, start: string, end: string) {
        super(maze, start, end);
    }

    start() {
        this.ttc = Date.now();

        // Initialize the closed list
        for (const nodeId in this.maze) {
            if (this.maze.hasOwnProperty(nodeId)) {
                this.closed[nodeId] = new DijkstraNode(nodeId, null, Infinity);
            }
        }

        this.closed[this.startNode].g = 0;
        this.open[this.startNode] = this.closed[this.startNode];

        while(Object.keys(this.open).length > 0) {
            const Q: DijkstraNode = this.findBestNode();
            delete this.open[Q.id];

            // Loop through Q's neighbours
            for (const node of this.getNodeNeighbours(Q)) {
                if (node.id === this.endNode) {
                    // We found the end.. Wrap it up
                    node.parent = Q.id;
                    this.ttc = Date.now() - this.ttc;
                    this.finish();
                    return this.steps;
                } else if (node.g === Infinity) {
                    node.parent = Q.id;
                    node.g = Q.g + this.maze[node.id];
                    this.open[node.id] = node;
                }
            }
        }

        this.ttc = Date.now() - this.ttc;
        return this.steps;
    }

    finish() {
        let id = this.endNode;
        let path = [];

        do {
            const node = this.closed[id];
            this.pathLength += this.maze[id];
            path.push({ id: id, type: 'path' });
            id = node.parent;
        } while (id);

        path = path.reverse();
        this.steps = this.steps.concat(path);
    }

    getNodeNeighbours(node: any) {
        const ids: Array<string> = [
            `${node.x+1}_${node.y}`,
            `${node.x-1}_${node.y}`,
            `${node.x}_${node.y+1}`,
            `${node.x}_${node.y-1}`,
        ];

        const neighbours: Array<any> = [];

        for (const id of ids) {
            if (!this.isValidId(id)) continue;
            neighbours.push(this.closed[id]);
        }

        return neighbours;
    }

    findBestNode() {
        let minValue: number = Infinity;
        let minNode: DijkstraNode = null;

        for (const id in this.open) {
            if (!this.open.hasOwnProperty(id)) throw new Error(`Element with ID ${id} is not in the open list.`);
            
            const node = this.open[id];
            if (node.g > minValue) continue;

            minValue = node.g;
            minNode = node;
        }

        this.visitNode(minNode);
        return minNode;
    }

    visitNode(node: DijkstraNode) {
        this.closed[node.id] = node;
        this.steps.push({id: node.id, type: 'visited'});
    }
}

class AStar extends Algorithm {
    startNode: AStarNode;
    endNode: AStarNode;
    maze: object;
    open: object = {};
    closed: object = {};
    ttc: number; // Time To Complete

    constructor(maze: object, start: string, end: string) {
        super(maze, start, end);
        this.endNode = new AStarNode(end, 1, 0, null);
        this.startNode = new AStarNode(start, 0, 0, null);
    }

    start() {
        this.ttc = Date.now();

        // Initiate the closed list
        for (const nodeid of Object.keys(this.maze)) {
            this.closed[nodeid] = false;
        }

        // Add start node to the open list
        this.open[this.startNode.id] = this.startNode;

        // Loop through open list
        while (Object.keys(this.open).length > 0) {
            const q: AStarNode = this.findBestNode();
            delete this.open[q.id];

            for (const n of this.getNodeNeighbours(q)) {
                if (n.id === this.endNode.id) {
                    // We're finished here...
                    this.visitNode(n);
                    // Before we return we have to add the path steps aswell
                    this.ttc = Date.now() - this.ttc;
                    this.finish();
                    return this.steps;
                } else if (this.open[n.id] && this.open[n.id].f < n.f) {
                    // We've seen this node...
                    this.seeNode(n);
                } else if (!this.closed[n.id] || this.closed[n.id].f > n.f) {
                    // We've seen the node and added it to open list
                    this.seeNode(n);
                    this.open[n.id] = n;
                }
            } 
        }

        this.ttc = Date.now() - this.ttc;
        return this.steps;
    }

    finish() {
        let id = this.endNode.id;
        let path = [];

        do {
            const node = this.closed[id];
            this.pathLength += this.maze[id];
            path.push({ id: id, type: 'path' });
            id = node.parent;
        } while (id);

        path = path.reverse();
        this.steps = this.steps.concat(path);
    }

    findBestNode() {
        const bestNode = {
            bestF: Infinity,
            bestH: Infinity,
            node: null,
        };

        for (const id in this.open) {
            const node = this.open[id];
            if (node.f < bestNode.bestF || // F is lower
               (node.f === bestNode.bestF && node.h <= bestNode.bestH)) { // or F is equal and H is lower
                bestNode.bestF = node.f;
                bestNode.bestH = node.h;
                bestNode.node = node;
            }
        }

        this.visitNode(bestNode.node);
        return bestNode.node;
    }

    getNodeNeighbours(node: AStarNode) {
        const ids: Array<string> = [
            `${node.x+1}_${node.y}`,
            `${node.x-1}_${node.y}`,
            `${node.x}_${node.y+1}`,
            `${node.x}_${node.y-1}`,
        ];

        const neighbours: Array<AStarNode> = [];

        for (const id of ids) {
            if (!this.isValidId(id)) continue;
            neighbours.push(new AStarNode(id, node.g + this.maze[id], this.getHeuristic(id), node.id));
        }

        return neighbours;
    }

    getHeuristic(id: string) {
        const x: number = parseInt(id.split("_")[0]);
        const y: number = parseInt(id.split("_")[1]);

        return Math.abs(this.endNode.x - x) + Math.abs(this.endNode.y - y);
    }

    visitNode(node: any) {
        this.closed[node.id] = node;
        this.steps.push({ id: node.id, type: 'visited' });
    }
}

window.onload = () => {
    const maze: Maze = new Maze();
    const start: HTMLElement = document.getElementById('start-btn');
    const clear: HTMLElement = document.getElementById('clear-btn');
    const genWeightsBtn: HTMLElement = document.getElementById('genWeights-btn');
    const clearWeightsBtn: HTMLElement = document.getElementById('clearWeights-btn');
    const clearWallsBtn: HTMLElement = document.getElementById('clearWalls-btn');
    const ttcParagraph: HTMLElement = document.getElementById('ttc');
    const pathLengthPara: HTMLElement = document.getElementById('path-length');
    const algInfo: any = document.getElementsByClassName('algorithm-info')[0];

    start.addEventListener('click', visualize);
    clear.addEventListener('click', clearCanvas);
    genWeightsBtn.addEventListener('click', generateWeights);
    clearWeightsBtn.addEventListener('click', clearWeights);
    clearWallsBtn.addEventListener('click', clearWalls);

    function clearCanvas() {
        const nodes = document.getElementsByClassName('maze-node');
        for (let i=0; i<nodes.length; i++) {
            const type = nodes[i].getAttribute('type');
            if (['start', 'end', 'wall'].indexOf(type) === -1) {
                nodes[i].setAttribute('type', 'unknown');
            }
        }
    }

    function visualize() {
        clearCanvas();
        const SA: any = document.getElementById('selected-algorithm');
        let speed: any = document.getElementById('anim-speed');
        speed = parseInt(speed.value);
        const alg: any = new maze.algorithm[SA.value](maze.nodes, maze.startNode, maze.endNode);
        const steps: Array<object> = alg.start();
        console.log(alg.ttc + 'ms');
        console.log('Path length: ' + alg.pathLength);
        ttcParagraph.textContent = alg.ttc;
        pathLengthPara.textContent = alg.pathLength;
        algInfo.style.display = 'flex';
        steps.forEach(animate(showStep, speed));
    }

    function generateWeights() {
        for (const id in maze.nodes) {
            if (id === maze.startNode || id === maze.endNode || !maze.nodes[id]) continue;
            const weight: number = Math.floor(Math.random() * 9) + 1;
            const node: HTMLElement = document.querySelector(`[nodeid="${id}"]`);
            const span: HTMLElement = node.getElementsByTagName('span')[0];
            maze.nodes[id] = weight;
            span.textContent = weight === 1 ? '' : `${weight}`;
        }
    }

    function clearWeights() {
        for (const id in maze.nodes) {
            if (maze.nodes[id]) {
                const node: HTMLElement = document.querySelector(`[nodeid="${id}"]`);
                const span: HTMLElement = node.getElementsByTagName('span')[0];
                maze.nodes[id] = 1;
                span.textContent = '';
            }
        }
    }

    function clearWalls() {
        for (const id in maze.nodes) {
            if (!maze.nodes[id]) {
                const node: HTMLElement = document.querySelector(`[nodeid="${id}"]`);
                node.setAttribute('type', 'unknown');
                maze.nodes[id] = 1;
            }
        }
    }

    /* Listen for weight pressed */
    document.addEventListener('keypress', (e: any) => {
        if (isNaN(e.key) || e.key === "0") return;       
        const nodeId: string = maze.weightElem.getAttribute('nodeid');
        maze.nodes[nodeId] = parseInt(e.key);
        maze.weightElem.getElementsByTagName('span')[0].textContent = e.key === "1" ? '' : e.key;
    });
};

function showStep(step: any) {
    const node: HTMLElement = document.querySelector(`[nodeid="${step.id}"]`);
    const type: string = node.getAttribute('type');
    if (!(type === 'start' ||  type === 'end')) {
        const span = node.getElementsByTagName('span')[0];
        const clone: any = span.cloneNode(true);
        span.parentElement.replaceChild(clone, span);
        node.setAttribute('type', step.type);
    }
}

function animate(fn: Function, delay: number) {
    return (x: any, i: number) => {
        setTimeout(() => {
            fn(x);
        }, i * delay);
    };
}