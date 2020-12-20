import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
} from '@material-ui/core';
import Copyright from '../components/Copyright';
import { Link, useHistory } from 'react-router-dom';
import { db } from '../firebase/firebase';
import logo from '../Logo.PNG';
import get from '../universalHTTPRequests/get';
import ErrorBanner from '../components/ErrorBanner';

const useStyles = makeStyles((theme) => ({
    "@keyframes color-change": {
        "0%": {
            backgroundColor: "#45a3e5"
        },
        "30%": {
            backgroundColor: "#66bf39"
        },
        "40%": {
            backgroundColor: "#eb670f"
        },
        "60%": {
            backgroundColor: "#f35"
        },
        "90%": {
            backgroundColor: "#864cbf"
        },
        "100%": {
            backgroundColor: "#45a3e5"
        }
    },
    container: {
        height: '100%',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        animation: '10000ms ease-in-out infinite $color-change !important'
    },
    joinSessionContainer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    createSessionContainer: {
      marginTop: '0',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
     },
    textField: {
      marginTop: theme.spacing(4),
    },
    title: {
      marginTop: theme.spacing(4),
      fontFamily: 'Algerian'
    },
    logo: {
        width: '100px',
    },
    joinSessionButton: {
        marginTop: theme.spacing(2),
        width: '250px',
        textTransform: 'unset',
        borderStyle: 'solid',
        borderColor: 'white',
        border: 2,
    },
    createSessionButton: {
      marginTop: theme.spacing(5),
      width: '250px',
      textTransform: 'unset',
      borderStyle: 'solid',
      borderColor: 'white',
      border: 2,
     },
    singlePlayerButton: {
      marginTop: theme.spacing(5),
      width: '300px',
      textTransform: 'unset',
      borderStyle: 'solid',
      borderColor: 'white',
      border: 2,
  },
    margin: {
        margin: theme.spacing(3),
    },
    copyright: {
        color: 'white',
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

const ValidationTextField = withStyles({
    root: {
        width: '300px',
        color: 'white',
        '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
                borderColor: 'white',
                borderWidth: '2',
            },
        },
        '& .MuiFormLabel-root': {
            color: 'white',
        },
        '& .MuiInputBase-root': {
            color: 'white',
        },
        '& input:valid + fieldset': {
            borderColor: 'white',
            borderWidth: 2,
        },
        '& input:invalid + fieldset': {
            borderColor: 'white',
            borderWidth: 2,
        },
        '& input:valid:focus + fieldset': {
            color: 'white',
            borderColor: 'white',
            borderLeftWidth: 6,
            padding: '4px !important', // override inline-style
        },
    },
})(TextField);

function CreateSession() {
  const classes = useStyles();

  const history = useHistory();
  const createSession = () => {
    db.ref('gameSessions').push({
        state: 'idleState',
        equation: '',
    }).then((snapshot)=> {
      history.push('multiplayer/' + snapshot.key);
    });
  }

  return (
      <div>
          <Container className={classes.createSessionContainer}>
              <Button
                  className={classes.createSessionButton}
                  variant="contained"
                  color="primary"
                  onClick={createSession}
              >
                  <Typography variant="h5" display="block" noWrap>
                      Create Session
                  </Typography>
              </Button>
          </Container>
      </div>
  );
}

function JoinGame({setErrorBannerFade, setErrorBannerMessage}) {
    const classes = useStyles();
    // eslint-disable-next-line
    const[getSession, setGetSession] = useState({
        data: null,
        loading: true,
        error: null,
    });
    const history = useHistory();
    const[PIN, setPIN] = useState('');

    function joinSession() {
        function onSuccess(response) {
            console.log(response.val());
            if(response.val()) {
                //move to Config file
                history.push('multiplayer/' + PIN);
            } else {
                setErrorBannerFade(true);
                setErrorBannerMessage('Game PIN not recognized. Please check and try again.');
            }
        }    

        if(PIN  && PIN.trim()) {
            get(setGetSession, 'gameSessions/' + PIN, null, onSuccess, true );
        } else {
            setErrorBannerFade(true);
            setErrorBannerMessage('Game PIN not recognized. Please check and try again.');
        }
    }

    return (
        <div>
            <Container className={classes.joinSessionContainer}>
                <form
                    className={classes.textField}
                    noValidate
                    autoComplete="off"
                >
                    <ValidationTextField
                        label="Game PIN"
                        id="GamePIN"
                        variant="outlined"
                        value={PIN}
                        onChange={(event) => setPIN(event.target.value)}
                    />
                </form>
                <Button
                    className={classes.joinSessionButton}
                    variant="contained"
                    color="primary"
                    onClick={joinSession}
                >
                    <Typography variant="h5" display="block" noWrap>
                        Join Session
                    </Typography>
                </Button>
            </Container>
        </div>
    );
}

function SinglePlayerGame() {
  const classes = useStyles();

  return (
    <div>
      <Button
          className={classes.singlePlayerButton}
          component={Link}
          to={'/singleplayer'}
          variant="contained"
          color="primary"
      >
          <Typography variant="h5" display="block" noWrap>
              Single Player Game
          </Typography>
      </Button>
    </div>
  );
}

const WhiteTextTypography = withStyles({
    root: {
        color: '#FFFFFF',
    },
})(Typography);

function Title() {
    const classes = useStyles();
    return (
        <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" className={classes.title}>
            <WhiteTextTypography variant="h3" align="center" className={classes.title}>
                GraphWiz
            </WhiteTextTypography>
            <img
                src={logo}
                alt="Logo"
                className={classes.logo}
            />
       </Box>
    );
}

export default function Homepage() {
    const classes = useStyles();
    const [errorBannerFade, setErrorBannerFade] = useState(false);
    const [errorBannerMessage, setErrorBannerMessage] = useState('');
    useEffect(() => {
        const timeout = setTimeout(() => {
            setErrorBannerFade(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [errorBannerFade]);

    return (
      <div className={classes.container}>
        <ErrorBanner errorMessage={errorBannerMessage} fade={errorBannerFade} />
        <Title />
        <JoinGame setErrorBannerMessage={setErrorBannerMessage} setErrorBannerFade={setErrorBannerFade}/>
        <CreateSession />
        <SinglePlayerGame />
        <Box className={classes.copyright}>
            <Copyright />
        </Box>
      </div>
    );
}
