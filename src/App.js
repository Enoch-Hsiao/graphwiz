import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SinglePlayer from './pages/SinglePlayer';
import MultiPlayer from './pages/MultiPlayer';
import './App.css';

export default function App() {
  return (
    <Router>
      <Route exact path="/">
          <Redirect to="/home" />
      </Route>
      <Route path="/home" component={Homepage} />
      <Route path="/singleplayer" component={SinglePlayer} />
      <Route
        path="/multiplayer/:id"
        render={(props) => <MultiPlayer {...props} />}
      />
    </Router>
  );
}
