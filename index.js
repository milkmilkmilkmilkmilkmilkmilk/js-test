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

      $field.append($tile);
    }
  }
};

//функция для случайного числа
Game.prototype.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
