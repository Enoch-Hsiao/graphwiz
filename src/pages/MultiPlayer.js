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

const useStyles = makeStyles((theme) => ({
    title: {
      marginTop: theme.spacing(2),
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
      marginTop: theme.spacing(1.75),
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
    }
}));

/**
 * Calculate the numeric integration of a function
 * @param {Function} f
 * @param {number} start
 * @param {number} end
 * @param {number} [step=0.01]
 */
function integrate (f, start, end, step) {
  let total = 0
  step = step || 0.01
  for (let x = start; x < end; x += step) {
    if(isNaN(f(x + step / 2))) {
      return 9999;
    }
    total += f(x + step / 2) * step;
    if(total > 9999) {
      return 9999;
    }
  }
  return total;
}

export default function MultiPlayer() {
    const location = useLocation();
    const gameID = location.pathname.split('/').pop();
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
    const[state, setState] = useState('idleState');
    const[players, setPlayers] = useState(null);
    const[date, setDate] = useState(null); 
    const [name, setName] = useState('');
    const [playerID, setPlayerID] = useState('');
    const [errorName, setErrorName] = useState(false);
    const [errorNameText, setErrorNameText] = useState(false);
    const [open, setOpen] = useState(true);
    const [isHost, setIsHost] = useState(false);
    //const [totalWins, setTotalWins] = useState(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [secondsTaken, setSecondsTaken] = useState(null);
    //In case user joins in middle of a game
    const [hasJoinedGame, setHasJoinedGame] = useState(false);
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
          if(data.state === 'idleState' && !open) {
            setHasJoinedGame(true);
          }
          if(data.players){
              let playersArray = Object.entries(data.players).map((data) => data[1]);
              setPlayers(playersArray);
              playersArray.sort((a,b) => {
                if(a.averageScore > b.averageScore) {
                  return 1;
                } else if(a.averageScore > b.averageScore) {
                  return -1;
                } else {
                  return 0;
                }
              });
              playersArray = playersArray.map((data, index) => {
                return {
                  ...data,
                  rank: index + 1,
                }
              })
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
            //setTotalWins(0);
            db.ref('gameSessions/' + gameID + '/players').push({
                name: name,
                host: host,
                //totalWins: 0,
                averageScore: 'N/A',
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

    //time for submission (breaks ties in leaderboard)
    let secondsLeftInGame;

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
      setSecondsTaken(20 - secondsLeftInGame);
      setHasSubmitted(true);
      db.ref('gameSessions/' + gameID + '/leaderboard/' + playerID).set({
        name: name,
        score: Number(scoreReceived),
        secondsTaken: 20 - secondsLeftInGame,
        guess: equationGuessString,
        //totalWins: totalWins,
      });
      db.ref('gameSessions/' + gameID + '/players/' + playerID).set({
        host: isHost,
        name: name,
        //totalWins: totalWins,
        averageScore: Number((updatedTotalScore / (numAttempted + 1)).toFixed(3)),
      });
    }

    let timer = null;
    let wordBanner = null;
    const[cooldownTimer, setCooldownTimer] = useState(null);
    const[startGameButton, setStartGameButton] = useState(true);

    const onCompleteGame = () => {
      if(hasJoinedGame) {
        //game finished with no submission
        if(!hasSubmitted) {
          setScore(9999);
          setFinalGuess(345237498.23987238);
          setNumAttempted(numAttempted + 1);
          let updatedTotalScore = (Number(totalScore) + Number(9999)).toFixed(0);
          setTotalScore(updatedTotalScore);
          setHasSubmitted(true);
          setSecondsTaken(20);
          db.ref('gameSessions/' + gameID + '/leaderboard/' + playerID).set({
            name: name,
            score: 9999,
            secondsTaken: 20,
            guess: 'N/A',
            //totalWins: totalWins,
          });
          db.ref('gameSessions/' + gameID + '/players/' + playerID).set({
            host: isHost,
            name: name,
            //totalWins: totalWins,
            averageScore: Number((Number(updatedTotalScore) / (numAttempted + 1)).toFixed(3)),
          });
        }

        //Game has ended
        if(isHost) {
          db.ref('gameSessions/' + gameID + '/state').set("idleState");
          setStartGameButton(false);
          setCooldownTimer(<Countdown
            date={Date.now() + 15000}
            onComplete={onCompleteCooldown}
            renderer={props => {
              return <Typography variant="h4" color="primary">Cooldown: {props.seconds}</Typography>;
            }
          }
          />);
        } else {
          setCooldownTimer(<Countdown
            date={Date.now() + 10000}
            onComplete={onCompleteCooldown}
            renderer={props => {
              return <Typography variant="h4" color="primary">Check Leaderboards: {props.seconds}</Typography>;
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
      setCooldownTimer(null);
      setScore(null);
      setSecondsTaken(null);
      if(isHost) {
        db.ref('gameSessions/' + gameID + '/equation').set(equations[Math.floor(Math.random() * Math.floor(equations.length))]).then(() => setStartGameButton(true));
      }
    }

    if(state === 'gameState' && !cooldownTimer){
      if(!hasSubmitted) {
        wordBanner = <Typography variant="h4" color="primary">Guess the equation!</Typography>;
      }
      timer = <Countdown
        date={date + 20499}
        onComplete={onCompleteGame}
        renderer={props => {
          secondsLeftInGame = Number(props.seconds);
          return <Typography variant="h4" color="primary">Seconds left: {props.seconds}</Typography>;
        }
      }
      />;
    }

    if(state === 'idleState' && isHost && cooldownTimer) {
      wordBanner = <Typography variant="h6">You are the Host! Start a new game when cooldown is over!</Typography>;
    } else if(hasSubmitted) {
      wordBanner = <Typography variant="h6">Submitted! Select the leaderboards button to see where you placed!</Typography>;
    } else if(state === 'idleState' && isHost) {
      wordBanner = <Typography variant="h6">You are the Host! Start a new game when you are ready!</Typography>;
    } else if(state === 'idleState' && !isHost) {
      wordBanner = <Typography variant="h6">Please wait for the Host to start a new game!</Typography>;
    }

    if(state === 'gameState' && !hasJoinedGame) {
      wordBanner = <Typography variant="h6">Please wait until current game is over!</Typography>;
      timer = null;
    }

    const startNewGame = () => {
      db.ref('gameSessions/' + gameID + '/date').set(Date.now());
      db.ref('gameSessions/' + gameID + '/state').set("gameState");
      db.ref('gameSessions/' + gameID + '/leaderboard').remove();
    }

    //player leaves, remove player from database
    //closes or refreshes
    window.onbeforeunload = function() {
      db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
      if(isHost || !players) {
        db.ref('gameSessions/' + gameID).remove();
      }
    };
    
    //changes url
    let history = useHistory();
    history.block(tx => {
      db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
      if(isHost || !players) {
        db.ref('gameSessions/' + gameID).remove();
      }
    });

    function backButtonNavBar(){
      db.ref('gameSessions/' + gameID + '/players/' + playerID).remove();
      if(isHost || !players) {
        db.ref('gameSessions/' + gameID).remove();
      }
    }

    function OnlinePlayerList() {
      if(players) {
        return <div className={classes.onlinePlayerList}>
                <List subheader={<ListSubheader>Online Players</ListSubheader>}>
                  {players.map((playerData) => (
                    <ListItem>
                      <ListItemIcon>
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
              { title: 'Average Score', field: 'averageScore', type: 'numeric' }]}
            title={'Overall Leaderboard'}
            data={overallLeaderboardData}
          />
      </Dialog>

      <NavBar onClose={backButtonNavBar} />
      <Box display="flex" flexDirection="row" className={classes.title}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {wordBanner}
          <CoordinatePlaneGraph expressionToGuess={equation} guessedEquation={finalGuess} blankboard={!cooldownTimer && (state === 'idleState' || !hasJoinedGame)}/>
          <Box display="flex" flexDirection="row" p={1} m={1}>
            <Typography variant="h6" display="block" noWrap className={classes.equationText}>
                Y =
            </Typography>
            {!hasJoinedGame || state === 'idleState' || isValidEquation ? (
              <TextField 
              id="equationGuessTextField"  
              disabled={!hasJoinedGame || finalGuess !== '' || state === 'idleState' || cooldownTimer}
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
              disabled={finalGuess !== '' || state === 'idleState' || cooldownTimer}
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
            disabled={!hasJoinedGame || state === "idleState" || finalGuess !== '' || !isValidEquation || cooldownTimer}
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
        <Box display="flex" flexDirection="column" marginLeft='20px' > 
            {timer}
            {cooldownTimer}
            {!cooldownTimer && !timer ? <Typography variant="h4" color="primary">Timer :</Typography> : null}
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
                Total Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{" " + totalScore}</Typography>
            </Typography>
            <Typography variant="h5" display="block" color="primary" noWrap>
                Average Score:
                <Typography variant="h6" style={{color: 'black'}} display="inline">{ numAttempted !== 0 ? " " + (totalScore / numAttempted).toFixed(3) : ' N/A'}</Typography>
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
              >
                <Typography variant="h5" display="block" noWrap>
                    Leaderboards
                </Typography>
            </Button>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <OnlinePlayerList/>
          <HelpButton />
        </Box>
      </Box>
    </div>
  );
}


