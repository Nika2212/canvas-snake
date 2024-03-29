class GameController {
    constructor(width, height) {
        this.canvas = null;
        this.context = null;
        this.cWidth = width;
        this.cHeight = height;
        this.renderer = null;
        this.onInit();
    }
    
    onInit() {
        this._createCanvas();
        this._createContext();
        this.renderer = new Renderer(this.cWidth, this.cHeight, this.context);
        this._hangEvents();
    }
    
    _createCanvas() {
        const CANVAS = document.createElement('canvas');
              CANVAS.width = this.cWidth;
              CANVAS.height = this.cHeight;
              CANVAS.style.width = this.cWidth + 'px';
              CANVAS.style.height = this.cHeight + 'px';
        this.canvas = CANVAS;
        document.body.appendChild(CANVAS);
    }
    _createContext() {
        this.context = this.canvas.getContext('2d');
    }
    _hangEvents() {
        document.onkeydown = key => {
            if (key.code === 'KeyW') {
                this.renderer.moveUp();
            } else if (key.code === 'KeyA') {
                this.renderer.moveLeft();
            } else if (key.code === 'KeyS') {
                this.renderer.moveDown();
            } else if (key.code === 'KeyD') {
                this.renderer.moveRight();
            } else if (key.code === 'Space') {
                this.renderer.forceSpeed();
            }
        };
        document.onkeyup = key => {
            if (key.code === 'Space') {
                this.renderer.unforceSpeed();
            }
        }
    }
}
class Renderer {
    constructor(cWidth, cHeight, context) {
        this.cWidth = cWidth;
        this.cHeight = cHeight;
        this.context = context;
        this.snakeArray = [];
        this.food = null;
        this.speed = 150;
        this.size = 10;
        this.points = 0;
        this.canInteract = true;
        this.over = false;

        this.onInit();
    }
    
    onInit() {
        this._initSnake();
        this._createFood();
        setTimeout(() => this._render(), this.speed);
    }
    moveUp() {
        if (this.snakeArray[0].dir !== 'down' && this.canInteract) {
            this.canInteract = false;
            this.snakeArray[0].dir = 'up';
            for (let i = 1; i < this.snakeArray.length; i++) {
                this.snakeArray[i].schedule.push(new MovementSchedule(
                    this.snakeArray[0].x,
                    this.snakeArray[0].y,
                    this.snakeArray[0].dir
                ))
            }
        }
    }
    moveRight() {
        if (this.snakeArray[0].dir !== 'left' && this.canInteract) {
            this.canInteract = false;
            this.snakeArray[0].dir = 'right';
            for (let i = 1; i < this.snakeArray.length; i++) {
                this.snakeArray[i].schedule.push(new MovementSchedule(
                    this.snakeArray[0].x,
                    this.snakeArray[0].y,
                    this.snakeArray[0].dir
                ))
            }
        }
    }
    moveDown() {
        if (this.snakeArray[0].dir !== 'up' && this.canInteract) {
            this.canInteract = false;
            this.snakeArray[0].dir = 'down';
            for (let i = 1; i < this.snakeArray.length; i++) {
                this.snakeArray[i].schedule.push(new MovementSchedule(
                    this.snakeArray[0].x,
                    this.snakeArray[0].y,
                    this.snakeArray[0].dir
                ))
            }
        }
    }
    moveLeft() {
        if (this.snakeArray[0].dir !== 'right' && this.canInteract) {
            this.canInteract = false;
            this.snakeArray[0].dir = 'left';
            for (let i = 1; i < this.snakeArray.length; i++) {
                this.snakeArray[i].schedule.push(new MovementSchedule(
                    this.snakeArray[0].x,
                    this.snakeArray[0].y,
                    this.snakeArray[0].dir
                ))
            }
        }
    }
    forceSpeed() {
        this.speed = 70;
    }
    unforceSpeed() {
        this.speed = 140;
    }

    _render() {
        if (!this.over) {
            this.canInteract = true;
            this._refreshScene();
            this._moveSnake();
            this._checkFood();
            setTimeout(() => this._render(), this.speed);
        } else {
            this.context.font = "30px Arial";
            this.context.strokeText("Game Over", 10, 50);
        }
    }
    _refreshScene() {
        this.context.clearRect(0, 0, this.cWidth, this.cHeight);
    }
    _initSnake() {
        this.snakeArray.push(new SnakeFrag(0, 0, 'right', this.size, this.cWidth, this.cHeight));
    }
    _moveSnake() {
        for (let i = 0; i < this.snakeArray.length; i++) {
            for (let j = this.snakeArray.length - 1; j >= 0; j--) {
                if (this.snakeArray[i].x === this.snakeArray[j].x && this.snakeArray[i].y === this.snakeArray[j].y) {
                    if (this.snakeArray[i] !== this.snakeArray[j]) {
                        console.log('Collision');
                        this.over = true;
                        return;
                    }
                }
            }
            this.snakeArray[i].moveFrag();
            this.snakeArray[i].checkSchedule();
        }
        this._drawSnake();
    }
    _drawSnake() {
        for (let i = 0; i < this.snakeArray.length; i++) {
            if (i === 0) {
                this.context.fillStyle = '#3764d7';
                this.context.fillRect(this.snakeArray[i].x, this.snakeArray[i].y, this.size, this.size);
                this.context.rect(this.snakeArray[i].x, this.snakeArray[i].y, this.size, this.size);
            } else {
                this.context.fillStyle = '#4188ff';
                this.context.fillRect(this.snakeArray[i].x, this.snakeArray[i].y, this.size, this.size);
                this.context.rect(this.snakeArray[i].x, this.snakeArray[i].y, this.size, this.size);
            }
        }
    }
    _createFood() {
        const xLimit = this.cWidth / this.size / 4;
        const yLimit = this.cHeight / this.size / 4;
        let x = Math.round(Math.random() * xLimit);
        let y = Math.round(Math.random() * yLimit);
        while (this.snakeArray.filter(snakeFrag => (snakeFrag.x === (x * this.size)) && (snakeFrag.y === y * this.size))[0]) {
            x = Math.round(Math.random() * xLimit);
            y = Math.round(Math.random() * yLimit);
        }
        this.food = new SnakeFood(x * this.size, y * this.size);
    }
    _checkFood() {
        if (this.snakeArray[0].x === this.food.x && this.snakeArray[0].y === this.food.y) {
            this.points++;
            this._eatFood();
            this._createFood();
        }
        this._drawFood();
    }
    _drawFood() {
        this.context.fillStyle = '#2ecc71';
        this.context.fillRect(this.food.x, this.food.y, this.size, this.size);
    }
    _eatFood() {
        const lastSnakeFrag = this.snakeArray[this.snakeArray.length - 1];
        const lastSnakeSchedule = lastSnakeFrag.schedule.slice();
        if (lastSnakeFrag.dir === 'up') {
            this.snakeArray.push(new SnakeFrag(
                lastSnakeFrag.x,
                lastSnakeFrag.y + this.size,
                lastSnakeFrag.dir,
                this.size,
                this.cWidth,
                this.cHeight
            ));
            this.snakeArray[this.snakeArray.length - 1].schedule = lastSnakeSchedule;
        } else if (lastSnakeFrag.dir === 'right') {
            this.snakeArray.push(new SnakeFrag(
                lastSnakeFrag.x - this.size,
                lastSnakeFrag.y,
                lastSnakeFrag.dir,
                this.size,
                this.cWidth,
                this.cHeight
            ));
            this.snakeArray[this.snakeArray.length - 1].schedule = lastSnakeSchedule;
        } else if (lastSnakeFrag.dir === 'down') {
            this.snakeArray.push(new SnakeFrag(
                lastSnakeFrag.x,
                lastSnakeFrag.y - this.size,
                lastSnakeFrag.dir,
                this.size,
                this.cWidth,
                this.cHeight
            ));
            this.snakeArray[this.snakeArray.length - 1].schedule = lastSnakeSchedule;
        } else {
            this.snakeArray.push(new SnakeFrag(
                lastSnakeFrag.x + this.size,
                lastSnakeFrag.y,
                lastSnakeFrag.dir,
                this.size,
                this.cWidth,
                this.cHeight
            ));
            this.snakeArray[this.snakeArray.length - 1].schedule = lastSnakeSchedule;
        }
    }
}
class SnakeFood {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class SnakeFrag {
    constructor(spawnX, spawnY, direction, size, cWidth, cHeight) {
        this.x = spawnX;
        this.y = spawnY;
        this.dir = direction;
        this.size = size;
        this.schedule = [];
        this.cWidth = cWidth;
        this.cHeigh = cHeight;
    }

    moveFrag() {
        if (this.dir === 'right') {
            if (this.x >= this.cWidth - this.size) {
                this.x = 0;
            } else {
                this.x += this.size;
            }
        } else if (this.dir === 'left') {
            if (this.x <= 0) {
                this.x = this.cWidth;
            } else {
                this.x -= this.size;
            }
        } else if (this.dir === 'up') {
            if (this.y <= 0) {
                this.y = this.cHeigh;
            } else {
                this.y -= this.size;
            }
        } else {
            if (this.y >= this.cHeigh - this.size) {
                this.y = 0;
            } else {
                this.y += this.size;
            }
        }
    }
    checkSchedule() {
        if (this.schedule[0] && this.schedule[0].x === this.x && this.schedule[0].y === this.y) {
            this.dir = this.schedule[0].dir;
            this.schedule.shift();
        }
    }
}
class MovementSchedule {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}
const gameController = new GameController(480, 480);
