var DISKRETHSPREADSHEET = ""; // there is a script!
var ALGOSPREADSHEET = "";
var MATLOGSPREADSHEET = "";
var SUBJECTSPREADSHEETS = {
  "DiskrethMath" : DISKRETHSPREADSHEET,
  "Algo" : ALGOSPREADSHEET,
  "MatLog" : MATLOGSPREADSHEET
}

var PASSWORD = "";

function setBackground(sheet, height, width, value) {
  sheet.getRange(height, width).setBackground(value);
}

function setValueSheets(sheet, height, width, value) {
  sheet.getRange(height, width).setValue(value);
}

function getValueSheets(sheet, height, width) {
  return sheet.getRange(height, width).getValue();
}

function getBackground(sheet, height, width) {
  return sheet.getRange(height, width).getBackground();
}

function message(msg) {
  SpreadsheetApp.getActiveSpreadsheet().toast(msg);
}

function sendTask(name, task, nameSheet) {
  var type = "Write";
  var group = getValue(SHEETS["DATA"], 2, 4);
  message("Send command adding task " + task + " from " + name + " from group " + group);
  var data = {
    "type" : type,
    "group" : group,
    "name" : name,
    "task" : task
  }
  var bigData = {
    "method" : "get",
    "payload" : data
  }
  UrlFetchApp.fetch(SUBJECTSPREADSHEETS[nameSheet] + "?type=Write&group=" + group + "&name=" + name + "&task=" + task + "&password=" + PASSWORD);
}

var RED = "#ff0000";
var BLACK = "#000000";
var WHITE = "#ffffff";
var YELLOW = "#ffff00";
var GREEN = "#00ff00";

var PRED = "#ffffff";
var PWHITE = "#ffffff";
var PYELLOW = "#fffeaa";
var PGREEN = "#a8ff9f";

var FROMCOLORTODIGIT = {
  "#ff0000" : 0,
  "#ffffff" : 1,
  "#ffff00" : 2,
  "#00ff00" : 3
}

var FROMPCOLORTODIGIT = {
  "#ffffff" : 0,
  "#ffffff" : 1,
  "#fffeaa" : 2,
  "#a8ff9f" : 3
}

var FROMDIGITTOCOLOR = {
  0 : RED,
  1 : WHITE,
  2 : YELLOW,
  3 : GREEN
}

var FROMDIGITTOPCOLOR = {
  0 : PRED,
  1 : PWHITE,
  2 : PYELLOW,
  3 : PGREEN
}

function triggered() {
  ScriptApp.newTrigger("onEditable").forSpreadsheet(SPREADSHEET).onEdit().create();
}

function onEditable(e) {
  try {
    var sheet = e.range.getSheet();
    var height = e.range.getRowIndex();
    var width = e.range.getColumn();
    Logger.log(sheet);
    if (height < 3 || width < 5 || SUBJECTSPREADSHEETS[sheet.getName()] == undefined) return;
    Logger.log(getBackground(sheet, height, width));
    var currentColor = FROMCOLORTODIGIT[getBackground(sheet, height, width)];
    var value = e.value;
    if (!(value == 1 || value == 0)) {
      message("Uncorrent value");
      return;
    }
    setValueSheets(sheet, height, width, "+");
    if (value == 0) value--;
    if ((value == -1 && currentColor == 0) || (value == 1 && currentColor == 3)) {
      message("Uncorrent color");
      return;
    } else {
      paintColumn(width, FROMDIGITTOPCOLOR[Number(currentColor) + Number(value)], SHEET);
      setBackground(sheet, height, width, FROMDIGITTOCOLOR[Number(currentColor) + Number(value)]);
      if (currentColor == 2 && value == 1) {
        setValueSheets(sheet, height, 4, Number(getValueSheets(sheet, height, 4)) + 1);
        if (SUBJECTSPREADSHEETS[sheet.getName()] != "") {
          sendTask("hah", "haha", sheet.getName());
        }
      }
      if (currentColor == 3 && value == -1) {
        setValueSheets(sheet, height, 4, Number(getValueSheets(sheet, height, 4)) - 1);
      }
    }
  } catch (exception) {
    message("Some problem:\n" + exception.name + "\n" + exception.message);
  }
}
