class Maze {

    constructor() {
        this.canvas = document.getElementById('maze-canvas');
        this.width = Math.floor(this.canvas.parentElement.clientWidth / 25);
        this.height = Math.floor(this.canvas.parentElement.clientHeight / 25);
        this.nodes = {};
        
        this.drawCanvasNodes();
        this.setStartNode();
        this.setEndNode();
    }

    setStartNode() {
        this.startNodeId = '1_1';
        const node = document.querySelector('[nodeId="1_1"]');
        node.classList.value = 'maze-node start';
        this.nodes[this.startNodeId].id = this.startNodeId;
    }

    setEndNode() {
        this.endNodeId = (this.width-2)+'_'+(this.height-2);
        const node = document.querySelector(`[nodeId="${this.endNodeId}"]`);
        node.classList.value = 'maze-node end';
    }

    drawCanvasNodes() {
        const self = this;
        for (let y = 0; y < this.height; y++) {
            const tr = document.createElement('tr');

            for (let x = 0; x < this.width; x++) {
                const td = document.createElement('td');
                td.setAttribute('nodeId', x+'_'+y);
                td.classList.value = 'maze-node unknown';

                td.addEventListener('mousedown', (e)=>{self.onMouseDown(e, self)});
                td.addEventListener('mouseup', (e)=>{self.onMouseUp(e, self)});
                td.addEventListener('mouseenter', (e)=>{self.onMouseEnterNode(e, self)});

                tr.appendChild(td);
                this.nodes[x+'_'+y] = {
                    x, y,
                    type: 1,
                    weight: 1,
                };
            }
            this.canvas.appendChild(tr);
        }
    }

    onMouseDown(e, self) {
        self.isMouseDown = true;
        self.transformNode(e.currentTarget.getAttribute('nodeid'));
    }
    
    onMouseUp(e, self) {
        self.isMouseDown = false;
    }
    
    onMouseEnterNode(e, self) {
        if (self.isMouseDown) {
            self.transformNode(e.currentTarget.getAttribute('nodeid'));
        }
    }

    transformNode(id) {
        const node = this.nodes[id];
        const elem = document.querySelector(`[nodeid="${id}"]`);
        if (node.type === 1) {
            // Create a wall
            elem.classList.value = 'maze-node wall';
            node.type = 0;
        } else if (node.type === 0) {
            // Create an empty cell
            elem.classList.value = 'maze-node unknown';
            node.type = 1;
        }
    }

}

window.onload = () => {
    const maze = new Maze();

    const vBtn = document.getElementById('start-button');
    vBtn.addEventListener('click', visualize);

    function visualize(e) {
        const alg = document.getElementById('algorithm').value;
        
        console.time();
        const steps = algorithm[alg](maze.nodes[maze.startNodeId], maze.nodes[maze.endNodeId], maze.nodes);
        console.timeEnd();
        animate(steps, 10);
    }
}

function animate(steps, time, index = 0) {
    if (steps[index]) {
        document.querySelector(`[nodeid="${steps[index].node}"]`).classList.value = steps[index].type + ' maze-node';
        setTimeout(animate, time, steps, time, index+1);
    } else {
        console.log('finished animation');
    }
}