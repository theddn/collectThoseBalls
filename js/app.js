'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'
const BALL_SOUND = new Audio('sound/game-ball-tap.wav')

// Model:
var gBoard
var gGamerPos
var gBallCounter
var gIsGlued
var gBallInterval
var gGlueInterval

function initGame() {
	document.querySelector('.restart-btn').hidden = true
	gIsGlued = false
	gGamerPos = { i: 2, j: 9 }
	gBallCounter = 0
	gBoard = buildBoard()
	renderBoard(gBoard)

	gBallInterval = setInterval(addBall, 5000)
	gGlueInterval = setInterval(addGlue, 5000)

}

function checkVictory() {
	if (gBallCounter > 0) return
	clearInterval(gBallInterval)
	document.querySelector('.restart-btn').hidden = false
} 

function ballsCount(diff) {
	gBallCounter += diff
	document.querySelector('h2 span').innerText = gBallCounter
}

function getEmptyCells() {
	const emptyCells = []

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
				emptyCells.push({ i, j })
			}
		}
	}

	return emptyCells[getRandomInt(0, emptyCells.length - 1)]
}

function addBall() {
	const emptyCell = getEmptyCells()
	if (!emptyCell) return
	//model
	gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
	//dom
	renderCell(emptyCell, BALL_IMG)
	ballsCount(1)

}
function addGlue() {
	const emptyCell = getEmptyCells()
	if (!emptyCell) return
	gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
	renderCell(emptyCell, GLUE_IMG)

	setTimeout(() => {
		if (gIsGlued) return
		gBoard[emptyCell.i][emptyCell.j].gameElement = null
		renderCell(emptyCell, '')

	}, 3000)
}
function buildBoard() {
	const board = createMat(10, 12)

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[i].length - 1) {
				board[i][j] = { type: WALL, gameElement: null }
			} else {
				board[i][j] = { type: FLOOR, gameElement: null }
			}
		}
	}

	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	board[6][6].gameElement = BALL
	board[3][3].gameElement = BALL
	ballsCount(2)
	// console.log(board)

	return board
}

// Render the board to an HTML table
function renderBoard(board) {

	const elBoard = document.querySelector('.board')
	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j]

			var cellClass = getClassName({ i, j })

			if (currCell.type === FLOOR) cellClass += ' floor'
			else if (currCell.type === WALL) cellClass += ' wall'

			// strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n'
			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '</td>\n'
		}
		strHTML += '</tr>\n'
	}
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlued) return
	const fromCell = gBoard[gGamerPos.i][gGamerPos.j]
	const toCell = gBoard[i][j]

	if (toCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	const iAbsDiff = Math.abs(i - gGamerPos.i)
	const jAbsDiff = Math.abs(j - gGamerPos.j)

	// If the clicked Cell is one of the four allowed

	// if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
	if (iAbsDiff + jAbsDiff === 1) {

		if (toCell.gameElement === BALL) {
			ballsCount(-1)
			BALL_SOUND.play()
			checkVictory()
		} else if (toCell.gameElement === GLUE) {
			gIsGlued = true

			setTimeout(() => {
				gIsGlued = false
			}, 4000)

		}

		// TODO: Move the gamer

		// Model - origin
		fromCell.gameElement = null

		// DOM - origin
		renderCell(gGamerPos, '')

		// Model - destination
		toCell.gameElement = GAMER

		// DOM - destination
		renderCell({ i, j }, GAMER_IMG) // { i: i, j: j }

		// Model = gGamerPos
		gGamerPos = { i, j }


	} else console.log('Bad Move', iAbsDiff, jAbsDiff)
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function handleKey(event) {
	const i = gGamerPos.i
	const j = gGamerPos.j

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(position) {
	const cellClass = `cell-${position.i}-${position.j}`

	return cellClass
}





