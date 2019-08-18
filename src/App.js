import React, { Component } from 'react';

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const X = 'X'
const O = 'O'
const DELAY_MOVES = 800
const DELAY_RESET = 3000

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function calculateWinner(squares) {
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function delay(time){
  return new Promise((resolve) => setTimeout(resolve, time))  
}


 // Called for computers turn. 
 // Return the first 'line' index that has two of the same symbol
 function findLineWithTwoSymbols(squares, symbol){
  
  let result
  
  for (let i = 0; i < lines.length; i++) {
    let symbolCount = 0
    let emptyCount = 0
    let line = lines[i]
    
    for (let j = 0; j < line.length; j++) {
      
      if ( squares[line[j]] === symbol ){
        symbolCount = symbolCount + 1
      }

      if ( !squares[line[j]] ){
        emptyCount = emptyCount + 1
      }
      
    }
    
    // return first
    if ( symbolCount === 2 && emptyCount === 1) {
        result =  i
        break
    }
  }
  return result
}

function findFirstEmptyIndex(squares, indexes){
  let result
  if( indexes && indexes.length > 0) {
    for (let idx = 0; idx < indexes.length; idx++) {
      if( !squares[indexes[idx]]){
        result = indexes[idx]
        break;
      }
    }
  }
  return result
}

class Board extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      squares: Array(9).fill(null),
      userSymbol: O,
      isUserTurn: true
    }
    this.squareClickHandler = this.squareClickHandler.bind(this)
    this.symbolChangeHandler = this.symbolChangeHandler.bind(this)
    this.getNext = this.getNextSymbol.bind(this)
    this.computersTurn = this.computersTurn.bind(this)
    this.getRandomEmptySquare = this.getRandomSquare.bind(this)
    this.turnsTaken = this.turnsTaken.bind(this)
    this.resetBoard = this.resetBoard.bind(this)
  }

  computersTurn(){
    
    let moveIndex;
    delay(DELAY_MOVES)
    .then(() => {
     
      if (calculateWinner(this.state.squares)) {
        return;
      }

      const xLineIndex = findLineWithTwoSymbols(this.state.squares, X)
      const oLineIndex = findLineWithTwoSymbols(this.state.squares, O)
      
      if( xLineIndex ) {  
        moveIndex = findFirstEmptyIndex(this.state.squares, lines[xLineIndex])

      } else if ( oLineIndex ){
        moveIndex = findFirstEmptyIndex(this.state.squares, lines[oLineIndex])
      }
    
      if( !moveIndex ) {
        moveIndex = this.getRandomSquare()
      }
  
      const ns = this.state.squares.slice()
      const isUserTurn = true
      ns[moveIndex] = this.getNextSymbol()
      this.setState({squares: ns, isUserTurn})
    })
  }


  symbolChangeHandler(event){
    const currUserSymbol = this.state.userSymbol
    const newUserSymbol = currUserSymbol === X ? O : X
    this.resetBoard(newUserSymbol)
  }

  squareClickHandler(idx) {
    if (calculateWinner(this.state.squares) || this.state.squares[idx] || !this.state.isUserTurn) {
      return;
    }
    const ns = this.state.squares.slice()
    const isUserTurn = false
    ns[idx] = this.getNextSymbol()
    this.setState({squares: ns, isUserTurn})
    this.computersTurn()
  }

  renderSquare(idx) {
    return <Square value={this.state.squares[idx]} clickHandler={() => this.squareClickHandler(idx)} />
  }
  
  
  getNextSymbol(){
    let nextSymbol
    if( this.state.isUserTurn ){
      nextSymbol = this.state.userSymbol
    } else {
      nextSymbol = this.state.userSymbol === X ? O : X
    }
    return nextSymbol
  }

  getRandomSquare(){
    let emptyIndexes = [] 
    for (let idx = 0; idx < this.state.squares.length; idx++) {
      if (!this.state.squares[idx]){
        emptyIndexes.push(idx)
      }
    } 
    return emptyIndexes[getRandomInt(0,emptyIndexes.length)]
  }

  
  turnsTaken(){
    return this.state.squares.reduce((acc,curr) => {
      if(curr){
        return acc + 1
      } else {
        return acc
      }
    }, 0)
  }

  resetBoard(userSymbol) {
     let update = {
      squares: Array(9).fill(null),
      isUserTurn: true
    }
    if( userSymbol ){
      update.userSymbol = userSymbol
    }
    this.setState(update)
  }

  render() {
    const winner = calculateWinner(this.state.squares)
    const turns = this.turnsTaken()
    let message;
    if( winner ){
      message = 'Winner ' + winner
      delay(DELAY_RESET).then(() => {
        this.resetBoard()
      })
    } else if (turns === this.state.squares.length) {
      message = 'Game Tied'
      delay(DELAY_RESET).then(() => {
        this.resetBoard()
      })
    } else {
      message = `Next player: ${this.getNextSymbol()}`
    }

    return (
      <div>
        <div>{message}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <br />
        <SelectSymbol symbol={this.state.userSymbol} changeHandler={this.symbolChangeHandler}/>
      </div>
    )
  }
}

const Square = (props) => {
  return (<button onClick={props.clickHandler} className="square">{props.value}</button>)
}

const SelectSymbol = (props) => {
  return (
    <div onChange={props.changeHandler}>
      <div><input type="radio" value="X" name="userSymbol" defaultChecked={props.symbol === X}  />I am X </div> 
      <div><input type="radio" value="O" name="userSymbol" defaultChecked={props.symbol === O}  />I am O</div>
    </div>
    )
}

class App extends Component {
  render() {
    return (
      <div>
        <Board />        
      </div>
    );
  }
}

export default App;
