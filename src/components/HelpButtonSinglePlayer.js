import React, {useState} from 'react';
import { 
  Typography, 
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent, 
  Link,
} 
from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(0),
    color: theme.palette.grey[500],
  },
  root: {
    margin: 0,
    padding: theme.spacing(1),
    textAlign: 'center',
  },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    icon: {
        width: '75px',
        height: '75px',
    },
}));

function DialogTitle(props) {
  const classes = useStyles();
  const { onClose } = props;
  return (
      <MuiDialogTitle disableTypography className={classes.root}>
          <Typography variant="h5">Help</Typography>
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


export default function HelpButtonSinglePlayer() {
    const classes = useStyles();

    const[open, setOpen]= useState(false);

    const handleOpen = () => {
      setOpen(true);
    }
    const handleClose = () => {
      setOpen(false);
    }

    return (
        <div className={classes.container}>
          <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
          maxWidth={false}
        >
          <div style={{ width: 600 }}>
            <DialogTitle onClose={handleClose}/>
            <DialogContent dividers>
                <Typography variant="h6">How the Game Works</Typography>
                <Typography variant="body1">Given a graphed equation, your goal is to guess the correct equation. The lower the score, the better.</Typography>
            </DialogContent>
            <DialogContent dividers>
                <Typography variant="h6">How the Score is Calculated</Typography>
                <Typography variant="body1">The score is a reimann sum approximation of ∫|(Correct Equation) - (Guessed Equation)| from x = -10 to x = 10. The max/worst score is 9999. </Typography>
            </DialogContent>
            <DialogContent dividers>
                <Typography variant="h6">Why is my Equation not Valid?</Typography>
                <Typography variant="body1">This is the equation parser used and its valid syntax. For example, * must be in between each operand when needed/</Typography>
                <Link target="_blank" href="https://github.com/silentmatt/expr-eval#expression-syntax" variant="body2">
                  {'Equation Parser'}
                </Link> 
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={handleClose}
                    color="primary"
                >
                    Play on!
                </Button>
            </DialogActions>
          </div>
        </Dialog>
          <IconButton size="medium" color="primary" onClick={handleOpen}>
              <HelpIcon className={classes.icon}/>
          </IconButton>
        </div>
    );
}
