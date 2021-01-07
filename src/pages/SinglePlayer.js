import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Typography,
    TextField,
    Button,
} from '@material-ui/core';
import CoordinatePlaneGraph from '../components/CoordinatePlaneGraph';
import ParserTool from 'expr-eval';
import get from '../universalHTTPRequests/get';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/NavBar';
import HelpButton from '../components/HelpButtonSinglePlayer';
import DropdownEquations from '../components/DropdownEquations';
import integrate from '../functions/integrate';

const useStyles = makeStyles((theme) => ({
    equationText: {
      marginTop: theme.spacing(1.8),
    },
    button: {
      margin: theme.spacing(1),
      textTransform: 'unset',
      height: '50px',
    },
    textfield: {
      '& > *': {
        margin: theme.spacing(1),
        width: '350px',
        height: '50px',
      },
    },
    container: {
      marginTop: theme.spacing(12),
      height: '100%',
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
    },
    copyright: {
        color: 'black',
        paddingBottom: theme.spacing(2),
        '@media (min-height:500px)': {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            bottom: '0px',
            width: '100%',
            position: 'absolute',
        },
    },
}));

export default function SinglePlayer() {
    const Parser = ParserTool.Parser;
    const parser = new Parser();
    const classes = useStyles();
    const[equations, setEquations] = useState([]);
    const[equation, setEquation] = useState('');
    const[equationGuessString, setEquationGuessString] = useState('');
    const[finalGuess, setFinalGuess] = useState('');
    const[isValidEquation, setIsValidEquation] = useState(false);
    const[score, setScore] = useState(null);
    const[numAttempted, setNumAttempted] = useState(0);
    const[totalScore, setTotalScore] = useState(0);
    const[equationsData, setEquationsData] = useState({
        data: null,
        loading: true,
        error: null,
      }
    )
    const [equationType, setEquationType] = useState('equations');

    //Get Equations
    let getData = () => {
      function onSuccess(response) {
        let equationsArray = response.val();
        setEquations(equationsArray);
        setEquation(equationsArray[Math.floor(Math.random() * Math.floor(equationsArray.length))]);
      }
      get(setEquationsData, equationType , null, onSuccess, true);
    }

    useEffect(getData, [equationType]);

    const handleOnChangeGuess = (event) => {
      setEquationGuessString(event.target.value);
      //setLogic(event.target.value);
      try {
        let equation = parser.parse(event.target.value);
        // eslint-disable-next-line
        let testFunc = equation.toJSFunction("x");
        equation.evaluate( { x: 0 });
        setIsValidEquation(true);
      } catch (error) {
        setIsValidEquation(false);
      }

    }

    const submit = () => {
      let exprGuess = parser.parse(equationGuessString);
      let exprActual = parser.parse(equation);
      let guessFunc = exprGuess.toJSFunction("x");
      let actualFunc = exprActual.toJSFunction("x");

      let diffFunc = function(x) {
        return Math.abs(actualFunc(x) - guessFunc(x));
      }

      setFinalGuess(equationGuessString);
      let scoreReceived = integrate(diffFunc, -10, 10, 0.0001).toFixed(0);
      setScore(scoreReceived);
      setNumAttempted(numAttempted + 1);
      setTotalScore((Number(totalScore) + Number(scoreReceived)).toFixed(0));
    }

    const next = () => {
      const newIndex = Math.floor(Math.random() * Math.floor(equations.length));
      setEquation(equations[newIndex]);
      setEquationGuessString('');
      setFinalGuess('');
      setIsValidEquation(false);
    }

    const reset = () => {
      setFinalGuess('');
      setEquationGuessString('');
      setTotalScore(0);
      setNumAttempted(0);
      setIsValidEquation(false);
      const newIndex = Math.floor(Math.random() * Math.floor(equations.length));
      setEquation(equations[newIndex]);
    }

    const handleDropdownChange = (event) => {
      setEquationType(event.target.value);
    };

    if(equationsData.loading || equation === '') {
      return (
      <div>
        <NavBar />
        <LoadingSpinner />
      </div>
      )
    }

    return (
      <div className={classes.container}>

          <NavBar />

          <Box display="flex" flexDirection="row">

            {/*Dropdown to choose type of equations (Left Column)*/}
            <DropdownEquations value={equationType} onChange={handleDropdownChange}/>

            {/*Game Board (Middle Column)*/}
            <Box display="flex" flexDirection="column" alignItems="center">
              <CoordinatePlaneGraph expressionToGuess={equation} guessedEquation={finalGuess}/>
              <Box display="flex" flexDirection="row" p={1} m={1}>
                <Typography variant="h5" display="block" noWrap className={classes.equationText}>
                    Y =
                </Typography>
                {isValidEquation ? (
                  <TextField 
                  id="equationGuessTextField"  
                  disabled={finalGuess !== ''}
                  variant="outlined" 
                  label="Enter Equation Guess" 
                  className={classes.textfield} 
                  value={equationGuessString}
                  onChange={handleOnChangeGuess}
                />
                ) : 
                (
                  <TextField 
                  id="equationGuessTextField"  
                  disabled={finalGuess !== ''}
                  error
                  helperText={"Invalid Equation"}
                  variant="outlined" 
                  label="Enter Equation Guess (x)" 
                  className={classes.textfield} 
                  value={equationGuessString}
                  onChange={handleOnChangeGuess}
                />
                )}
              <Button
                className={classes.button}
                disabled={finalGuess !== '' || !isValidEquation}
                variant="contained"
                color="primary"
                onClick={submit}
              >
                <Typography variant="h5" display="block" noWrap>
                    Submit
                </Typography>
              </Button>
            </Box>
        </Box>

        {/*Information Column (Right Column)*/}
        <Box display="flex" flexDirection="column" marginTop='30px'> 
            <Typography variant="h5" display="block" color="primary" noWrap>
                Guess:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{finalGuess !== '' ? " " + equationGuessString : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Answer:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{finalGuess !== '' ? " " + equation : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{finalGuess !== '' ? " " + score : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                # attempted:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{numAttempted ? " " + numAttempted : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Total Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{" " + totalScore}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Average Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{ numAttempted !== 0 ? " " + (totalScore / numAttempted).toFixed(0) : ' N/A'}</Typography>
            </Typography>
            <Button
                className={classes.button}
                disabled={finalGuess === ''}
                variant="contained"
                color="primary"
                onClick={next}
              >
                <Typography variant="h5" display="block" noWrap>
                    Next
                </Typography>
            </Button>
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={reset}
              >
                <Typography variant="h5" display="block" noWrap>
                    Reset
                </Typography>
            </Button>
            <HelpButton />
        </Box>
      </Box>
      </div>
    );
}
