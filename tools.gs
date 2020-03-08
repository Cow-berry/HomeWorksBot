var MAXHEIGHT = 30;

function paintColumn(column, color, sheet) {
  for (var i = 1; i < MAXHEIGHT; i++) {
    setBackground(sheet, i, column, color);
  }
}
