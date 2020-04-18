const closed = {};
const open = {};
let steps = [];

class AStarNode {
    constructor(x, y, parent, end) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.g = parent.g + 1;
        this.h = Math.abs(end.x - x) + Math.abs(end.y - y);
        this.f = this.g + this.h;
        this.parent = parent.x+'_'+parent.y;
    }
}

function initAStar(start, end, nodes) {
    for (const key of Object.keys(nodes)) {
        closed[key] = false; 
    }

    open[start.x+'_'+start.y] = {
        f: 0,
        h: 0,
        g: 0,
        x: start.x,
        y: start.y,
    };

    while (Object.keys(open).length > 0) {
        const q = findBestNode();
        delete open[q.x+'_'+q.y];

        const neighbourIds = [
            `${q.x+1}_${q.y}`,
            `${q.x-1}_${q.y}`,
            `${q.x}_${q.y+1}`,
            `${q.x}_${q.y-1}`,
        ];

        for (const nId of neighbourIds) {
            if (nodes[nId] && nodes[nId].type === 1) {
                let neighbour = new AStarNode(nId.split('_')[0], nId.split('_')[1], q, end);
                if (nId === `${end.x}_${end.y}`) {
                    visitNode(q);
                    visitNode(neighbour);
            
                    finish(`${end.x}_${end.y}`);
                    return steps;
                } else if(open[nId] && open[nId].f < neighbour.f) {
                    seeNode(neighbour);
                } else if(!closed[nId] || closed[nId].f > neighbour.f) {
                    seeNode(neighbour);
                    open[nId] = neighbour;
                }
            }
        }

        visitNode(q);
    }

    return steps;
}

function finish(endId) {
    let id = endId;
    let path = [];

    do {
        const node = closed[id];
        path.push({ node: id, type: 'path' });
        id = node.parent;
    } while (id);

    path = path.reverse();
    steps = steps.concat(path);
}

function seeNode(node) {
    let nodeId = node.x+'_'+node.y;

    steps.push({ node: nodeId, type: 'seen' });
}

function visitNode(node) {
    let nodeId = node.x+'_'+node.y;
    closed[nodeId] = node;

    steps.push({ node: nodeId, type: 'visited' });
}

function findBestNode() {
    let minF = Infinity;
    let minH = Infinity;
    let bestNode = null;
    for (const key of Object.keys(open)) {
        let node = open[key];

        if (node.f < minF) {
            minF = node.f;
            minH = node.h;
            bestNode = node;
        } else if (node.f === minF && node.h < minH) {
            minF = node.f;
            minH = node.h;
            bestNode = node;
        }
    }
    return bestNode;
}

function isValid(id, nodes) {
    if (nodes[id]) {
        return true;
    }

    return false;
}