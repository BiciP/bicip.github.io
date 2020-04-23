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
    };

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

    constructor(id: string) {
        this.id = id;
        this.x = parseInt(id.split("_")[0]);
        this.y = parseInt(id.split("_")[1]);
    }
}

/**
 * A* Node for A* algorithm
 */
class AStarNode extends MazeNode {
    id: string;
    x: number;
    y: number;
    h: number;
    g: number;
    f: number;
    parent: string;

    constructor(id: string, g: number, h: number, parent: string) {
        super(id);
        this.g = g;
        this.h = h;
        this.f = this.g + this.h;
        this.parent = parent;
    }
}

/**
 * Algorithm superclass
 */

class Algorithm {
    maze: object;
    startNode: any;
    steps: Array<object> = [];

    constructor(maze: object, start: any) {
        this.maze = maze;
        this.startNode = start;
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
            neighbours.push(new MazeNode(id));
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

class AStar extends Algorithm {
    startNode: AStarNode;
    endNode: AStarNode;
    maze: object;
    open: object = {};
    closed: object = {};
    ttc: number; // Time To Complete

    constructor(maze: object, start: string, end: string) {
        super(maze, start);
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

        for (const id of Object.keys(this.open)) {
            const node = this.open[id];
            if (node.f < bestNode.bestF || // F is lower
               (node.f === bestNode.bestF && node.h < bestNode.bestH)) { // or F is equal and H is lower
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
            neighbours.push(new AStarNode(id, node.g + 1, this.getHeuristic(id), node.id));
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
    start.addEventListener('click', visualize);

    function visualize(e: Event) {
        const SA: any = document.getElementById('selected-algorithm');
        const alg: any = new maze.algorithm[SA.value](maze.nodes, maze.startNode, maze.endNode);
        const steps: Array<object> = alg.start();
        console.log(alg.ttc + 'ms');
        steps.forEach(animate(showStep, 50));
    }
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