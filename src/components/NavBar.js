import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core/';
import { Link } from 'react-router-dom';
import Logo from '../Logo.PNG';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 0.5,
        width: '100%',
        margin: theme.spacing(0),
        padding: theme.spacing(0),
    },
    logo: {
        height: '60px',
        margin: theme.spacing(1),
        marginRight: '15px',
        '@media (max-width:500px)': {
            marginRight: '5px',
        },
    },
    title: {
        flexGrow: 1,
        '@media (max-width:500px)': {
            fontSize: '15px',
        },
    },
    signupButton: {
        backgroundColor: 'white',
        marginRight: theme.spacing(3),
        padding: theme.spacing(1.5),
        paddingBottom: 0,
        paddingTop: 0,
        textTransform: 'unset',
        borderStyle: 'solid',
        borderColor: 'white',
        border: 2,
        '@media (max-width:500px)': {
            marginRight: theme.spacing(0.5),
            padding: theme.spacing(1),
        },
    },
    loginButton: {
        backgroundColor: theme.palette.primary.main,
        marginRight: theme.spacing(3),
        padding: theme.spacing(1.5),
        paddingBottom: 0,
        paddingTop: 0,
        textTransform: 'unset',
        borderStyle: 'solid',
        borderColor: 'white',
        border: 2,
        '@media (max-width:500px)': {
            marginRight: theme.spacing(0.5),
            padding: theme.spacing(1),
        },
    },
    signupButtonText: {
        color: theme.palette.primary.main,
        '@media (max-width:500px)': {
            fontSize: '13px',
        },
    },
    loginButtonText: {
        color: 'white',
        '@media (max-width:500px)': {
            fontSize: '13px',
        },
    },
}));

export default function HomepageNavBar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <img
                        src={Logo}
                        alt="Logo"
                        className={classes.logo}
                    />
                    <Typography className={classes.title} variant="h5">
                        GraphWiz
                    </Typography>
                    <Button
                        component={Link}
                        to={'/home'}
                        className={classes.loginButton}
                        variant="contained"
                        color="primary"
                        m={-2}
                    >
                        <Typography
                            className={classes.loginButtonText}
                            variant="h6"
                        >
                            Back
                        </Typography>
                    </Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}
