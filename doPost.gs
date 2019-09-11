// 2019 @vladrus13 - telegram. Please, if you want to ask me, choose this method/
// Attention! When you view the code, you may experience eye pain! 
// In that case, close immediately. Look at your own risk. 
// (P.S. Don't show the code to my programming teacher!)

// CONSTANTS

var COMMANDS = {
  "/1": commandAdd,
  "/0": commandRemove,
  "/link": commandLink,
  "/help": commandHelp,
  "/register": commandRegister
};

var SHEETS = {
  "STUDENTS" : 0,
  "d": 1,
  "a": 2,
  "DATA" : 3,
  "LOGGER" : 4
};

var SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

function doPost(e) {
  var update = JSON.parse(e.postData.contents);
  if (update.hasOwnProperty('message')) {
    var objectMessage = update.message;
    if (objectMessage.hasOwnProperty('entities') && objectMessage.entities[0].type == 'bot_command') {      
      var message = objectMessage.text;
      var chatId = objectMessage.chat.id;
      var username = objectMessage.from.username;
      var split = message.split(" ");
      try {
        makeLog(message, username);
        if (COMMANDS[split[0]] == undefined) { // Стремный костыль, как бы чего не случилось ::pominki::
          sendMessage(chatId, "Undefined command. See /help");
          return;
        }
        COMMANDS[split[0]](split, username, chatId);
        // well, we got success
      } catch (exception) {
        sendMessage(chatId, "We find some problems. Stacktrace send to tech support. Please, wait");
        // got a exception, send it to me
        var error = "";
        error += 'Hello, we got a error in one of message.\n';
        error += 'Username : ' + username + '\n';
        error += 'ChatId : ' + chatId + '\n';
        error += 'Message : ' + message + '\n';
        error += 'Error.name : ' + exception.name + '\n';
        error += 'Error.message : ' + exception.message + '\n';
        error += "Error.code : " + exception.code + '\n';
        error += "Error.stack ; " + exception.stack + '\n';
        sendMessage(getValue(SHEETS["DATA"], 1, 4), error);
      }
    }
  }
}

// pre :: number1 is not prefix of number2 and in pemutation too
// post :: return 1, if number1 >= number2, else 0
// post :: if pre is false, return -1, if number1 is prefix of number2, else -2
function compareNumbers(number1, number2, chatId) {
  if (number1 == number2) return 1;
  var firstNumber = number1.split(".");
  var secondNumber = number2.split(".");
  for (var i = 0; i < Math.min(firstNumber.length, secondNumber.length); i++) {
    if (isNaN(Number(firstNumber[i])) || isNaN(Number(secondNumber[i]))) {
      sendMessage(chatId, "Not a number in parser of Numbers!" + firstNumber[i] + " or " + secondNumber[i]);
      return;
    }
    if (Number(firstNumber[i]) < Number(secondNumber[i])) return 0;
    if (Number(firstNumber[i]) > Number(secondNumber[i])) return 1;
  }
  return (firstNumber.length > secondNumber.length ? -2 : -1);
}

// pre :: number[i] is not prefix of number[j] for all i != j and i, j in [1, 3]
// post :: return 1, if number1 <= number2 <= number3, else 0
// post :: return 0, if pre is false and number2 is NOT prefix, else 1
function compareIn(number1, number2, number3, chatId) {
  var a = compareNumbers(number3, number2, chatId);
  var b = compareNumbers(number2, number1, chatId);
  if (a == -2 || b == -1) {
    sendMessage(chatId, "Sorry, but one of tasks is prefix of another. Problem:\nWrited : " + (a == -2 ? number3 : number1) + "\nTable task : " + number2);
    return 0;
  }
  if (a == -1 || b == -2) {
    sendMessage(chatId, "WARNING! Writed is prefix of one of task. Taks added. Problem:\nWrited : " + (a == -1 ? number3 : number1) + "\nTable task : " + number2);
    return 1;
  }
  return a && b;
}

// Added to table tasks
function commandAdd(split, username, chatId) {
  setInGroup(split, username, chatId, "+");
}

// Remove from table tasks
function commandRemove(split, username, chatId) {
  setInGroup(split, username, chatId, null);
}

// Set in table tasks
function setInGroup(split, username, chatId, value) {
  if (split.length < 2) {
    sendMessage(chatId, "Please, write discipline character and tasks...");
    return;
  }
  if (split[1].length != 1 || SHEETS[split[1]] == undefined) {
    sendMessage(chatId, "Send mistake discipline character!");
    return;
  }
  var heightMember = getHeight(chatId);
  if (heightMember == null) {
    sendMessage(chatId, "Sorry, I don't know You");
    return;
  }
  
  // parse split
  for (var i = 2; i < split.length; i++) {
    split[i] = split[i].split("-");
    if (split[i].length > 2) {
      sendMessage(chatId, "Incorrect parsing in character '-'");
      return;
    }
    if (split[i].length == 1) split[i][1] = split[i][0];
    if (isNaN(Number(split[i][1]))) split[i][1] = -1;
    if (isNaN(Number(split[i][0]))) split[i][0] = -1;
  }
  // marks
  var accTasks = [];
  var it = 5;
  var task = "";
  while (it != 300) {
    task = getValue(SHEETS[split[1]], 1, it);
    if (task != "") {
      for (var i = 2; i < split.length; i++) {
        if (compareIn(String(split[i][0]), String(task), String(split[i][1]), chatId)) {
          setValue(SHEETS[split[1]], heightMember, it, value);
          accTasks.push(task);
        }
      }
    }
    it++;
  }
  sendMessage(chatId, "Successful " + (value == null ? "removed" : "added") + ":\n" + (accTasks.length == 0 ? "NOTHIING!" : accTasks));
}

function commandLink(split, username, chatId) {
  var message = "";
  var height = 2;
  while (height != 300) {
    if (getValue(SHEETS["DATA"], height, 1) == '#') {
      sendMessage(chatId, message);
      return;
    }
    if (getValue(SHEETS["DATA"], height, 1) == "") {
      message += "<a href=\"" + getValue(SHEETS["DATA"], height, 1 + 2) + "\">" + getValue(SHEETS["DATA"], height, 2) + "</a>, ";
    } else {
      message += "\n" + getValue(SHEETS["DATA"], height, 1) + ": ";
    }
    height++;
  }
}

function commandHelp(split, username, chatId) {
  var height = 1;
  var message = "Вас приветствует справка по боту!\nКоманды:\n";
  while (height != 300) {
    if (getValue(SHEETS["DATA"], height, 5) == '#') {
      sendMessage(chatId, message);
      return;
    }
    message += getValue(SHEETS["DATA"], height, 5) + "\nШаблон использования: " + getValue(SHEETS["DATA"], height, 6) + '\n' + getValue(SHEETS["DATA"], height + 1, 6) + "\n\n";
    height += 2;
  }
}

function commandRegister(split, username, chatId) {
  if (split[1].length > 5) {
    sendMessage(chatId, "Too long ID!");
    return;
  }
  if (Number(split[1]) < 1) {
    sendMessage(chatId, "Too small ID!");
    return;
  }
  if (isNaN(Number(split[1]))) {
    sendMessage(chatId, "Incorrect ID!");
    return;
  }
  if (getValue(SHEETS["STUDENTS"], Number(split[1]) + 1, 3) == "") {
    sendMessage(chatId, "A user with this id does not exist");
    return;
  }
  var temp = getValue(SHEETS["STUDENTS"], Number(split[1]) + 1, 1);
  if (temp != "") {
    sendMessage(chatId, "This ID is occupied!");
    return;
  }
  setValue(SHEETS["STUDENTS"], Number(split[1]) + 1, 1, chatId);
  setValue(SHEETS["STUDENTS"], Number(split[1]) + 1, 2, username);
  sendMessage(chatId, "Successful registration!");
}

function setValue(sheetNumber, height, width, value) {
  SPREADSHEET.getSheets()[sheetNumber].getRange(height, width).setValue(value);
}

function getValue(sheetNumber, height, width) {
  return SPREADSHEET.getSheets()[sheetNumber].getRange(height, width).getValue();
}

function getHeight(chatId) {
  var it = 2;
  while (it != 100) {
    if (String(getValue(SHEETS["STUDENTS"], it, 1)) == String(chatId)) {
      return it;
    }
    it++;
  }
  return null;
}

function makeLog(message, username) {
  var height = getValue(SHEETS["LOGGER"], 1, 5);
  setValue(SHEETS["LOGGER"], 1, 5, height + 1);
  height += 2;
  setValue(SHEETS["LOGGER"], height, 1, username);
  setValue(SHEETS["LOGGER"], height, 2, Date());
  setValue(SHEETS["LOGGER"], height, 3, message);
}

function sendMessage(chatId, message) {
  var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': message,
          'parse_mode': 'HTML'
        }     
        var data = {
          "method": "post",
          "payload": payload
        }
        var API_TOKEN = 'YOUR_TOKEN'
        UrlFetchApp.fetch('https://api.telegram.org/bot' + API_TOKEN + '/', data);
}
