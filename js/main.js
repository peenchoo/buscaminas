/*----- constants -----*/
var bombImage = '<img src="images/bomb.png">';
var flagImage = '<img src="images/flag.png">';
var wrongBombImage = '<img src="images/wrong-bomb.png">'
var sizeLookup = {
  '9': { totalBombs: 10, tableWidth: '245px' },
  '16': { totalBombs: 40, tableWidth: '420px' },
  '30': { totalBombs: 160, tableWidth: '794px' }
};
var colors = [
  '',
  '#0000FA',
  '#4B802D',
  '#DB1300',
  '#202081',
  '#690400',
  '#457A7A',
  '#1B1B1B',
  '#7A7A7A',
];

/*----- app's state (variables) -----*/
var size = 16;
var board;
var bombCount;
var timeElapsed;
var adjBombs;
var hitBomb;
var elapsedTime;
var timerId;
var winner;
var boardCode;
var codigoIntroducido;

/*----- cached element references -----*/
var boardEl = document.getElementById('board');
var codeSpace = document.getElementById('board-code');
var enviar = document.getElementById('enviar');
var copyBtn = document.getElementById('copy-btn');


/*----- event listeners -----*/
document.getElementById('size-btns').addEventListener('click', function (e) {
  size = parseInt(e.target.id.replace('size-', ''));
  init();
  render();
});

document.addEventListener('DOMContentLoaded', function () {
  enviar.addEventListener('click', function (event) {
    // Prevenir el comportamiento por defecto del botón
    event.preventDefault();
    codigoIntroducido = document.getElementById('codigo').value;
    console.log(codigoIntroducido);
    init2();
    render();

  });

  copyBtn.addEventListener('click', copyToClipboard);
});

boardEl.addEventListener('click', function (e) {
  if (winner || hitBomb) return;
  var clickedEl;
  clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (clickedEl.classList.contains('game-cell')) {
    if (!timerId) setTimer();
    var row = parseInt(clickedEl.dataset.row);
    var col = parseInt(clickedEl.dataset.col);
    var cell = board[row][col];
    if (e.shiftKey && !cell.revealed && bombCount > 0) {
      bombCount += cell.flag() ? -1 : 1;
    } else {
      hitBomb = cell.reveal();
      if (hitBomb) {
        revealAll();
        clearInterval(timerId);
        e.target.style.backgroundColor = 'red';
      }
    }
    winner = getWinner();
    render();
  }
});

function copyToClipboard() {
  navigator.clipboard.writeText(boardCode);
}

function createResetListener() {
  document.getElementById('reset').addEventListener('click', function () {
    init();
    render();
  });
}

/*----- functions -----*/
function setTimer() {
  timerId = setInterval(function () {
    elapsedTime += 1;
    document.getElementById('timer').innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
};

function revealAll() {
  board.forEach(function (rowArr) {
    rowArr.forEach(function (cell) {
      cell.reveal();
    });
  });
};
function buildCodeSpace(boardCode) {
  var showCode = `
  <tr>
    <td><strong>Código de este tablero</strong></td>
  </tr>
  <tr>
  <td class="menu" contenteditable readonly>${codeBoard}</td>
  </tr>
  `;
  codeSpace.innerHTML = showCode;
}
function buildTable() {
  var topRow = `
  <tr>
    <td class="menu" id="window-title-bar" colspan="${size}">
      <div id="window-title"><img src="images/mine-menu-icon.png"> Buscaminas</div>
      <div id="window-controls"><img src="images/window-controls.png"></div>
    </td>
  <tr>
    <td class="menu" id="folder-bar" colspan="${size}">
      <div id="folder1"><a href="https://www.google.com/search?q=a+llorar+a+la+lloreria&sxsrf=APwXEdeVBVyphRSpYhnq49NmFdOr-0QwbA:1683014785648&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjgz8zTltb-AhXoVKQEHRxbDIkQ_AUoAXoECAEQAw&biw=1368&bih=769&dpr=2#imgrc=9zmSPEugJL8LGM" target="blank">Ayuda </a></div>
    </td>
  </tr>
  </tr>
    <tr>
      <td class="menu" colspan="${size}">
          <section id="status-bar">
            <div id="bomb-counter">000</div>
            <div id="reset"><img src="images/smiley-face.png"></div>
            <div id="timer">000</div>
          </section>
      </td>
    </tr>
    `;
  boardEl.innerHTML = topRow + `<tr>${'<td class="game-cell"></td>'.repeat(size)}</tr>`.repeat(size);
  boardEl.style.width = sizeLookup[size].tableWidth;
  createResetListener();
  var cells = Array.from(document.querySelectorAll('td:not(.menu)'));
  cells.forEach(function (cell, idx) {
    cell.setAttribute('data-row', Math.floor(idx / size));
    cell.setAttribute('data-col', idx % size);
  });
}

function buildArrays() {
  var arr = Array(size).fill(null);
  arr = arr.map(function () {
    return new Array(size).fill(null);
  });
  return arr;
};

function buildCells() {
  board.forEach(function (rowArr, rowIdx) {
    rowArr.forEach(function (slot, colIdx) {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  addBombs();
  runCodeForAllCells(function (cell) {
    cell.calcAdjBombs();
  });
};

function buildCells2() {
  board.forEach(function (rowArr, rowIdx) {
    rowArr.forEach(function (slot, colIdx) {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  addBombs2();
  runCodeForAllCells(function (cell) {
    cell.calcAdjBombs();
  });
};

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
};

function init2() {
  buildTable();
  board = buildArrays();
  buildCells2();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
};

function getBombCount() {
  var count = 0;
  board.forEach(function (row) {
    count += row.filter(function (cell) {
      return cell.bomb;
    }).length
  });
  return count;
};

function addBombs() {
  var currentTotalBombs = sizeLookup[`${size}`].totalBombs;
  while (currentTotalBombs !== 0) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    var currentCell = board[row][col]
    if (!currentCell.bomb) {
      currentCell.bomb = true
      currentTotalBombs -= 1
    }

  }

  boardCode = "";
  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board[0].length; col++) {
      var currentCell = board[row][col];
      if (currentCell.bomb == true) {
        if(row < 10 && col < 10){
          boardCode = boardCode + '0' + row + '0' + col;
        }else if(row < 10 && col > 9){
          boardCode = boardCode + '0' + row + col;
        }else if(row > 9 && col < 10){
          boardCode = boardCode + row + '0' + col;
        }else{
        boardCode = boardCode + row + col;
        }
      }
    }
  }
  //buildCodeSpace(boardCode);
};

function addBombs2() {
  if (codigoIntroducido.length > 0) {
    for (let i = 0; i < codigoIntroducido.length; i += 4) {
      let x1 = codigoIntroducido[i];
      let x2 = codigoIntroducido[i + 1];
      let y1 = codigoIntroducido[i + 2];
      let y2 = codigoIntroducido[i + 3];
      let x = x1 + x2;
      let y = y1 + y2;
      let row = parseInt(x);
      let col = parseInt(y);
      var currentCell = board[row][col];
      currentCell.bomb = true;
    }
    boardCode = "";
    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[0].length; col++) {
        var currentCell = board[row][col];
        if (currentCell.bomb == true) {
          if(row < 10 && col < 10){
            boardCode = boardCode + '0' + row + '0' + col;
          }else if(row < 10 && col > 9){
            boardCode = boardCode + '0' + row + col;
          }else if(row > 9 && col < 10){
            boardCode = boardCode + row + '0' + col;
          }else{
          boardCode = boardCode + row + col;
          }
        }
      }
    }
    //buildCodeSpace(boardCode);
  }else{
    addBombs();
  }
};

function getWinner() {
  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board[0].length; col++) {
      var cell = board[row][col];
      if (!cell.revealed && !cell.bomb) return false;
    }
  }
  return true;
};

function render() {
  document.getElementById('bomb-counter').innerText = bombCount.toString().padStart(3, '0');
  var seconds = timeElapsed % 60;
  var tdList = Array.from(document.querySelectorAll('[data-row]'));
  tdList.forEach(function (td) {
    var rowIdx = parseInt(td.getAttribute('data-row'));
    var colIdx = parseInt(td.getAttribute('data-col'));
    var cell = board[rowIdx][colIdx];
    if (cell.flagged) {
      td.innerHTML = flagImage;
    } else if (cell.revealed) {
      if (cell.bomb) {
        td.innerHTML = bombImage;
      } else if (cell.adjBombs) {
        td.className = 'revealed'
        td.style.color = colors[cell.adjBombs];
        td.textContent = cell.adjBombs;
      } else {
        td.className = 'revealed'
      }
    } else {
      td.innerHTML = '';
    }
  });
  if (hitBomb) {
    document.getElementById('reset').innerHTML = '<img src=images/dead-face.png>';
    runCodeForAllCells(function (cell) {
      if (!cell.bomb && cell.flagged) {
        var td = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        td.innerHTML = wrongBombImage;
      }
    });
  } else if (winner) {
    document.getElementById('reset').innerHTML = '<img src=images/cool-face.png>';
    clearInterval(timerId);
  }
};

function runCodeForAllCells(cb) {
  board.forEach(function (rowArr) {
    rowArr.forEach(function (cell) {
      cb(cell);
    });
  });
}

init();
render();