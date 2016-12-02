'use strict';

const benchmark = require('benchmark');
const chalk = require('chalk');

const suite = new benchmark.Suite();

/**
 * Benchmark 'fn' with 'name'
 * @param {String} name
 * @param {Function} fn
 */
module.exports = function bench (name, fn) {
  // Warmup
  fn();

  console.log(`benchmarking: ${chalk.green(name)}`);

  suite
    .add({ name, fn })
    .on('complete', function () {
      for (let i = 0, n = this.length; i < n; i++) {
        const benchmark = this[i];

        console.log(`  Mean:    ${Math.round(benchmark.stats.mean * 1000)} ms`);
        console.log(`  Std Dev: ${Math.round(benchmark.stats.deviation * 1000)} ms\n`);
      }
    })
    .run();
};