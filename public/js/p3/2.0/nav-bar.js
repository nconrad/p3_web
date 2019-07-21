

import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import IconButton from '@material-ui/core/IconButton';
// import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import logo from './patric-logo-88h.png';

const useStyles = makeStyles(theme => ({

  appBar: {
    flexGrow: 1,
    background: '#2e76a3',
    borderTop: '3px solid #154e72'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1
  },
  logo: {
    position: 'relative'
  },
  logoImg: {
    height: '22px'
  },
  logoText: {
    position: 'absolute',
    left: '60px',
    bottom: '-8px'
  },
}))

export function NavBar() {
  const classes = useStyles();


  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar variant="dense">
        <Typography variant="h5" className={classes.title}>
          <img src={logo} className={classes.logoImg} />
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
};
