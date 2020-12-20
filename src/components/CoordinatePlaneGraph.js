import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import JXGBoard from 'jsxgraph-react-js';
import ParserTool from 'expr-eval';

const useStyles = makeStyles((theme) => ({
    container: {
      marginTop: theme.spacing(2),
  },
}));

export default function CoordinatePlaneGraph({expressionToGuess, guessedEquation, blankboard }) {
    const classes = useStyles();
    const Parser = ParserTool.Parser;
    const parser = new Parser();
    let expr = null;
    let expr2 = null; 
    let guessFunction = null;
    let functionToGuess = null;

    try {
      expr = parser.parse(expressionToGuess);
      functionToGuess = expr.toJSFunction("x");
      expr.evaluate({x:0});
    } catch (error) {

    }

    try {
      expr2 = parser.parse(guessedEquation);
      guessFunction = expr2.toJSFunction("x");
      expr2.evaluate({x:0});
    } catch (error) {

    }


    let logic = blankboard ? 
      (board) => {
        board.suspendUpdate();
        board.unsuspendUpdate();
      } 
      :
      (board) => {
        board.suspendUpdate();
        // eslint-disable-next-line
        let currentEquation = functionToGuess ? board.create('functiongraph', [functionToGuess], {
          strokeWidth: 2, 
          strokecolor:'blue',
        }) : null;

        // eslint-disable-next-line
        let guessEquation = guessFunction ? board.create('functiongraph', [guessFunction], {
          strokeWidth: 2, 
          strokecolor:'red',
        }) : null;

        /*
        let differenceGraph = guessFunction ? board.create('functiongraph', [function(x) {
          return Math.abs(functionToGuess(x) - guessFunction(x));
        }]) : null;
        */

        // eslint-disable-next-line
        //let difference = guessFunction ? board.create('integral', [[-5, 5], differenceGraph]) : null;
        
        board.unsuspendUpdate();
      };

    let boundingBox = guessFunction ? [-10, 20, 10, -20] : [-10, 20, 10, -20];

    return (
      <div className={classes.container}>
        <JXGBoard
          key={expressionToGuess + guessedEquation + blankboard}
          logic={logic}
          boardAttributes={{ 
            boundingbox: boundingBox, 
            axis:true,
            showNavigation:false,
            showZoom: false,
            showCopyright: false,
          }}
          style={{
            border: "1px solid black",
            height: '400px',
            width: '400px'
          }}
        />
      </div>
    );
}
