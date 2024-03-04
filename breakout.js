const canvas = document.createElement("canvas");
canvas.style.background = "black";
const ctx = canvas.getContext("2d"); // 2d 설정값
document.body.prepend(canvas);

const game = {
  grid: 60,
  ani: '',
  bricks: [],
  num: 100,
  gameover: true,
  bonus: []
}; //전체화면 크기
const ball = {
  //공하나의 설정값
  x: game.grid * 7,
  y: game.grid * 5,
  w: game.grid / 3,
  h: game.grid / 3, //game.grid라고 정확히 명시해야함
  color: "green",
  dx: 0,
  dy: 0,
};
const player = {
  //벽돌하나의 설정값
  color: "red",
  speed: 5,
};
const keys = { ArrowLeft: false, ArrowRight: false };

canvas.setAttribute("width", game.grid * 15);//화면크기
canvas.setAttribute("height", game.grid * 10);
canvas.style.border = "1px solid black";
canvas.addEventListener("click", (e) => {
  if (game.gameover) {
    game.gameover = false;
    startGame();
    game.ani = requestAnimationFrame(draw);
  } else if (!game.inplay) {
    game.inplay = true;
    ball.dx = 5;
    ball.dy = -5;
  }
});
outputStartGame();
// 전체 화면에서 테두리가 검고 바탕은 하얀색인 부분
document.addEventListener("keydown", (e) => {
  if (e.code in keys) {
    //키보드 방향키오른쪽왼쪽 설정값
    keys[e.code] = true;
  }
  if (e.code == "ArrowUp" && !game.inplay) {
    game.inplay = true;
    ball.dx = 5;
    ball.dy = -5;
  }
})
document.addEventListener("keyup", (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
})
document.addEventListener("mousemove", (e) => {
  //마우스 위치를 상대적으로 변환
  const val = e.clientX - canvas.offsetLeft;
  if (val > player.w && val < canvas.width) {
    player.x = val - player.w;
    if (!game.inplay) {
      ball.x = val - (player.w / 2);
    }
    // console.log(player.x);
  }
});
function resetBall() {
  ball.dx = 0;
  ball.dy = 0;
  ball.y = player.y - ball.h;
  ball.x = player.x +( player.w / 2);
  game.inplay = false;
}
function gameWinner() {
  game.gameover = true;
  game.inplay = false;
  console.log("you win");
  cancelAnimationFrame(game.ani);
}
function gameOver() {
  game.gameover = true;
  game.inplay = false;
  console.log("game over prees to start again");
  cancelAnimationFrame(game.ani);
}
function outputStartGame() {
  let output = "Click to Start Game";
  ctx.font = Math.floor(game.grid * 0.7) + "px serif";
  if (canvas.width < 900) {
    ctx.font = "20px serif";
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "yellow";
  ctx.fillText(output, canvas.width / 2, canvas.height / 2);
}
function startGame() {
  game.inplay = false;
  player.x = game.grid * 7;
  player.y = canvas.height-game.grid * 2;
  player.w = game.grid * 1.5;
  player.h = game.grid / 4;
  player.lives = 0;
  player.score = 0;
  game.bonus = [];
  resetBall();
  let buffer = 10;
  let width = game.grid;
  let height = game.grid / 2;
  let totalAcross = Math.floor((canvas.width -game.grid)/ (width + buffer));
  let xPos = game.grid / 2;
  let yPos = 0;
  // console,log(totalAcross);
  let yy = 0;
  for (let i = 0; i < game.num; i++) {
    if (i % totalAcross == 0) {
      yy++;
      yPos += height + buffer;
      xPos = game.grid / 2;
    }
    if (yy < 5) {
      createBrick(xPos, yPos, width, height);
    }
    xPos += width + buffer;
  }
}
  function createBrick(xPos, yPos, width, height) {
    let ranCol = '#' + Math.random().toString(16).substr(-6); //조금 어렵다
  //  substr 이랑 substring이랑은 큰 차이가 있다
    game.bricks.push({
      x: xPos,
      y: yPos,
      w: width,
      h: height,
      c: ranCol,
      v: Math.floor(Math.random() * 50),
      bonus: Math.floor(Math.random() * 3),
    });
  }
// function drawBricks() {
//   game.bricks.forEach((brick, index) => {
//     ctx.beginPath();
//     ctx.fillStyle = brick.c;
//     ctx.strokeStyle = "white";
//     ctx.rect(brick.x, brick.y, brick.w, brick.h);
//     ctx.fill();
//     ctx.stroke();
//     ctx.closePath();
//   });
// }

  function collDetection(obj1, obj2) {
    //공을 벽과 블록에서 튕기도록 만듬
    const xAxis = (obj1.x < (obj2.x + obj2.w)) && ((obj1.x + obj1.w) > obj2.x);
    const yAxis = (obj1.y < (obj2.y + obj2.h)) && ((obj1.y + obj1.h) > obj2.y);
    const val=  xAxis && yAxis;
    return val;
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //지우고 호출하는방식으로 이미지가 움직이는 것처럼 만들기에 필수적
    movement();
    // ctx.beginPath(); //플레이어 그리기
    ballmove();
    drawPlayer();
    drawBall();
    game.bonus.forEach((prize, index) => {
      prize.y += 5;
      drawBonus(prize);//그냥 보너스 점수 근데 이 보너스점수랑 볼이 부딪히면서 멈춘다
      if (collDetection(prize, player)) {
        player.score += prize.points;
        let temp = game.bonus.splice(index, 1);
      }
      if (prize.y > canvas.height) {
        let temp = game.bonus.splice(index, 1);
      }
    })
    game.bricks.forEach((brick, index) => {
      ctx.beginPath();
      ctx.fillStyle = brick.c;
      ctx.strokeStyle = "white";
      // console.log(brick);
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      if (collDetection(brick, ball)) {
        let rem = game.bricks.splice(index, 1);
        player.score += brick.v;
        console.log(ball.dy);
        if (ball.dy > -10 && ball.dy < 10) {
          ball.dy--;
        }
        ball.dy *= -1;
        if (brick.bonus == 1) {
          game.bonus.push({
            x: brick.x,
            y: brick.y,
            w: brick.w,
            h: brick.h,
            points: Math.ceil(Math.random() * 100) + 50,
            color: "white",
            alt: "black",
            counter: 10,
          })
        }
        if (game.bricks.length == 0) {
          gameWinner();
        }
      }
    })

    if (collDetection(player, ball)) {
      ball.dy *= -1;
      let val1 = ball.x + ball.w / 2 - player.x;
      let val2 = val1 - player.w / 2;
      let val3 = Math.ceil(val2 / (player.w / 10));
      ball.dx = val3;
      // console.log(val1, val2, val3);
    };
    let output1 = player.lives == 1 ? "Lift Left" : "Lives Left";
    let output = "${output1} : ${player.lives} Score : ${player.score} ";
    ctx.font = Math.floor(game.grid * 0.5) + "px serif";
    if (game.gameover) {
      output = 'Score Game Over  Click to Start Again'; 
      ctx.font = "20px serif";
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(output, canvas.width / 2, canvas.height - 20);
    if (!game.gameover) {
      game.ani = requestAnimationFrame(draw); //다음 프레임호출
    }
    // ctx.rect(player.x, player.y, player.w, player.h);
    // ctx.fillStyle = player.color;
    // ctx.fill();
    // ctx.closePath();
  }

function movement() {
  if (keys.ArrowLeft) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight) {
    player.x += player.speed;
  }
  if (!game.inplay) {
    ball.x = player.x + player.w / 2;
  }
}
function ballmove() {
  if (ball.x > canvas.width || ball.x < 0) {
    ball.dx *= -1;
  }
  if (ball.y < 0) {
    ball.dy *= -1;
  }
  if (ball.y > canvas.height) {
    player.lives--;
    resetBall();
    if (player.lives < 0) {
      gameOver();
    }
  }
  if (ball.dy > -2 && ball.dy < 0) {
    ball.dy = -3;
  }
  if (ball.dy > 0 && ball.dy < -2) {
    ball.dy = 3;
  }
  ball.x += ball.dx;
  ball.y += ball.dy;
}
function drawBall() {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.rect(ball.x, ball.y, ball.w, ball.h);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = ball.color;
  let adj = ball.w / 2;
  ctx.arc(ball.x + adj, ball.y + adj, ball.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}
function drawBonus(obj) {
  if (obj.counter < 0) {
    if ((obj, color == "black")) {
      obj.color = "white";
      obj.alt = "black";
      obj.counter = 10;
    } else {
      obj.color = "black";
      obj.alt = "white";
      obj.counter = 10;
    }
  }
  obj.counter--;
  ctx.beginPath();
  ctx.strokeStyle = obj.color;
  ctx.rect(obj.x, obj.y, obj.w, obj.h);
  ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
  ctx.fillStyle = obj.alt;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = obj.color;
  ctx.font = "14px serif";
  ctx.textAlign = "center";
  ctx.fillText(obj.points, obj.x + obj.w / 2, obj.y + obj.h / 2);
  ctx.closePath();
}
function drawPlayer() {
  ctx.beginPath();
  ctx.rect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}
