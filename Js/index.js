var sh=20, //方块的高度
    sw=20, //方块的宽度
    tr=30, //表格行数量
    td=30; //表格列数

var snake = null; //蛇的实列
var food = null; //食物的实例
var game = null; //游戏的实例

function Block(x,y,classname) {  //创建方块构造函数
    this.x = sw*x; //X轴移动的距离
    this.y = sh*y; //Y轴移动的距离
    this. class = classname;          //蛇的头,身体,食物

    this.viewContent = document.createElement('div'); //创建一个div元素来表示每个小方块对应的DOM元素
    this.viewContent.className = this.class; //把创建的classname属性(像:蛇头,身体,食物)添加到div元素(方块)上
    this.parent = document.getElementById('snakeSubject')//获取方块的父级
}
Block.prototype.create = function () { //创建方块DOM
    //创建方块样式
    this.viewContent.style.position='absolute';
    this.viewContent.style.width=sw + 'px';
    this.viewContent.style.height=sh +'px';
    this.viewContent.style.left=this.x + 'px';
    this.viewContent.style.top=this.y + 'px';

    //将DOM元素(小方块)添加到页面中
    this.parent.appendChild(this.viewContent);
};
Block.prototype.remove = function () {
    //删除DOM元素,例如当蛇吃掉食物后,食物就会消失
    this.parent.removeChild(this.viewContent);
};

function Snake() {  //创建蛇的构造函数
    this.heard = null; //存一下蛇头的信息
    this.tail = null; //存一下蛇尾的信息
    this.pos = [ ] ; //存一下蛇身上每一个方块的位置
    this.directionNum = {
        left:{
            x:-1,
            y:0,
            rotate:180 //蛇头在不同的方向中应该进行旋转，要不蛇头始终向右
        },
        right:{
            x:1,
            y:0,
            rotate: 0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    } //存蛇走的方向,用一个对象来表示 因为蛇走动你需要用按键来表示
}
Snake.prototype.init = function () { //创建蛇的初始化样式
    //创建蛇头
    var snakeHeard = new Block(2,0,'snakeHeard');
    snakeHeard.create();
    this.heard = snakeHeard //存储蛇头的默认位置坐标
    this.pos.push([2,0]); //存储蛇头方块的位置


    //创建蛇身体1
    var snakeBody1 = new Block(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]); //存储蛇身的第一节位置坐标

    //创建蛇身体2
    var snakeBody2 = new Block(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2; //存储蛇尾的位置坐标
    this.pos.push([0,0]); //存储蛇身的第一节位置坐标

    //形成链表关系
    snakeHeard.last = null;    //蛇头的链表关系
    snakeHeard.next = snakeBody1;

    snakeBody1.last = snakeHeard; //蛇身体第一节的链表关系
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1; //蛇身体第二节的链表关系
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right //默认让蛇往右走
};
//用下面方法来获取蛇头的下一个位置对应的元素，然后根据元素做不同的事情
// (例如下一个DOM元素是方块就往前移动一个方块，是食物就吃掉，是墙就撞了)
Snake.prototype.getNextPos = function(){
    var nextpos = [ //蛇头要走的下一个坐标
        this.heard.x/sw + this.direction.x,
        this.heard.y/sh + this.direction.y
    ];
    //下个点是自己，代表撞到自己，游戏结束
    var bumpInself = false // 是否撞到了自己(默认没有)
    this.pos.forEach(function (value) {     //forEach:用来遍历数组,  value表示的数组pos中的某一项
        if(value[0] == nextpos[0] && value[1] == nextpos[1]){
            //如果数组中的两个数据都相等，就说明下一个点在蛇的身体里面能找到，代表撞到自己了
            bumpInself = true;
        }
    });
    if(bumpInself){
        this.strateegies.die.call(this);
        return;
    }

    //下个点是围墙，代表撞到围墙，游戏结束
    if(nextpos[0] < 0 || nextpos[1] < 0 || nextpos[0]>td -1 ||nextpos[1] > tr -1){
        this.strateegies.die.call(this);
        return;
    }

    //下个点是食物，吃掉
    if(food && food.pos[0] == nextpos[0] && food.pos[1] == nextpos[1]){
        //如果这个条件成立，说明现在蛇头要走的下一个点是食物那个点，
        this.strateegies.eat.call(this);//就是吃
        return;
    }


    //下个点什么都不是，继续走
    this.strateegies.move.call(this);
};
//处理碰撞后要做的事
Snake.prototype.strateegies = { //创建原型对象
    move:function (format) { //这个参数用于决定要不要删除最后一个方块(蛇尾)，没传参数默认为underfined为false,取反为true执行
                            // 下面的删除蛇尾操作,如果传了就表示要做的事情是吃，就不删除蛇尾。
        //创建新的身体，在旧蛇头的位置
        var newBody = new Block(this.heard.x/sw,this.heard.y/sh,'snakeBody');
        //更新链表关系
        newBody.next = this.heard.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.heard.remove(); //把旧蛇头干掉
        newBody.create(); //插入新身体

        //创建一个新的蛇头(蛇头移动到下一个点的位置nextPos)
        var newHeard = new Block( this.heard.x/sw + this.direction.x,this.heard.y/sh + this.direction.y,'snakeHeard');
        //更新链表的关系
        newHeard.last = null;
        newHeard.next = newBody;
        newBody.last = newHeard;
        newHeard.create();
        newHeard.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';

        //蛇身上的每一个方块的坐标也要更新
        this.pos.splice(0,0,[this.heard.x/sw + this.direction.x,this.heard.y/sh + this.direction.y]);
        this.heard = newHeard; //还要把this.heard的信息更新一下

        if(!format){ //如果format的值为false，表示删除蛇尾方块(除了吃之外的操作)
            this.tail.remove();//删除蛇尾
            this.tail = this.tail.last;//更新蛇尾的链表关系

            this.pos.pop();//更新数组数据，删除数组(蛇)最后一个位置
        }
    },
    eat:function () {
        this.strateegies.move.call(this,true);
        creatFood();
        game.score++;
    },
    die:function () {
        game.over();
    }
};


snake = new Snake();



//创建食物
function creatFood() {
    //食物小方块的随机坐标
    var x = null;
    var y = null;

    var include = true; //循环跳出的条件，true表示食物在蛇的身上(继续循环)，false表示食物不在蛇的身上(不循环了)
    while (include){
        x = Math.round(Math.random()*(td -1));
        y = Math.round(Math.random()*(tr -1));

        snake.pos.forEach(function (value) {
            if(x != value[0] && y != value[1]){
                //这个条件成立,说明现在随机出来的坐标在蛇的身上并没有找到
                include = false;
            }
        });
    }
    //生成食物
    food = new Block(x,y,'snakeFood');
    food.pos=[x,y]; // 存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比

    var foodDom = document.querySelector('.snakeFood');
    if(foodDom){ //如果获取到食物了
        foodDom.style.left = x*sw + 'px';
        foodDom.style.top = y*sw + 'px';
    }else {
        food.create();
    } //或者没有食物就创建一个
}


//创建游戏逻辑
function Game() {
    this.timer = null; //定时器
    this.score = 0; //得分
}
Game.prototype.init = function () {
    snake.init();
    creatFood();
    // snake.getNextPos();
    document.onkeydown = function (ev) {
            //用户按下左键的时候这条蛇当时不能是正在往右走
        if (ev.which == 37 && snake.direction != snake.directionNum.right){
                snake.direction = snake.directionNum.left;
        }else if (ev.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if (ev.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if (ev.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
};
Game.prototype.start = function(){ //开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();
    },200)
};
Game.prototype.puse = function(){
    clearInterval(this.timer);
}
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert('你的得分为'+ this.score);

    var snakeSubject = document.getElementById('snakeSubject')
    snakeSubject.innerHTML = '';
    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');

    startBtnWrap.style.display = 'block';
}
//开始游戏
game = new Game();
var stateBtn = document.querySelector('.startBtn button');
stateBtn.onclick = function(){
    stateBtn.parentNode.style.display = 'none';
    game.init();
};

//暂停游戏
var startBtnWrap = document.getElementById('snakeSubject');
var puseBtn = document.querySelector('.suspendBtn button')

startBtnWrap.onclick = function () {
    game.puse();
    puseBtn.parentNode.style.display = 'block';
}
puseBtn.onclick = function () {
    game.start();
    puseBtn.parentNode.style.display = 'none';

}














