

import React from "react";
import PropTypes from 'prop-types';
import { render } from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { NavBar } from './nav-bar';
import { ActionBar } from './action-bar';
import { Genomes } from './genomes/genomes';
import { PFContainer } from './protein-families/protein-families';



const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background
  },
  card: {
    minWidth: 275,
    margin: '10px'
  },
  content: {
    marginTop: '-64px',
    paddingTop: '64px'  // size of navbar
  },
  tabs: {
    background: 'rgba(0, 0, 0, 0.03)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.125)',
    marginBottom: '5px'
  }
}));


function TabContainer(props) {
  return (
    <Typography component="div">
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <div className={classes.root}>
      <NavBar />

      <div className={classes.content}>
        <ActionBar />

        <Paper className={classes.card}>

          <Tabs value={value} onChange={handleChange} className={classes.tabs}>
            {/*<Tab label="Overview" />*/}
            <Tab label="Genomes" />
            <Tab label="Protein Families" />
          </Tabs>

          {/*value === 0 && <TabContainer>Overview goes here</TabContainer>*/}
          {value === 0 && <Genomes />}
          {value === 1 && <PFContainer />}


        </Paper>
      </div>

    </div>
  )
};

render(<App />, document.getElementById("test"));