function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
	  if (metadata.won) {
        self.message(true); // You win!
      }
	  else if (metadata.over) {
        self.message(false); // You lose
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text = new Array(18);
  text[0] = " ";
  text[1] = "翻云<br>寨主";
  text[2] = "藤妖";
  text[3] = "噬月<br>玄帝";
  text[4] = "叶<br>沉香";
  text[5] = "雷严";
  text[6] = "金<br>蛟翦";
  text[7] = "鲲鹏";
  text[8] = "悭臾";
  text[9] = "陵端";
  text[10] = "梼杌";
  text[11] = "蛊雕";
  text[12] = "巫姑";
  text[13] = "紫胤<br>真人";
  text[14] = "暗云<br>奔霄";
  text[15] = "欧阳<br>少恭";
  text[16] = " ";
  
  var self = this;

  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }
  
  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 65536) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt = new Array(14);
  mytxt[0]="小子，那些人值得你为他们卖命吗？";
  mytxt[1]="晋磊！拿命来！";
  mytxt[2]="少恭，你还嫩了点！";
  mytxt[3]="我很黄！我很暴力！";
  mytxt[4]="无异，快把你家馋鸡带走！";
  mytxt[5]="吾友，你弱了！";
  mytxt[6]="我甩发，我自信！";
  mytxt[7]="擅闯青玉坛者死！";
  mytxt[8]="擅闯幽都者死！";
  mytxt[9]="你还是乖乖留在幽都吧！";
  mytxt[10]="徒儿，随为师回山！";
  mytxt[11]="挣扎吧，在血和暗的深渊里！";
  mytxt[12]="我要把你们全部化为焦冥……";
  
  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "恭喜你打败了欧阳少恭！" : mytxt[text3(maxscore)-2];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var text = "我在2048古剑版中得了" + this.score + "分 , 你能得多少分？";
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "http://service.weibo.com/share/share.php?url=http://bjdc.github.io/egg&title="+text); 
  tweet.textContent = "分享到微博";

  return tweet;
};
