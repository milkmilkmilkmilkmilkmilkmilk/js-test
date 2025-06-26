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
