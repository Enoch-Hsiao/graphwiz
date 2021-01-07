import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Typography,
    TextField,
    Button,
    DialogActions,
    DialogContent,
    Dialog,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListSubheader,
    IconButton,
} from '@material-ui/core';
import CoordinatePlaneGraph from '../components/CoordinatePlaneGraph';
import ParserTool from 'expr-eval';
import get from '../universalHTTPRequests/get';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/NavBar';
import { useLocation, useHistory } from 'react-router-dom';
import { db } from '../firebase/firebase';
import ErrorIcon from '@material-ui/icons/Error';
import Countdown from 'react-countdown';
import PersonIcon from '@material-ui/icons/Person';
import LeaderboardTable from '../components/LeaderboardTable';
import HelpButton from '../components/HelpButtonMultiPlayer';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import integrate from '../functions/integrate';

const useStyles = makeStyles((theme) => ({
    content: {
      marginTop: theme.spacing(11),
    },
    root: {
      margin: 0,
      padding: theme.spacing(1),
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(0),
      color: theme.palette.grey[500],
    },
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
        width: '300px',
        height: '50px',
      },
    },
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    errorContainer: {
      marginTop: theme.spacing(3),
      height: '100%',
      width: '100%',
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
    issue: {
      marginTop: theme.spacing(10),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    iconError: {
        paddingRight: theme.spacing(2),
        fontSize: '75px',
    },
    onlinePlayerList: {
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(4),
      height: '425px',
      width: '250px',
      border: "1px solid black",
      wordWrap: 'break-word',
      overflowY: 'scroll',
    },
    iconPerson: {
      paddingLeft: '15px',
    }
}));

export default function MultiPlayer() {
    const location = useLocation();
    const gameID = location.pathname.split('/').pop();
    const Parser = ParserTool.Parser;
    const parser = new Parser();

    const classes = useStyles();

    //Player name submission 
    const [errorName, setErrorName] = useState(false);
    const [errorNameText, setErrorNameText] = useState(false);

    //Host chooses Equation
    const[equations, setEquations] = useState([]);
    const[equation, setEquation] = useState('');

    //Player Guess
    const[equationGuessString, setEquationGuessString] = useState('');
    const[finalGuess, setFinalGuess] = useState('');
    const[isValidEquation, setIsValidEquation] = useState(false);
    const[score, setScore] = useState(null);
    const[numAttempted, setNumAttempted] = useState(0);
    const[totalScore, setTotalScore] = useState(0);
    const[averageScore, setAverageScore] = useState('N/A');
    const[totalSecondsTaken, setTotalSecondsTaken] = useState(0);
    const[averageSecondsTaken, setAverageSecondsTaken] = useState('N/A')

    const[gameData, setGameData] = useState({
        data: null,
        loading: true,
        error: null,
      }
    )

    const[equationsData, setEquationsData] = useState({
        data: null,
        loading: false,
        error: null,
      }
    )

    //State of game
    const[state, setState] = useState('idleState');
    const [date, setDate] = useState(null); 

    //Player list
    const[players, setPlayers] = useState(null);

    //Player Data
    const [name, setName] = useState('');
    const [playerID, setPlayerID] = useState('');

    //Name Dialog
    const [open, setOpen] = useState(true);
    const [isHost, setIsHost] = useState(false);

    //Game submission data
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [secondsTaken, setSecondsTaken] = useState(null);

    //time for submission (breaks ties in leaderboard)
    const [secondsLeftInGame, setSecondsLeftInGame] = useState(null);

    //In case user joins in middle of a game
    const [hasJoinedGame, setHasJoinedGame] = useState(false);

    //Leaderboard Data
    const [currentGameLeaderboardData, setCurrentGameLeaderboardData] = useState([]);
    const [overallLeaderboardData, setOverallLeaderboardData] = useState([]);

    // eslint-disable-next-line 
    const [playersData, setPlayersData] = useState({
      data: null,
      loading: false,
      error: null,
    });

    //Get Game Data
    let getData = () => {
      function onSuccess(response) {
        let data = response.val();
        if(data) {
          setState(data.state);

          //Name has been submitted
          if(data.state === 'idleState' && !open) {
            setHasJoinedGame(true);
          }

          if(data.players){
              let playersArray = Object.entries(data.players).map((data) => data[1]);
              playersArray.sort((a,b) => {
                if(a.averageScore > b.averageScore) {
                  return 1;
                } else if(a.averageScore < b.averageScore) {
                  return -1;
                } else {
                  if(a.averageSeconds < b.averageSeconds) {
                    return -1;
                  } else if(a.averageSeconds > b.averageSeconds) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
              });
              playersArray = playersArray.map((data, index) => {
                return {
                  ...data,
                  rank: index + 1,
                }
              })
              setPlayers(playersArray);
              setOverallLeaderboardData(playersArray);
          }

          setEquation(data.equation);
          setDate(data.date);

          //Current Game leaderboard
          if(data.leaderboard) {
            let leaderboardArray = Object.entries(data.leaderboard).map((data) => data[1]);
            leaderboardArray.sort((a,b) => {
              if(a.score < b.score) {
                return -1;
              } else if(a.score > b.score) {
                return 1;
              } else {
                if(a.secondsTaken < b.secondsTaken) {
                  return -1;
                } else if(a.secondsTaken > b.secondsTaken) {
                  return 1;
                } else {
                  return 0;
                }
              }
            });
            leaderboardArray = leaderboardArray.map((data, index) => {
              return {
                ...data,
                rank: index + 1,
              }
            })
            setCurrentGameLeaderboardData(leaderboardArray);
          } else {
            setCurrentGameLeaderboardData([]);
          }

        } else {
          //Host left and/or game session does not exist
          setGameData({
            data: null,
            loading: false,
            error: "Host Left"
          })
        }
      }

      // eslint-disable-next-line
      function onError(response) {

      }

      get(setGameData, 'gameSessions/'+ gameID, null, onSuccess);
    }


    useEffect(getData, [gameID, open]); 

    const handleClose = () => {
      setOpen(false);
    };
  
    const handleCloseJoinSession = (e) => {
      let validInput = true;
      function onSuccess(response) {
          if (!name || !name.trim()) {
              setErrorName(true);
              setErrorNameText('Name cannot be empty');
              validInput = false;
          } else if (name.length >= 25) {
              setErrorName(true);
              setErrorNameText(
                  'Name must have less than 25 characters'
              );
              validInput = false;
          } else {
              setErrorName(false);
          }

          if(response && response.val() && Object.entries(response.val()).length >= 5) {
            validInput = false;
            setErrorName(true);
            setErrorNameText('The room reached its limit of 5 people. Please wait or join another room.');
          }

          if(validInput && !playerID) {
            //no players, first player is host
            let host = gameData.data.players ? false : true;
            setIsHost(host);
            if(host) {
              getHostData();
            }
            setAverageScore('N/A');
            setAverageSecondsTaken('N/A');
            db.ref('gameSessions/' + gameID + '/players').push({
                name: name,
                host: host,
                averageScore: 'N/A',
                averageSeconds: 'N/A'
            }).then((snapshot)=> {
                setPlayerID(snapshot.key);
            });
            setOpen(false);
          }
        }
      get(setPlayersData, 'gameSessions/' + gameID + '/players/', null, onSuccess, true);
    };

    //Get equations if host
    let getHostData = () => {
      function onSuccess(response) {
        let equationsArray = response.val();
        setEquations(equationsArray);
        db.ref('gameSessions/' + gameID + '/equation').set(equationsArray[Math.floor(Math.random() * Math.floor(equationsArray.length))]);
      }
      get(setEquationsData, 'equations', null, onSuccess, true);
    }
    
    const handleOnChangeName = (event) => {
      setName(event.target.value);
    };

    const handleOnChangeGuess = (event) => {
      setEquationGuessString(event.target.value);
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
      setScore(Number(scoreReceived));
      setNumAttempted(numAttempted + 1);

      let updatedTotalScore = (Number(totalScore) + Number(scoreReceived)).toFixed(0);
      setTotalScore(updatedTotalScore);

      let averageScore = Number((updatedTotalScore / (numAttempted + 1)).toFixed(3));
      setAverageScore(averageScore)
      setHasSubmitted(true);

      let secondsTakenInGame = 20 - secondsLeftInGame; 
      let updatedTotalSecondsTaken = (Number(totalSecondsTaken) + Number(secondsTakenInGame)).toFixed(0);
      setTotalSecondsTaken(updatedTotalSecondsTaken);
      setSecondsTaken(secondsTakenInGame);

      let averageSecondsTaken = Number((updatedTotalSecondsTaken / (numAttempted + 1)).toFixed(3));
      setAverageSecondsTaken(averageSecondsTaken);

      db.ref('gameSessions/' + gameID + '/leaderboard/' + playerID).set({
        name: name,
        score: Number(scoreReceived),
        secondsTaken: secondsTakenInGame,
        guess: equationGuessString,
      });

      db.ref('gameSessions/' + gameID + '/players/' + playerID).set({
        host: isHost,
        name: name,
        averageScore,
        averageSeconds: averageSecondsTaken,
      });
    }

    const [startingGameTimer, setStartingGameTimer] = useState(null);
    const [timer, setTimer] = useState(null);
    const [cooldownTimer, setCooldownTimer] = useState(null);

    // startingState -> inGameState -> cooldownState
    const [gameState, setGameState] = useState(null);
    let wordBanner = null;
    const [startGameButton, setStartGameButton] = useState(true);

    function onCompleteGame () {
      setGameState("cooldownState");
      if(hasJoinedGame) {
        setTimer(null);

        function onSuccess(response) {
          let data = response.val();

          //User did not submit during game
          if(!data) {
            setScore(99999);
            //Fill in random Final Guess
            setFinalGuess(345237498.23987238);
            setNumAttempted(numAttempted + 1);
            let updatedTotalScore = (Number(totalScore) + Number(99999)).toFixed(0);
            setTotalScore(updatedTotalScore);

            let averageScore = Number((updatedTotalScore / (numAttempted + 1)).toFixed(3));
            setAverageScore(averageScore);
            setHasSubmitted(true);

            setSecondsTaken(20);
            let updatedTotalSecondsTaken = (Number(totalSecondsTaken) + Number(20)).toFixed(0);
            setTotalSecondsTaken(updatedTotalSecondsTaken);
      
            let averageSecondsTaken = Number((updatedTotalSecondsTaken / (numAttempted + 1)).toFixed(3));
            setAverageSecondsTaken(averageSecondsTaken);

            db.ref('gameSessions/' + gameID + '/leaderboard/' + playerID).set({
              name: name,
              score: 99999,
              secondsTaken: 20,
              guess: 'N/A',
            });

            db.ref('gameSessions/' + gameID + '/players/' + playerID).set({
              host: isHost,
              name: name,
              averageScore,
              averageSeconds: averageSecondsTaken,
            });
          }

        }

        //Get leaderboard to see if user submitted
        get(setGameData, 'gameSessions/'+ gameID + '/leaderboard/' + playerID, null, onSuccess, true);

        //Game has ended
        if(isHost) {
          db.ref('gameSessions/' + gameID + '/state').set("idleState");
          setStartGameButton(false);
          setCooldownTimer(<Countdown
            date={Date.now() + 15000}
            onComplete={onCompleteCooldown}
            renderer={props => {
              return <Typography variant="h4" color="secondary">Cooldown: {props.seconds}</Typography>;
            }
          }
          />);
        } else {
          setCooldownTimer(<Countdown
            date={Date.now() + 10000}
            onComplete={onCompleteCooldown}
            renderer={props => {
              return <Typography variant="h4" color="secondary">Cooldown: {props.seconds}</Typography>;
            }
          }
          />);
        }
      }
    }

    const onCompleteCooldown = () => {
      setFinalGuess('');
      setEquationGuessString('');
      setIsValidEquation(false);
      setHasSubmitted(false);
      setScore(null);
      setSecondsTaken(null);
      setCooldownTimer(null);
      setGameState(null);
      if(isHost) {
        db.ref('gameSessions/' + gameID + '/equation').set(equations[Math.floor(Math.random() * Math.floor(equations.length))]).then(() => setStartGameButton(true));
      }
    }

    const startGame = () => {
      if(!hasSubmitted) {
        wordBanner = <Typography variant="h4">Guess the equation!</Typography>;
      }
      setGameState("inGameState");
      setStartingGameTimer(null);
    }

    //Game has started: Starting State
    if (hasJoinedGame  && state === 'gameState' && gameState !== "inGameState" && gameState !== "coolingState" && !cooldownTimer && !timer && !startingGameTimer){
      if(!hasSubmitted) {
        wordBanner = <Typography variant="h4">Game is starting!</Typography>;
      }
      if(!gameState) {
        setGameState("startingState");
      }
      setStartingGameTimer(<Countdown
        date={date}
        onComplete={startGame}
        renderer={props => {
          return <Typography variant="h4" color="secondary">Game Starting: {props.seconds}</Typography>;
        }
      }
      />);
    } 
    
    if (hasJoinedGame && state === 'gameState' && gameState === "inGameState" && !timer){
      //Game has started: In Game State
      setTimer(<Countdown
        date={date + 20000}
        onComplete={onCompleteGame}
        renderer={props => {
          setSecondsLeftInGame(Number(props.seconds));
          return <Typography variant="h4" color="secondary">Seconds left: {props.seconds}</Typography>;
        }
      }/>);
    }

    if (state === 'idleState' && isHost && cooldownTimer) {
      wordBanner = <Typography variant="h6">You are the Host! Start a new game when cooldown is over!</Typography>;
    } else if(hasSubmitted) {
      wordBanner = <Typography variant="h6">Submitted! Select the leaderboards button to see where you placed!</Typography>;
    } else if(state === 'idleState' && isHost) {
      wordBanner = <Typography variant="h6">You are the Host! Start a new game when you are ready!</Typography>;
    } else if(state === 'idleState' && !isHost) {
      wordBanner = <Typography variant="h6">Please wait for the Host to start a new game!</Typography>;
    }

    //Has not joined game yet
    if (state === 'gameState' && !hasJoinedGame) {
      wordBanner = <Typography variant="h6">Please wait until current game is over!</Typography>;
    }

    const startNewGame = () => {
      db.ref('gameSessions/' + gameID + '/date').set(Date.now() + 6000);
      db.ref('gameSessions/' + gameID + '/state').set("gameState");
      db.ref('gameSessions/' + gameID + '/leaderboard').remove();
    }

    //player leaves, remove player from database

      //closes or refreshes
      window.onbeforeunload = function() {
        if(playerID && playerID !== '') {
          db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
        }
        if(isHost || !players) {
          db.ref('gameSessions/' + gameID).remove();
        }
      };
      
      //changes url
      let history = useHistory();
      history.block(tx => {
        if(playerID && playerID !== '') {
          db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
        }
        if(isHost || !players) {
          db.ref('gameSessions/' + gameID).remove();
        }
      });

      function backButtonNavBar(){
        if(playerID && playerID !== '') {
          db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
        }
        if(isHost || !players) {
          db.ref('gameSessions/' + gameID).remove();
        }
      }

    function OnlinePlayerList() {
      if(players) {
        return <div className={classes.onlinePlayerList}>
                <List subheader={<ListSubheader>Online Players</ListSubheader>}>
                  {players.map((playerData, index) => (
                    <ListItem>
                      <Typography variant="h6">
                        {(index + 1)}
                      </Typography>
                      <ListItemIcon className={classes.iconPerson}>
                        <PersonIcon color={playerData.host ? "primary" : ""}/>
                      </ListItemIcon>
                      <ListItemText
                        primary={playerData.name}
                      />
                    </ListItem>
                  ))}
                </List>
              </div>
      } else {
        return <div className={classes.onlinePlayerList}>
                <List subheader={<ListSubheader>Online Players</ListSubheader>}>
                </List>
              </div>;
      }
    }
    const[openLeaderboards, setOpenLeaderboards] = useState(false);
    const openLeaderboardDialog = () => {
      setOpenLeaderboards(true);
    }

    const closeLeaderboardDialog = () => {
      setOpenLeaderboards(false);
    }

    if(gameData.loading || equationsData.loading) {
      return (
      <div>
        <NavBar />
        <LoadingSpinner />
      </div>
      )
    }

    if(gameData.error === "Host Left") {
      return (
        <div className={classes.issue}>
            <NavBar />
            <div className={classes.errorContainer}>
                <ErrorIcon className={classes.iconError} />
                <Typography align="center" variant="h3">
                    The host of the room left. Thanks for playing!
                </Typography>
            </div>
        </div>
    );
    } else if (gameData.error) {
      return (
        <div className={classes.issue}>
            <NavBar />
            <div className={classes.container}>
                <ErrorIcon className={classes.iconError} />
                <Typography align="center" variant="h3">
                    There was an unexpected error. Please refresh.
                </Typography>
            </div>
        </div>
      );
    }

    if(equationsData.error) {
      return (
        <div className={classes.issue}>
            <NavBar />
            <div className={classes.container}>
                <ErrorIcon className={classes.iconError} />
                <Typography align="center" variant="h3">
                    There was an unknown error with this room. Please create a new one!
                </Typography>
            </div>
        </div>
      );
    }

    function DialogTitle(props) {
      const classes = useStyles();
      const { onClose } = props;
      return (
          <MuiDialogTitle disableTypography className={classes.root}>
              <Typography variant="h5">Leaderboards</Typography>
              {onClose ? (
                  <IconButton
                      aria-label="close"
                      className={classes.closeButton}
                      onClick={onClose}
                  >
                      <CloseIcon />
                  </IconButton>
              ) : null}
          </MuiDialogTitle>
      );
    }
    
    return (
      <div className={classes.container}>
        
        {/*Enter Name/Join Room Dialog*/}
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
          open={open}
          maxWidth={false}
        >
              <DialogContent>
                  <form style={{ marginBottom: 20 }}           
                   onKeyPress={(event) => {
                      if (event.key === 'Enter')
                          event.preventDefault();
                  }}>
                      {errorName ? (
                          <TextField
                              error
                              label="Name"
                              helperText={errorNameText}
                              style={{ width: 500 }}
                              rows={1}
                              variant="outlined"
                              onChange={handleOnChangeName}
                          />
                      ) : (
                          <TextField
                              label="Name"
                              style={{ width: 500 }}
                              rows={1}
                              variant="outlined"
                              value={name}
                              onChange={handleOnChangeName}
                          />
                      )}
                  </form>
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={handleCloseJoinSession}
                    color="primary"
                >
                    Join!
                </Button>
            </DialogActions>
      </Dialog>

      {/*Leaderboard Dialog*/}
      <Dialog
          onClose={closeLeaderboardDialog}
          aria-labelledby="customized-dialog-title"
          open={openLeaderboards}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle onClose={closeLeaderboardDialog}/>
          <LeaderboardTable 
            columns={[
              { title: 'Rank', field: 'rank' },
              { title: 'Name', field: 'name' },
              { title: 'Guess', field: 'guess' },
              { title: 'Score', field: 'score', type: 'numeric' },
              { title: 'Seconds Taken', field: 'secondsTaken', type: 'numeric' }]}
            title={'Game Leaderboard'}
            data={currentGameLeaderboardData}
          />
          <LeaderboardTable 
            columns={[
              { title: 'Rank', field: 'rank' },
              { title: 'Name', field: 'name' },
              { title: 'Avg. Score', field: 'averageScore', type: 'numeric' },
              { title: 'Avg. Seconds Taken', field: 'averageSeconds', type: 'numeric' }]}
            title={'Overall Leaderboard'}
            data={overallLeaderboardData}
          />
      </Dialog>

      <NavBar onClose={backButtonNavBar} />

      {/*Game Board (Left Column)*/}
      <Box display="flex" flexDirection="row" className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {wordBanner}
          <CoordinatePlaneGraph expressionToGuess={equation} guessedEquation={finalGuess} blankboard={!cooldownTimer && (state === 'idleState' || !hasJoinedGame)}/>
          <Box display="flex" flexDirection="row" p={1} m={1}>
            <Typography variant="h5" display="block" noWrap className={classes.equationText}>
                Y =
            </Typography>
            {!hasJoinedGame || state === 'idleState' || startingGameTimer || isValidEquation ? (
              <TextField 
              id="equationGuessTextField"  
              disabled={!hasJoinedGame || finalGuess !== '' || state === 'idleState' || cooldownTimer || startingGameTimer}
              variant="outlined" 
              label="Enter Equation Guess (x)" 
              className={classes.textfield} 
              value={equationGuessString}
              onChange={handleOnChangeGuess}
            />
            ) : 
            (
              <TextField 
              id="equationGuessTextField"  
              disabled={finalGuess !== '' || cooldownTimer}
              error
              helperText={"Invalid Equation"}
              variant="outlined" 
              label="Enter Equation Guess" 
              className={classes.textfield} 
              value={equationGuessString}
              onChange={handleOnChangeGuess}
            />
            )}
          <Button
            className={classes.button}
            disabled={!hasJoinedGame || state === "idleState" || finalGuess !== '' || !isValidEquation || cooldownTimer || startingGameTimer}
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

        {/*Information Column (Middle Column)*/}
        <Box display="flex" flexDirection="column" marginLeft='20px' > 
            {timer}
            {cooldownTimer}
            {startingGameTimer}
            {!cooldownTimer && !timer && !startingGameTimer ? <Typography variant="h4" color="secondary">Timer :</Typography> : null}
            <Typography variant="h5" display="block" color="primary" noWrap>
                PIN:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{" " + gameID}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Name: 
                <Typography variant="h6" style={{color: 'black'}} display="inline">{open ? '' : " " + name}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Guess: 
                <Typography variant="h6" style={{color: 'black'}} display="inline">{finalGuess !== '' && finalGuess !== 345237498.23987238 ? " " + equationGuessString : ''}</Typography>
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
                Seconds Taken:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{finalGuess !== '' ? " " + secondsTaken : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                # attempted:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{numAttempted !== null ? " " + numAttempted : ''}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Avg. Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{" " + averageScore }</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Avg. Seconds Taken:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{" " + averageSecondsTaken}</Typography>
            </Typography>
            {isHost ? 
              (
                <Button
                    className={classes.button}
                    disabled={!isHost || state !== 'idleState' || cooldownTimer || !startGameButton}
                    variant="contained"
                    color="primary"
                    onClick={startNewGame}
                  >
                    <Typography variant="h5" display="block" noWrap>
                        Start New Game!
                    </Typography>
                </Button>
            ): null}
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={openLeaderboardDialog}
                disabled={state === 'gameState' && !hasSubmitted}
              >
                <Typography variant="h5" display="block" noWrap>
                    Leaderboards
                </Typography>
            </Button>
        </Box>

        {/*Online Players List + Help Button (Right Column)*/}
        <Box display="flex" flexDirection="column" alignItems="center">
          <OnlinePlayerList/>
          <HelpButton />
        </Box>
      </Box>
    </div>
  );
}
