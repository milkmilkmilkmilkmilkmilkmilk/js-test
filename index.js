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
