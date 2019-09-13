function onOpen() {
  SpreadsheetApp.getUi()
        .createMenu('Меню преподавателя')
        .addItem('Распределить таски на текущем листе', 'runTaskGen')
        .addToUi();
}

var usedTasks = [], usedMem = [], a = [], setter = [];
var SHEET = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
var messager = "";
var numTasks = 50, numMem = 30;

function message_messager() {
  message(messager);
}

function runTaskGen() {
  SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Algo");
  if (SHEET == undefined) {
    message("Something is wrong, reload the page");
    return;
  }
  if (getValueSheets(SHEET, 1, 1) != "№") {
    message("This is not discipline list!");
    return;
  }
  messager += "Run Algorithm...        ";
  message_messager();
  messager += "Clean doc...      ";
  message_messager();
  distributionClear();
  messager += "Read table...      ";
  message_messager();
  distributionRead();
  messager += "Run algo...      ";
  message_messager();
  distributionAlgorithm();
  messager += "Write distribution...       ";
  message_messager();
  distributionWrite();
  messager += "Done distribution";
  message_messager();
}

function distributionClear() {
  for (var i = 2; i <= numMem; i++) {
    usedMem[i] = Number(getValueSheets(SHEET, i, 4));
    if (isNaN(usedMem[i])) usedMem[i] = 9000;
    a[i] = [];
    setter[i] = [];
    for (var j = 0; j <= numTasks; j++) {
      a[i][j] = 0;
      setter[i][j] = 0;
    }
  }
  for (var i = 1; i <= numTasks; i++) {
    usedTasks[i] = 0;
  }
}

function distributionRead() {
  for (var i = 2; i < numMem; i++) {
    for (var j = 5; j < numTasks; j++) {
      a[i][j] = (((getValueSheets(SHEET, i, j) == "+") && (getBackground(SHEET, i, j) == WHITE)) ? 1 : 0);
      if (a[i][j] == 1) {
        usedTasks[j]++;
      }
      if (getBackground(SHEET, i, j) == YELLOW || getBackground(SHEET, i, j) == GREEN) usedTasks[j] = 9000;
    }
  }
  for (var i = 5; i < numTasks; i++) {
    if (usedTasks[i] >= 9000) {
      for (var j = 2; j < numMem; j++) {
        a[j][i] = 0;
      }
    }
  }
}

function sumOnHorizontal(i) {
  var sum = 0;
  for (var j = 5; j < numTasks; j++) {
    sum += a[i][j];
  }
  return sum;
}

function sumOnVertical(i) {
  var sum = 0;
  for (var j = 2; j < numMem; j++) {
    sum += a[j][i];
  }
  return sum;
}

function setTask(x, y) {
  setter[x][y] = 1;
  for (var i = 5; i < numTasks; i++) {
    a[x][i] = 0;
  }
  for (var i = 2; i < numMem; i++) {
    a[i][y] = 0;
  }
}

function findFirstOneHorizontal(j) {
  for (var i = 5; i < numTasks; i++) {
    if (a[j][i] == 1) return i;
  }
  return undefined;
}

function findFirstOneVertical(j) {
  for (var i = 2; i < numMem; i++) {
    if (a[i][j] == 1) return i;
  }
  return undefined;
}

var flag = false;

function oneDestribute() {
  for (var i = 5; i < numTasks; i++) {
    if (sumOnVertical(i) == 1) {
      setTask(findFirstOneVertical(i), i);
      return;
    }
  }
  // find minimal
  var minimal = 8000;
  for (var i = 2; i < numMem; i++) {
    if (minimal > usedMem[i]) minimal = usedMem[i];
  }
  if (minimal == 8000) {
    flag = true;
    return;
  }
  for (var i = 2; i < numMem; i++) {
    if (minimal == usedMem[i]) {
      var minimal2 = 8000;
      for (var j = 5; j < numTasks; j++) {
        if (a[i][j] == 1 && minimal2 > usedTasks[j]) {
          minimal2 = usedTasks[j];
        }
      }
      if (minimal2 != 8000) {
        for (var j = 5; j < numTasks; j++) {
          if (a[i][j] == 1 && minimal2 == usedTasks[j]) {
            setTask(i, j);
            return;
          }
        }
      }
      usedMem[i] = 9000;
    }
  }
}

function isEnd() {
  if (flag) return true;
  for (var i = 2; i < numMem; i++) {
    for (var j = 5; j < numTasks; j++) {
      if (a[i][j] == 1) return false;
    }
  }
  return true;
}

function distributionAlgorithm() {
  while (!isEnd()) {
    oneDestribute();
  }
}

function distributionWrite() {
  for (var i = 2; i < numMem; i++) {
    for (var j = 5; j < numTasks; j++) {
      if (setter[i][j] == 1) setBackground(SHEET, i, j, YELLOW);
    }
  }
}
