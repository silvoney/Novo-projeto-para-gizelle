let nome = "";

function abrirTela(nomeTela) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(nomeTela).classList.add("ativa");

    if (nomeTela === "scores") carregarScores();
}

function voltarMenu() {
    abrirTela("menu");
}


let dificuldade = 1;

function alterarDificuldade() {
    dificuldade = Number(document.getElementById("dificuldade").value);
}


function carregarScores() {
    let lista = JSON.parse(localStorage.getItem("scores")) || [];
    const ul = document.getElementById("listaScores");
    ul.innerHTML = "";

    lista.forEach((item, i) => {
        ul.innerHTML += `
            <li>${item.nome} — ${item.pontos} pts
            <button onclick="deletarScore(${i})">Excluir</button></li>`;
    });
}

function deletarScore(index) {
    let lista = JSON.parse(localStorage.getItem("scores")) || [];
    lista.splice(index, 1);
    localStorage.setItem("scores", JSON.stringify(lista));
    carregarScores();
}


function confirmarNome() {
    const n = document.getElementById("nomeJogador").value.trim();
    if (n.length < 2) return alert("Nome inválido!");
    nome = n;
    abrirTela("menu");
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let keys = {};
let bullets = [];
let enemies = [];
let specialEnemies = [];
let timer = 0;
let gameAtivo = false; 


let shieldActive = false;
let shieldTimer = 0;


const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 6
};


document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function shoot() {
    bullets.push({
        x: player.x + 18,
        y: player.y,
        width: 6,
        height: 12,
        speed: 8
    });
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 2 + dificuldade + (score * 0.15)
    });
}

function spawnSpecialEnemy() {
    specialEnemies.push({
        x: Math.random() * (canvas.width - 45),
        y: -60,
        width: 45,
        height: 45,
        speed: 3 + dificuldade + (score * 0.20)
    });
}

function colisao(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function ativarEscudo() {
    shieldActive = true;
    shieldTimer = 180;
}


function iniciarJogo() {
    score = 0;
    bullets = [];
    enemies = [];
    specialEnemies = [];
    shieldActive = false;
    gameAtivo = true; 

    document.getElementById("score").innerText = "0";
    abrirTela("game");

    requestAnimationFrame(gameLoop);
}


function gameLoop() {
    if (!gameAtivo) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

    
    if (keys[" "] || keys["Enter"]) {
        if (bullets.length === 0 || bullets[bullets.length - 1].y < player.y - 40) shoot();
    }

    bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < -20) bullets.splice(i, 1);
    });

  
    timer++;
    if (timer > 45) {
        spawnEnemy();
        if (Math.random() < 0.20) spawnSpecialEnemy();
        timer = 0;
    }

  
    enemies.forEach((e, i) => {
        e.y += e.speed;
        if (!shieldActive && colisao(e, player)) return gameOver();
        if (e.y > canvas.height) enemies.splice(i, 1);
    });

    
    specialEnemies.forEach((e, i) => {
        e.y += e.speed;
        if (!shieldActive && colisao(e, player)) return gameOver();
        if (e.y > canvas.height) specialEnemies.splice(i, 1);
    });

    
    enemies.forEach((enemy, ei) => {
        bullets.forEach((bullet, bi) => {
            if (colisao(bullet, enemy)) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score++;
                document.getElementById("score").innerText = score;
            }
        });
    });

    specialEnemies.forEach((enemy, ei) => {
        bullets.forEach((bullet, bi) => {
            if (colisao(bullet, enemy)) {
                bullets.splice(bi, 1);
                specialEnemies.splice(ei, 1);
                ativarEscudo();
                score += 2;
                document.getElementById("score").innerText = score;
            }
        });
    });

   
    if (shieldActive) {
        shieldTimer--;
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y + 20, 35, 0, Math.PI * 2);
        ctx.stroke();
        if (shieldTimer <= 0) shieldActive = false;
    }


    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

   
    ctx.fillStyle = "red";
    enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));

   
    ctx.fillStyle = "lightblue";
    specialEnemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));

    requestAnimationFrame(gameLoop);
}


function gameOver() {
    alert("GAME OVER! Pontuação: " + score);

    let lista = JSON.parse(localStorage.getItem("scores")) || [];
    lista.push({ nome: nome, pontos: score });
    localStorage.setItem("scores", JSON.stringify(lista));

    score = 0;
    bullets = [];
    enemies = [];
    specialEnemies = [];
    shieldActive = false;
    gameAtivo = false;

    abrirTela("menu");
}
