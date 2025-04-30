document.addEventListener('DOMContentLoaded', function() {
    // 游戏状态
    const GameState = {
        RUNNING: 0,
        WON: 1,
        OVER: 2
    };

    // 方向键值
    const KeyMap = {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37
    };

    class Game2048 {
        constructor() {
            this.size = 4;
            this.tileContainer = document.querySelector('.tile-container');
            this.scoreContainer = document.getElementById('score');
            this.messageContainer = document.querySelector('.game-message');
            this.retryButton = document.querySelector('.retry-button');
            
            this.setup();
        }
        
        // 初始化游戏
        setup() {
            this.grid = this.createGrid(this.size);
            this.score = 0;
            this.gameState = GameState.RUNNING;
            this.won = false;
            
            // 清空容器
            this.tileContainer.innerHTML = '';
            this.scoreContainer.textContent = '0';
            this.messageContainer.classList.remove('game-won', 'game-over');
            this.messageContainer.style.display = 'none';
            
            // 添加两个初始方块
            this.addRandomTile();
            this.addRandomTile();
            
            // 绑定事件
            this.bindEvents();
        }
        
        // 创建网格
        createGrid(size) {
            const grid = [];
            
            for (let i = 0; i < size; i++) {
                grid[i] = [];
                for (let j = 0; j < size; j++) {
                    grid[i][j] = null;
                }
            }
            
            return grid;
        }
        
        // 生成随机方块
        addRandomTile() {
            if (this.hasEmptyCells()) {
                const value = Math.random() < 0.9 ? 2 : 4;
                const emptyCells = [];
                
                // 找到所有空格子
                for (let i = 0; i < this.size; i++) {
                    for (let j = 0; j < this.size; j++) {
                        if (!this.grid[i][j]) {
                            emptyCells.push({ x: i, y: j });
                        }
                    }
                }
                
                // 随机选择一个空格子
                const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const tile = { x: randomCell.x, y: randomCell.y, value: value };
                
                // 更新网格和UI
                this.grid[randomCell.x][randomCell.y] = tile;
                this.addTileToDOM(tile);
            }
        }
        
        // 检查是否有空格子
        hasEmptyCells() {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (!this.grid[i][j]) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        // 向DOM添加方块
        addTileToDOM(tile) {
            const element = document.createElement('div');
            const position = this.calculatePosition(tile);
            
            element.classList.add('tile', `tile-${tile.value}`);
            element.textContent = tile.value;
            element.style.left = position.left + 'px';
            element.style.top = position.top + 'px';
            
            // 添加弹出动画
            element.style.animation = 'pop 200ms ease';
            
            // 保存DOM元素引用
            tile.element = element;
            
            this.tileContainer.appendChild(element);
        }
        
        // 计算方块位置
        calculatePosition(tile) {
            return {
                left: tile.y * 121.25,
                top: tile.x * 121.25
            };
        }
        
        // 移动方块
        moveTile(tile, newX, newY) {
            this.grid[tile.x][tile.y] = null;
            this.grid[newX][newY] = tile;
            
            // 更新位置属性
            tile.x = newX;
            tile.y = newY;
            
            // 更新DOM位置
            const position = this.calculatePosition(tile);
            tile.element.style.left = position.left + 'px';
            tile.element.style.top = position.top + 'px';
        }
        
        // 合并方块
        mergeTiles(tile1, tile2) {
            // 更新网格
            this.grid[tile1.x][tile1.y] = null;
            
            // 更新值
            tile2.value *= 2;
            
            // 更新分数
            this.score += tile2.value;
            this.scoreContainer.textContent = this.score;
            
            // 检查胜利条件
            if (tile2.value === 2048 && !this.won) {
                this.gameState = GameState.WON;
                this.won = true;
                this.showMessage(true);
            }
            
            // 更新合并后的方块样式
            tile2.element.textContent = tile2.value;
            tile2.element.classList.remove(`tile-${tile2.value / 2}`);
            tile2.element.classList.add(`tile-${tile2.value}`);
            
            // 移除被合并的方块
            setTimeout(() => {
                this.tileContainer.removeChild(tile1.element);
            }, 100);
            
            // 添加合并动画
            tile2.element.style.animation = 'pop 200ms ease';
        }
        
        // 移动网格
        moveGrid(direction) {
            let moved = false;
            
            // 定义遍历顺序
            const traversals = this.buildTraversals(direction);
            
            traversals.x.forEach(x => {
                traversals.y.forEach(y => {
                    const tile = this.grid[x][y];
                    
                    if (tile) {
                        const { newX, newY, next } = this.findFarthestPosition(x, y, direction);
                        
                        // 检查是否可以合并
                        if (next && next.value === tile.value) {
                            this.mergeTiles(tile, next);
                            moved = true;
                        } 
                        // 如果可以移动
                        else if (newX !== x || newY !== y) {
                            this.moveTile(tile, newX, newY);
                            moved = true;
                        }
                    }
                });
            });
            
            // 如果有移动，添加新方块
            if (moved) {
                this.addRandomTile();
                
                // 检查游戏是否结束
                if (!this.hasAvailableMoves()) {
                    this.gameState = GameState.OVER;
                    this.showMessage(false);
                }
            }
            
            return moved;
        }
        
        // 确定遍历顺序
        buildTraversals(direction) {
            const traversals = {
                x: [],
                y: []
            };
            
            // 纵向遍历
            for (let i = 0; i < this.size; i++) {
                traversals.x.push(i);
            }
            
            // 横向遍历
            for (let i = 0; i < this.size; i++) {
                traversals.y.push(i);
            }
            
            // 从右往左移动时，从右边开始遍历
            if (direction === KeyMap.RIGHT) {
                traversals.y = traversals.y.reverse();
            }
            
            // 从下往上移动时，从下边开始遍历
            if (direction === KeyMap.DOWN) {
                traversals.x = traversals.x.reverse();
            }
            
            return traversals;
        }
        
        // 找到最远的空位置
        findFarthestPosition(x, y, direction) {
            let newX = x;
            let newY = y;
            let next = null;
            
            // 定义移动增量
            const vector = this.getVector(direction);
            
            do {
                x = newX;
                y = newY;
                newX += vector.x;
                newY += vector.y;
            } while (this.isValidPosition(newX, newY) && !this.grid[newX][newY]);
            
            // 如果下一个位置有效且不为空
            if (this.isValidPosition(newX, newY)) {
                next = this.grid[newX][newY];
            }
            
            return { newX: x, newY: y, next: next };
        }
        
        // 获取方向向量
        getVector(direction) {
            const map = {
                [KeyMap.UP]: { x: -1, y: 0 },
                [KeyMap.RIGHT]: { x: 0, y: 1 },
                [KeyMap.DOWN]: { x: 1, y: 0 },
                [KeyMap.LEFT]: { x: 0, y: -1 },
            };
            
            return map[direction];
        }
        
        // 检查位置是否有效
        isValidPosition(x, y) {
            return x >= 0 && x < this.size && y >= 0 && y < this.size;
        }
        
        // 检查是否还有可用移动
        hasAvailableMoves() {
            // 如果还有空格子
            if (this.hasEmptyCells()) {
                return true;
            }
            
            // 检查相邻方块是否可以合并
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    const tile = this.grid[i][j];
                    
                    // 检查上下左右四个方向
                    for (const direction of [KeyMap.UP, KeyMap.RIGHT, KeyMap.DOWN, KeyMap.LEFT]) {
                        const vector = this.getVector(direction);
                        const newX = i + vector.x;
                        const newY = j + vector.y;
                        
                        if (this.isValidPosition(newX, newY)) {
                            const other = this.grid[newX][newY];
                            if (other && other.value === tile.value) {
                                return true;
                            }
                        }
                    }
                }
            }
            
            return false;
        }
        
        // 显示游戏结束或胜利消息
        showMessage(won) {
            const message = this.messageContainer;
            const messageText = message.querySelector('p');
            
            message.style.display = 'block';
            
            if (won) {
                message.classList.add('game-won');
                messageText.textContent = '你赢了!';
            } else {
                message.classList.add('game-over');
                messageText.textContent = '游戏结束!';
            }
        }
        
        // 绑定键盘和按钮事件
        bindEvents() {
            document.addEventListener('keydown', event => {
                if (this.gameState === GameState.RUNNING) {
                    // 箭头键移动
                    if ([KeyMap.UP, KeyMap.RIGHT, KeyMap.DOWN, KeyMap.LEFT].includes(event.keyCode)) {
                        event.preventDefault();
                        this.moveGrid(event.keyCode);
                    }
                }
            });
            
            // 重试按钮
            this.retryButton.addEventListener('click', () => {
                this.setup();
            });
        }
    }
    
    // 初始化游戏
    new Game2048();
});