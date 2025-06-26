function Game() {
  // Константы и свойства
  this.WIDTH = 40;
  this.HEIGHT = 24;
  this.TILE_SIZE = 25; // размер тайла в пикселях
  this.map = []; // 2D массив карты
  this.hero = null;
  this.enemies = [];
  this.swords = [];
  this.potions = [];
}

Game.prototype.init = function () {
  this.generateEmptyMap();
  this.placeRoomsAndCorridors();
  this.placeItemsAndCharacters();
  this.render();
  this.bindEvents();
  this.startEnemyAI();
};

Game.prototype.startEnemyAI = function () {
  const self = this;
  setInterval(function () {
    if (self.hero.health > 0) {
      self.enemyTurn();
      self.render();
    }
  }, 500);
};

// Заполнить карту стенами
Game.prototype.generateEmptyMap = function () {
  for (let y = 0; y < this.HEIGHT; y++) {
    this.map[y] = [];
    for (let x = 0; x < this.WIDTH; x++) {
      this.map[y][x] = "W"; // W = wall
    }
  }
};

// Разместить комнаты и коридоры
Game.prototype.placeRoomsAndCorridors = function () {
  let roomCount = this.getRandomInt(5, 10);
  let rooms = [];

  for (let i = 0; i < roomCount; i++) {
    let w = this.getRandomInt(3, 8);
    let h = this.getRandomInt(3, 8);
    let x = this.getRandomInt(1, this.WIDTH - w - 1);
    let y = this.getRandomInt(1, this.HEIGHT - h - 1);

    // Проверка пересечений комнат (с запасом 1 клетка)
    let overlaps = false;
    for (let r of rooms) {
      if (
        x < r.x + r.w + 1 &&
        x + w + 1 > r.x &&
        y < r.y + r.h + 1 &&
        y + h + 1 > r.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      rooms.push({ x, y, w, h });

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          this.map[y + dy][x + dx] = "E"; // E = empty floor
        }
      }
    }
  }

  // Коридоры (простые горизонтальные и вертикальные линии)
  let corridorCount = this.getRandomInt(3, 5);

  for (let i = 0; i < corridorCount; i++) {
    let cy = this.getRandomInt(1, this.HEIGHT - 2);
    for (let cx = 1; cx < this.WIDTH - 1; cx++) {
      this.map[cy][cx] = "E";
    }
  }

  for (let i = 0; i < corridorCount; i++) {
    let cx = this.getRandomInt(1, this.WIDTH - 2);
    for (let cy = 1; cy < this.HEIGHT - 1; cy++) {
      this.map[cy][cx] = "E";
    }
  }
};

// Найти пустую клетку для размещения сущности
Game.prototype.findEmptyCell = function () {
  while (true) {
    let x = this.getRandomInt(0, this.WIDTH - 1);
    let y = this.getRandomInt(0, this.HEIGHT - 1);
    if (this.map[y][x] === "E" && !this.isOccupied(x, y)) {
      return { x, y };
    }
  }
};

// Проверка, занята ли клетка героями, врагами, предметами
Game.prototype.isOccupied = function (x, y) {
  if (this.hero && this.hero.x === x && this.hero.y === y) return true;

  for (let enemy of this.enemies) {
    if (enemy.x === x && enemy.y === y) return true;
  }

  for (let sword of this.swords) {
    if (sword.x === x && sword.y === y) return true;
  }

  for (let potion of this.potions) {
    if (potion.x === x && potion.y === y) return true;
  }

  return false;
};

// Разместить героя, врагов и предметы
Game.prototype.placeItemsAndCharacters = function () {
  // Герой
  let heroPos = this.findEmptyCell();
  this.hero = {
    x: heroPos.x,
    y: heroPos.y,
    health: 100,
    attack: 10,
  };

  // Враги
  this.enemies = [];
  for (let i = 0; i < 10; i++) {
    let pos = this.findEmptyCell();
    this.enemies.push({
      x: pos.x,
      y: pos.y,
      health: 30,
      attack: 5,
    });
  }

  // Мечи
  this.swords = [];
  for (let i = 0; i < 2; i++) {
    let pos = this.findEmptyCell();
    this.swords.push({ x: pos.x, y: pos.y });
  }

  // Зелья
  this.potions = [];
  for (let i = 0; i < 10; i++) {
    let pos = this.findEmptyCell();
    this.potions.push({ x: pos.x, y: pos.y });
  }
};

// Отрисовка карты и объектов
Game.prototype.render = function () {
  let $field = $(".field");
  $field.empty();

  for (let y = 0; y < this.HEIGHT; y++) {
    for (let x = 0; x < this.WIDTH; x++) {
      let $tile = $('<div class="tile"></div>');

      $tile.css({
        left: x * this.TILE_SIZE + "px",
        top: y * this.TILE_SIZE + "px",
        width: this.TILE_SIZE + "px",
        height: this.TILE_SIZE + "px",
        position: "absolute",
      });

      let tileType = this.map[y][x];
      if (tileType === "W") {
        $tile.addClass("tileW"); // стена
      } else if (tileType === "E") {
        $tile.addClass("tile-"); // пол
      }
      // Герой
      if (this.hero && this.hero.x === x && this.hero.y === y) {
        $tile.addClass("tileP");
        let $hp = $('<div class="health"></div>').css(
          "width",
          this.hero.health + "%"
        );
        $tile.append($hp);
      }

      // Враги
      for (let enemy of this.enemies) {
        if (enemy.x === x && enemy.y === y && enemy.health > 0) {
          $tile.addClass("tileE");
          let $hp = $('<div class="health"></div>').css(
            "width",
            enemy.health + "%"
          );
          $tile.append($hp);
        }
      }

      // Мечи
      for (let sword of this.swords) {
        if (sword.x === x && sword.y === y) {
          $tile.addClass("tileSW");
        }
      }

      // Зелья
      for (let potion of this.potions) {
        if (potion.x === x && potion.y === y) {
          $tile.addClass("tileHP");
        }
      }
      $field.append($tile);
    }
  }
};

// Функция для случайного числа
Game.prototype.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Проверка перемещения врага
Game.prototype.canEnemyMoveTo = function (x, y) {
  if (x < 0 || x >= this.WIDTH || y < 0 || y >= this.HEIGHT) return false;

  if (this.map[y][x] !== "E") return false;

  // Проверка: нет ли врага на клетке
  for (let other of this.enemies) {
    if (other.x === x && other.y === y && other.health > 0) return false;
  }

  // Герой — цель, но не клетка для прохода
  if (this.hero && this.hero.x === x && this.hero.y === y) return false;

  return true;
};

// Обработка клавиш WASD и пробела
Game.prototype.bindEvents = function () {
  var self = this;
  $(document).on("keydown", function (e) {
    var code = e.keyCode;
    if (code === 87) self.moveHero(0, -1);
    else if (code === 65) self.moveHero(-1, 0);
    else if (code === 83) self.moveHero(0, 1);
    else if (code === 68) self.moveHero(1, 0);
    else if (code === 32) self.attackNearbyEnemies();
  });
};

// Перемещение героя (с проверкой стен)
Game.prototype.moveHero = function (dx, dy) {
  var newX = this.hero.x + dx;
  var newY = this.hero.y + dy;

  if (newX < 0 || newX >= this.WIDTH || newY < 0 || newY >= this.HEIGHT) return;

  if (this.map[newY][newX] === "W") return;

  this.hero.x = newX;
  this.hero.y = newY;
  this.render();
};

// Атака врагов в соседних клетках
Game.prototype.attackNearbyEnemies = function () {
  var heroX = this.hero.x;
  var heroY = this.hero.y;
  var attackRange = 1;
  var attacked = false;

  for (let enemy of this.enemies) {
    if (
      Math.abs(enemy.x - heroX) <= attackRange &&
      Math.abs(enemy.y - heroY) <= attackRange &&
      enemy.health > 0
    ) {
      enemy.health -= this.hero.attack;
      if (enemy.health < 0) enemy.health = 0;
      attacked = true;
    }
  }

  if (attacked) {
    this.render();
  }
};

// Атака врагов
Game.prototype.enemyTurn = function () {
  for (let enemy of this.enemies) {
    if (enemy.health <= 0) continue;

    let dx = this.hero.x - enemy.x;
    let dy = this.hero.y - enemy.y;

    // Атака, если рядом
    if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
      this.hero.health -= enemy.attack;
      if (this.hero.health <= 0) {
        this.hero.health = 0;
        alert("Вы погибли!");
        return;
      }
      continue;
    }

    // Простое движение к герою
    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveX = dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      moveY = dy > 0 ? 1 : -1;
    }

    let newX = enemy.x + moveX;
    let newY = enemy.y + moveY;

    if (this.canEnemyMoveTo(newX, newY)) {
      enemy.x = newX;
      enemy.y = newY;
    }
  }
};
