// 1. Canvasのセットアップ
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// APIサーバーのベースURL 
const API_BASE_URL = 'https://brock-break.onrender.com';

// 2. ゲームの変数定義
let score = 0; // スコア変数

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2,
    radius: 10
};

let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2
};

let rightPressed = false;
let leftPressed = false;

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
for (let c = 0; c < brick.columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brick.rowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// 3. 描画関数
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
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

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
}

// 4. 衝突判定
function collisionDetection() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++; // スコアを加算
                    if (score === brick.rowCount * brick.columnCount) {
                        alert('おめでとう！クリアです！');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// 5. メインのゲームループ
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore(); // スコアを描画
    collisionDetection();

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            // ゲームオーバー処理
            gameOver();
        }
    }

    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
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

// 7. ゲームオーバー & ランキング機能
let isGameOver = false;

function gameOver() {
    if (isGameOver) return; // 複数回実行されるのを防ぐ
    isGameOver = true;

    const playerName = prompt('ゲームオーバー！ランキングに登録する名前を入力してください:');
    if (playerName && score > 0) {
        fetch(`${API_BASE_URL}/api/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName, score: score }),
        })
        .then(response => {
            if (!response.ok) {
                alert('スコアの送信に失敗しました。');
            }
            document.location.reload();
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('サーバーへの接続に失敗しました。');
            document.location.reload();
        });
    } else {
        document.location.reload();
    }
}

async function showRankings() {
    const container = document.getElementById('ranking-container');
    container.innerHTML = 'ランキングを読み込み中...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/scores`);
        if (!response.ok) {
            throw new Error('サーバーからの応答がありませんでした。');
        }
        const scores = await response.json();
        
        let rankingHtml = '<h2>トップ10スコア</h2>';
        if (scores.length === 0) {
            rankingHtml += '<p>まだスコアがありません。</p>';
        } else {
            rankingHtml += '<ol>';
            scores.forEach(entry => {
                rankingHtml += `<li>${entry.name}: ${entry.score}</li>`;
            });
            rankingHtml += '</ol>';
        }
        container.innerHTML = rankingHtml;
    } catch (error) {
        console.error('エラー:', error);
        container.innerHTML = 'ランキングの読み込みに失敗しました。';
    }
}

// 8. ゲーム開始
draw();