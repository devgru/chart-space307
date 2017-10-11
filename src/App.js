import React, { Component } from 'react';
import './App.css';

import { range } from 'd3-array';

import MyChart from './MyChart';

class App extends Component {
  render() {
    const data = range(0, 1000).map((i) => {
      return {
        id: i,
        x: i,
        y: (Math.random() - 0.5) * i
      }
    });

    return (
      <div className="App">
        <MyChart data={data} />
      </div>
    );
  }
}

export default App;
