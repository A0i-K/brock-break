//1.Canvasのセットアップ
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');//2D描画コンテキストを取得

//2.ゲームの変数定義
//ボールの設定
let ball = {
    x: canvas.width /2,
    y: canvas.height -30,
    dx: 2, //X方向の速度
    dy: -2, //Y方向の速度
    radius: 10
};

//パドルの設定
let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width -75)/2
};

//キーボード操作
let rightPressed = false;
let leftPressed = false;

//ブロックの操作
let brick = {
    rowCount: 3,
    columnCount: 5,
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 30
};

let bricks = [];
for(let c = 0; c < brick.columnCount; c++){
    bricks[c] = [];
    for(let r = 0; r < brick.rowCount; r++){
        bricks[c][r] = {x: 0, y: 0, status: 1};//status:1 表示　,0　破壊
    }
}

//描画関数
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();

}

function drawBricks() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brick.width + brick.padding)) + brick.offsetLeft;
                let brickY = (r * (brick.height + brick.padding)) + brick.offsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brick.width, brick.height);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 4. 衝突判定
function collisionDetection() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height) {
                    ball.dy = -ball.dy; // ボールのY方向の速度を反転
                    b.status = 0; // ブロックを破壊
                }
            }
        }
    }
}

// 5. メインのゲームループ
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // 壁との衝突判定
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // パドルとの衝突判定
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            // ゲームオーバー
            alert('GAME OVER');
            document.location.reload();
        }
    }

    // パドルの移動
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }

    // ボールの移動
    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw); // 次のフレームを要求
}

// 6. キーボードイベントリスナー
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// 7. ゲーム開始
console.log(JSON.stringify(bricks,null,2));
draw();