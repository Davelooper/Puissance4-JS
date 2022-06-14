/**
 * @param {HTMLDivElement} gameElement The element containing the div
 * @param {Object} options The options choosed by the user
 * @param {Object} [options.grid] The options containing the number of rows and columns
 * @param {Object} [options.grid.rows] 
 * @param {Object} [options.grid.columns] 
 * @param {Array} [options.players] The colors of the players (max 4 players)
 * @param {HTMLCanvasElement} canvas The canvas displaying the game
 * @param {Array} grid The coordinates of each squares of the game and if this square is empty
 * @param {Array} circlesCoordinates The coordinates of the centers of circles to draw depending of them squares. It's usefull to draw the coins.
 * @param {Int} radius The radius of the white round inside the blue grid which containing the coins
 * @param {String} currentPlayerColor The color of the current player
 */
class Power4 {

    constructor(gameElement, menuElement, options = {}) {
        
        this.gameElement = gameElement
        this.menuElement = menuElement
        this.options = {
            grid: { rows: 6, columns: 7 },
            players: ["yellow", "red"],
            ...options

        }
        this.canvas = document.createElement('canvas')
        this.canvasWidth = this.options.grid.columns * 100
        this.canvasHeight = this.options.grid.rows * 100
        this.columnWidth = this.canvasWidth / this.options.grid.columns
        this.rowHeight = this.canvasHeight / this.options.grid.rows
        this.grid = this.generateGrid()
        this.circlesCoordinates = []
        this.radius = this.columnWidth / 4
        this.currentPlayer = this.options.players[0]
        this.currentPlayerColor = this.options.players[0].color
        this.strokesAccount = 0
        this.addCanvasInGameElement()
        this.setCanvasSize()
        this.drawGrid()
        this.generateGrid()

        this.canvas.addEventListener("click", (e) => {

            const column = this.getClickedColumn(e)
            const squaresOfColumn = this.getSquaresOfColumn(column, this.grid)
            const row = this.getRow(squaresOfColumn)
            const squareCoordinates = this.getSquareCoordinates(squaresOfColumn, row)
            const circleCoordinates = this.getCircleCoordinates(squareCoordinates.x, squareCoordinates.y, this.circlesCoordinates)

            this.setCoinInGrid(squareCoordinates.x, squareCoordinates.y, this.currentPlayerColor, this.grid)
            this.drawCoin(circleCoordinates.posX, circleCoordinates.posY, this.currentPlayerColor)

            const rowToTest = this.getRowToTest(squareCoordinates.x, squareCoordinates.y, this.grid)
            const columnToTest = this.getComlumnToTest(squareCoordinates.x, squareCoordinates.y, this.grid)
            const diagonale1ToTest = this.getDiagonale1ToTest(squareCoordinates.x, squareCoordinates.y, this.grid)
            const diagonale2ToTest = this.getDiagonale2ToTest(squareCoordinates.x, squareCoordinates.y, this.grid)
            const winner = this.checkForWinner(columnToTest, rowToTest, diagonale1ToTest, diagonale2ToTest, this.currentPlayer)

            if (winner) {

                this.displayRestartMenu(this.gameElement, winner)

            } else {

                this.strokesAccount++
                const draw = this.checkForDraw(this.strokesAccount, this.options.grid.rows, this.options.grid.columns)

                if (draw) {

                    this.displayRestartMenu(this.gameElement)

                }
            }
            

            this.setNextPlayer(this.currentPlayer, this.options.players)
            this.setNextPlayerColor(this.currentPlayer)
        })
    }

    addCanvasInGameElement() {

        this.gameElement.appendChild(this.canvas)

    }

    setCanvasSize() {

        this.canvas.width = this.canvasWidth
        this.canvas.height = this.canvasHeight

    }

    drawGrid() {

        const r = this.columnWidth / 4
        const context = this.canvas.getContext("2d")


        // Rectangle bleu
        context.beginPath()
        context.fillStyle = "#B07941"
        context.lineWidth = "10"
        context.rect(0, 0, this.canvasWidth, this.canvasHeight)
        context.fill()
        context.closePath()



        // Cercles
        for (let i = 0; i < this.canvasWidth / this.columnWidth; i++) {

            let l = this.canvasHeight / this.rowHeight - 1

            for (let j = 0; j < this.canvasHeight / this.rowHeight; j++) {

                const offsetX = 2 * this.radius
                const offsetY = 2 * this.radius
                const posX = offsetX + (i * this.columnWidth)
                const posY = offsetY + (j * this.rowHeight)

                context.beginPath()
                context.fillStyle = "white"
                context.arc(posX, posY, this.radius, 0, Math.PI * 2, false)
                context.fill()

                this.circlesCoordinates.push({ x: i, y: l, posX: posX, posY: posY })
                l--
            }
        }
    }

    getClickedColumn(event) {

        const rect = this.canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const columnsCoordinates = this.generateColumnsCoordinates()

        for (let i = 0; i < columnsCoordinates.length; i++) {

            if (columnsCoordinates[i] > x) {

                return i

            }

        }

    }

    generateColumnsCoordinates() {

        let coordinates = []

        for (let i = 1; i <= this.options.grid.columns; i++) {

            coordinates = [...coordinates, this.columnWidth * i]
        }

        return coordinates
    }

    generateGrid() {

        let output = []

        for (let i = 0; i < this.options.grid.rows; i++) {

            for (let j = 0; j < this.options.grid.columns; j++) {

                output.push({
                    x: j,
                    y: i,
                    coin: null
                })
            }
        }

        return output

    }

    /**
     * 
     * @param {Array} column The coordinates of each squares of 
     * the clicked column
     * @returns 
     */
    getRow(column) {

        let i = 0;

        column.forEach(el => {

            if (el.coin != null) {

                i++
            }
        })

        return i;
    }

    /**
     * Get all squares of a column from the grid.
     */
    getSquaresOfColumn(columnNumber, grid) {

        let output = []

        grid.forEach((el) => {

            if (el.x == columnNumber) {

                output = [...output, el]

            }
        })

        return output
    }

    /**
     * 
     * @param {Array} squaresOfColumns 
     * @param {*} row 
     * @returns Return an object of type {x: x, y: y} containing 
     * the coordinates of the square in which the coin must be add.
     */
    getSquareCoordinates(squaresOfColumns, row) {

        let squareCoordinates = {}

        squaresOfColumns.forEach(el => {

            if (el.y == row) {

                squareCoordinates = el

            }
        })

        return { x: squareCoordinates.x, y: squareCoordinates.y }

        this.drawCoin(coinCoordinates.posX, coinCoordinates.posY, this.currentPlayerColor)
    }

    /**
     * Set the color of the coin in the grid game
     * @param {*} squareCoordinateX 
     * @param {*} squareCoordinateY 
     * @param {*} playerColor 
     */
    setCoinInGrid(squareCoordinateX, squareCoordinateY, playerColor, grid) {

        for (const square of grid) {

            if (square.x == squareCoordinateX && square.y == squareCoordinateY) {

                square.coin = playerColor

            }
        }
    }

    drawCoin(posX, posY, color) {

        const context = this.canvas.getContext("2d")

        context.beginPath()
        context.fillStyle = color
        context.arc(posX, posY, this.radius, 0, Math.PI * 2, false)
        context.fill()
    }

    setNextPlayer(currentPlayer, players) {

        let index = players.indexOf(currentPlayer)
        
        index++

        if (index > players.length - 1) {

            this.currentPlayer = players[0]
            return

        }

        this.currentPlayer = players[index]
    }

    setNextPlayerColor(currentPlayer) {

        this.currentPlayerColor = this.currentPlayer.color

    }

    /**
     * 
     * @param {Int} x The column of the circle to draw
     * @param {Int} y The row of the circle to draw
     * @param {Array} coinsCoordinates The coordinates of the center of all circles of the grid
     * @returns The coordinates of the circle to draw
     */
    getCircleCoordinates(x, y, circlesCoordinates) {

        for (const coordinates of circlesCoordinates) {

            if (coordinates.x == x && coordinates.y == y) return { posX: coordinates.posX, posY: coordinates.posY }

        }
    }

    /**
     * 
     * @param {Int} x The column of the wanted square
     * @param {Int} y The rowe of the wanted square
     * @param {Array} grid The grid containing all rows
     * @returns 
     */
    getSquare(x, y, grid) {

        for (const square of grid) {

            if (square.x == x && square.y == y) {

                return square

            }
        }
    }

    /**
     * Return an array containing all squares to check the column axe.
     * There are 3 squares below the played square and 3 squares above. 
     * 
     * @param {Int} squareX The column number of the played square
     * @param {*} squareY The row number of the played square
     * @param {*} grid 
     * @returns 
     */
    getComlumnToTest(squareX, squareY, grid) {

        let output = []
        const x = squareX

        for (let i = -3; i <= 3; i++) {

            const y = squareY + i
            const currentSquare = this.getSquare(x, y, grid)

            if (currentSquare) {

                output.push(currentSquare)

            }
        }

        return output
    }

    /**
     * Return an array containing all squares to check the row axe.
     * There are 3 squares on the left of the played square and 3 squares on the right. 
     * 
     * @param {Int} squareX The column number of the played square
     * @param {*} squareY The row number of the played square
     * @param {*} grid 
     * @returns 
     */
    getRowToTest(squareX, squareY, grid) {

        let output = []
        const y = squareY

        for (let i = -3; i <= 3; i++) {

            const x = squareX + i
            const currentSquare = this.getSquare(x, y, grid)

            if (currentSquare) {

                output.push(currentSquare)

            }
        }

        return output
    }

    /**
     * Return an array containing all squares to check the diagonale 
     * from bottom left to up right axe.
     * There are 3 squares on the bottom left of the played square and 3 squares on the up right. 
     * 
     * @param {Int} squareX The column number of the played square
     * @param {*} squareY The row number of the played square
     * @param {*} grid 
     * @returns 
     */
    getDiagonale1ToTest(squareX, squareY, grid) {

        let output = []

        for (let i = -3; i <= 3; i++) {

            const x = squareX + i
            const y = squareY + i
            const currentSquare = this.getSquare(x, y, grid)

            if (currentSquare) {

                output.push(currentSquare)

            }
        }

        return output
    }

    /**
     * Return an array containing all squares to check the diagonale 
     * from bottom right to up left axe.
     * There are 3 squares on the bottom right of the played square and 3 squares on the up left. 
     * 
     * @param {Int} squareX The column number of the played square
     * @param {*} squareY The row number of the played square
     * @param {*} grid 
     * @returns 
     */
    getDiagonale2ToTest(squareX, squareY, grid) {

        let output = []

        for (let i = -3; i <= 3; i++) {

            const x = squareX + i
            const y = squareY - i
            const currentSquare = this.getSquare(x, y, grid)

            if (currentSquare) {

                output.push(currentSquare)

            }
        }

        return output
    }

    /**
     * Test if a column contain 4 coin of the same color.
     * Return true if yes.
     * Return false if no.
     * @param {Array} columnToTest See the function getColumnToTest of this class for more informations.
     * @param {String|null} playerColor The color of the player
     * @returns 
     */
    testColumn(columnToTest, playerColor) {

        let i = 0

        for (const square of columnToTest) {

            if (square.coin == playerColor) {

                i++

            } else {

                i = 0

            }

            if (i == 4) {

                return true

            }
        }

        return false

    }

    /**
     * Test if a row contain 4 coin of the same color.
     * Return true if yes.
     * Return false if no.
     * @param {Array} rowToTest See the function getRowToTest of this class for more informations.
     * @param {String|null} playerColor 
     * @returns 
     */
    testRow(rowToTest, playerColor) {

        let i = 0

        for (const square of rowToTest) {

            if (square.coin == playerColor) {

                i++

            } else {

                i = 0

            }

            if (i == 4) {

                return true

            }
        }

        return false

    }

    /**
     * Test if a diagonale 1 contain 4 coin of the same color.
     * Return true if yes.
     * Return false if no.
     * @param {Array} diagonale1ToTest See the function getDiagonale1ToTest of this class for more informations.
     * @param {String|null} playerColor 
     * @returns 
     */
    testDiagonale1(diagonale1ToTest, playerColor) {

        let i = 0

        for (const square of diagonale1ToTest) {

            if (square.coin == playerColor) {

                i++

            } else {

                i = 0

            }

            if (i == 4) {

                return true

            }
        }

        return false

    }

    /**
     * Test if a diagonale 2 contain 4 coin of the same color.
     * Return true if yes.
     * Return false if no.
     * @param {Array} diagonale2ToTest See the function getDiagonale2ToTest of this class for more informations.
     * @param {String|null} playerColor 
     * @returns 
     */
    testDiagonale2(diagonale2ToTest, playerColor) {

        let i = 0

        for (const square of diagonale2ToTest) {

            if (square.coin == playerColor) {

                i++

            } else {

                i = 0

            }

            if (i == 4) {

                return true

            }
        }

        return false

    }

    /**
     * Return true if there is a winner.
     * Return false if not.
     */
    checkForWinner(columnToTest, rowToTest, diagonale1ToTest, diagonale2ToTest, currentPlayer) {

        const rowResult = this.testRow(rowToTest, currentPlayer.color)
        const columnResult = this.testColumn(columnToTest, currentPlayer.color)
        const diagonale1result = this.testDiagonale1(diagonale1ToTest, currentPlayer.color)
        const diagonale2result = this.testDiagonale2(diagonale2ToTest, currentPlayer.color)

        return rowResult || columnResult || diagonale1result || diagonale2result ? currentPlayer : false
    }

    generateRestartMenu(winner = false) {

        const restartMenu = document.createElement("div")
        const restartButton = this.generateRestartButton()

        restartMenu.className = "game__restartMenu"


        if (winner) {

            const winMessage = this.generateWinMessage(winner)

            restartMenu.appendChild(winMessage)
            restartMenu.appendChild(restartButton)

            return restartMenu

        } else {

            const drawMessage = this.generateDrawMessage()


            restartMenu.appendChild(drawMessage)
            restartMenu.appendChild(restartButton)

            return restartMenu
        }

        

        return restartMenu

    }

    generateRestartButton() {

        const button = document.createElement("button")

        button.className = "game__restartBtn"
        button.textContent = "Nouvelle partie"

        button.addEventListener("click", () => {

            while (this.gameElement.lastElementChild) {

                this.gameElement.removeChild(this.gameElement.lastElementChild)

            }

            this.gameElement.classList.remove("showed")
            this.menuElement.classList.remove("hidden")
        })

        return button
    }

    generateWinMessage(winner) {

        const alert = document.createElement("p")
        const translatedColor = this.translateColor(winner.color)

        alert.className = "game__winMessage"
        alert.textContent = `Le joueur ${translatedColor} gagne la partie !`

        return alert

    }

    generateDrawMessage() {

        const alert = document.createElement("p")

        alert.className = "game__drawMessage"
        alert.textContent = `C'est un match nul !`

        return alert
    }

    displayRestartMenu(gameElement, winner = false) {

        const restartMenu = this.generateRestartMenu(winner)

        gameElement.insertBefore(restartMenu, gameElement.firstElementChild)
    }

    translateColor(color) {

        switch (color) {
            case "yellow":
                return "Jaune"
            case "red":
                return "Rouge"
            case "green":
                return "Vert"
            case "purple":
                return "Violet"
            default:
                console.error("Erreur, couleur inconnue.")
        }
    }

    checkForDraw(strokesAccount, rowAccount, columnAccount) {

        return strokesAccount >= rowAccount * columnAccount ? true : false

    }

}

function getSelectedColors(selectedOptions, allowedColors) {

    let optionsColors = []


    for (const option of selectedOptions) {

        if (allowedColors.includes(option.value)) {

            optionsColors.push(option.value)

        }

    }

    return optionsColors
}

function insertOptions(elementToInsert, optionsToInsert) {

    elementToInsert.innerHTML = ""
    
    for (let i = 0; i < optionsToInsert.length; i++) {

        const element = optionsToInsert[i];

        if (element) elementToInsert.appendChild(element)
        
    }
}

function translateColor(color) {

    switch (color) {
        case "yellow":
            return "Jaune"
        case "red":
            return "Rouge"
        case "green":
            return "Vert"
        case "purple":
            return "Violet"
        default:
            console.error("Erreur, couleur inconnue.")
    }
}

function generateAvailableOptions(selectedColors, allowedColors, className) {

    let options = []

    for (const color of allowedColors) {

        if (!selectedColors.includes(color)) {

            const option = document.createElement("option")

            option.value = color
            option.className = className + " " + className + "--" + color
            option.textContent = translateColor(color)

            options.push(option)
        }
    }

    return options
}

function generateDefaultOption(className) {

    const option = document.createElement("option")

    option.textContent = "Choisissez une couleur"
    option.className = className + " " + className + "--default"
    option.value = ""

    return option
}

function generateOptions(currentOption, className, availableOptions) {

    let options = []

    if (isOptionalPlayer(className)) {
        
        const defaultOption = generateDefaultOption()
        
        if (currentOption.classList[1].slice(-1) == "t" ) { //If selected option is default option

            options = [currentOption, ...availableOptions]

        } else {

            options = [currentOption, ...availableOptions, defaultOption]

        }


    } else {

        options = [currentOption, ...availableOptions]
       
    }

    return options
}

function isOptionalPlayer(className) {

    return className.slice(-1) == 3 || className.slice(-1) == 4 ? true : false
        
}

function handlePlayersSelects(playersSelects) {

    for (const select of playersSelects) {

        select.addEventListener("change", function (e) {

            
            const selectedOptions = document.querySelectorAll('option:checked')
            const selectedColors = getSelectedColors(selectedOptions, allowedColors)

            for (const select2 of playersSelects) {

                const className = select2.classList[1]
                const currentSelectedOption = document.querySelector(`.${className}>option:checked`)
                const selectedOptionClassName = currentSelectedOption.classList[0]
                const availableOptions = generateAvailableOptions(selectedColors, allowedColors, selectedOptionClassName)
                const optionsToInsert = generateOptions(currentSelectedOption, className, availableOptions)
                
                insertOptions(select2, optionsToInsert, currentSelectedOption)
            }
        })
    }
    getPlayersOptions()
}

function getPlayersOptions() {

    let playersOptions = []
    const selectPlayers = [
        document.querySelector(".selectplayers__select--1 > option:checked"),
        document.querySelector(".selectplayers__select--2 > option:checked"),
        document.querySelector(".selectplayers__select--3 > option:checked"),
        document.querySelector(".selectplayers__select--4 > option:checked")
    ]

    for (let i = 1; i <= selectPlayers.length; i++) {

        const element = selectPlayers[i-1];

        if (element.value) {
            
            playersOptions.push({

                [`color`]: element.value

            })
        }
    }

    return playersOptions


}

function getGrid(rowInput, columnInput) {

    const output = {
        "row": 6,
        "column": 7 
    }

    if (rowInput.value > 30 && rowInput.value < 6) {
        
        return output

    } else if (rowInput.value > 30 && rowInput.value < 7) {

        return output

    }

    output.rows = rowInput.value
    output.columns = columnInput.value

    return output
}

function getOpts() {
    
    let options = {}

    options.grid = getGrid(document.getElementById("row"), document.getElementById("column"))
    options.players = getPlayersOptions()

    return options
    
}

function handleMenuHide(menu, options) {

    menu.classList.add("tohide")
    setTimeout(() => {

        menu.classList.remove("tohide")
        menu.classList.add("hidden")
        handleGameShow(document.querySelector('.game'), menu, options)

    }, 700)
}

function handleGameShow(gameElement, menuElement, options) {

    new Power4(gameElement, menuElement, options)
    gameElement.classList.add("showed")
}

const allowedColors = ["red", "yellow", "green", "purple"]
const selectedOptions = document.querySelectorAll('options:checked')
const playersSelects = document.querySelectorAll("select.selectplayers__select")
const submitBtn = document.querySelector("button.menu__play")

handlePlayersSelects(playersSelects)

submitBtn.addEventListener("click", function() {

    const options = getOpts()
    const menu = document.getElementsByClassName("menu")[0]
    handleMenuHide(menu, options)

})





