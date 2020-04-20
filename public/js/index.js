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
                const span = document.createElement('span');

                span.classList.value = 'node-span';

                td.setAttribute('nodeId', x+'_'+y);
                td.classList.value = 'maze-node unknown';

                td.addEventListener('mousedown', (e)=>{self.onMouseDown(e, self)});
                td.addEventListener('mouseup', (e)=>{self.onMouseUp(e, self)});
                td.addEventListener('mouseenter', (e)=>{self.onMouseEnterNode(e, self)});

                td.appendChild(span);
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
        if (e.currentTarget.classList.value.indexOf('start') !== -1) {
            /* This is the starting node */
            self.movingStartingNode = true;
            e.currentTarget.classList.value = 'start maze-node grabbed';
        } else {
            self.transformNode(e.currentTarget.getAttribute('nodeid'));
        }
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
        const speed = parseInt(document.getElementById('speed').value);
        
        const timeStart = Date.now();
        const steps = algorithm[alg](maze.nodes[maze.startNodeId], maze.nodes[maze.endNodeId], maze.nodes);
        const timeEnd = Date.now() - timeStart;
        console.log(`Finished processing in ${timeEnd}ms.`);
        animate(steps, speed);
    }
}

function animate(steps, time, index = 0) {
    if (steps[index]) {
        let node = document.querySelector(`[nodeid="${steps[index].node}"]`);

        if (node.classList.value.indexOf('start') === -1 && node.classList.value.indexOf('end') === -1) {
            let span = node.getElementsByTagName('span')[0];
            let clone = span.cloneNode(true);
        
            span.parentElement.replaceChild(clone, span);

            node.classList.value = steps[index].type + ' maze-node';
            span.classList.value = 'node-span';
        }
    
        setTimeout(animate, time, steps, time, index+1);
    } else {
        console.log('finished animation');
    }
}