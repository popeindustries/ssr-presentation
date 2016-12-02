'use strict';

process.env.NODE_ENV = 'production';

const { React, ReactDOMServer } = require('./react.min');
const bench = require('./bench');
const word = require('./word');
const el = React.createElement;

const BREADTH = 11;
const DEPTH = 4;

const component = function render (props, state) {
  const { depth, breadth } = props;
  let children = [];

  if (depth <= 0) return el('div', null, word(Math.random() * 100));

  for (let i = 0; i < breadth; i++) {
    children.push(el(component, { key: i, depth: depth - 1, breadth }));
  }

  return el('div', { children });
};

function render () {
  return ReactDOMServer.renderToString(el(component, { depth: DEPTH, breadth: BREADTH }));
}

bench('stateless component', render);