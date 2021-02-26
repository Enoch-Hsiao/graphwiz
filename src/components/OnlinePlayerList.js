import React from 'react';
import { 
  Typography, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListSubheader,
} 
from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme) => ({
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

export default function OnlinePlayerList({ players }) {
  const classes = useStyles();
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