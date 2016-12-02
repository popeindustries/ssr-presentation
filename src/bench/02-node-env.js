'use strict';

process.env.NODE_ENV = 'production';

const bench = require('./bench');
const React = require('react');
const ReactDOM = require('react-dom/server');
const word = require('./word');
const el = React.createElement;

const BREADTH = 11;
const DEPTH = 4;

const component = React.createClass({
  render () {
    const { depth, breadth } = this.props;
    let children = [];

    if (depth <= 0) return el('div', null, word(Math.random() * 100));

    for (let i = 0; i < breadth; i++) {
      children.push(el(component, { key: i, depth: depth - 1, breadth }));
    }

    return el('div', { children });
  }
});

function render () {
  return ReactDOM.renderToString(el(component, { depth: DEPTH, breadth: BREADTH }));
}

bench('NODE_ENV=production', render);