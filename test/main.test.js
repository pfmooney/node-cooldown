// Copyright 2014, Patrick Mooney.  All rights reserved.

var test = require('tape').test;
var util = require('util');


///--- GLOBALS
var Cooldown;
var TIMEOUT = 500;
var cd;

var timerStart;
function start() {
  timerStart = process.hrtime();
}
function elapsed() {
  var diff = process.hrtime(timerStart);
  return (diff[0] * 1000)  + (diff[1] / 1000000);
}

test('load', function (t) {
  Cooldown = require('../index');
  t.ok(Cooldown);
  t.end();
});

test('basic', function (t) {
  var interval;

  cd = new Cooldown(TIMEOUT);

  start();
  t.ok(cd.fire(), 'started');

  function done() {
    clearInterval(interval);
    cd.destroy();
    t.end();
  }

  interval = setInterval(function () {
    var diff = elapsed();
    if (cd.ready) {
      t.ok(diff > TIMEOUT, util.format('%d > %d', diff, TIMEOUT));
      done();
    } else if (diff > 2*TIMEOUT) {
      t.fail('too late');
      done();
    }
  }, 10);
});

test('fire during cd', function (t) {
  cd = new Cooldown(TIMEOUT);
  t.ok(cd.ready, 'ready');
  start();
  t.ok(cd.fire(), 'started');
  t.ok(!cd.ready, 'not ready while on cd');

  // attempt to re-fire cooldown after 1/2 timeout
  setTimeout(function () {
    t.ok(!cd.fire(), 'did not fire while on cd');
  }, TIMEOUT/2);

  cd.once('ready', function () {
    var diff = elapsed();
    var max = TIMEOUT + (TIMEOUT/2);
    t.ok(diff > TIMEOUT, util.format('%d > %d', diff, TIMEOUT));
    // ensure the second firing didn't stretch the window
    t.ok(diff < max, util.format('%d < %d', diff, max));
    t.end();
  });
});

test('events', function (t) {
  cd = new Cooldown(TIMEOUT);

  cd.once('cooldown', function () {
    t.ifError(cd.ready, 'not ready while on cd');
    cd.once('ready', function () {
      t.ok(cd.ready, 'ready when off cd');
      t.end();
    });
  });

  t.ok(cd.fire(), 'start');
});

test('events - ready (not blocked)', function (t) {
  cd = new Cooldown(TIMEOUT);
  cd.once('ready', function (blocked) {
    t.equal(blocked, false);
    t.end();
  });
  // only fire once
  t.ok(cd.fire());
});

test('events - ready (blocked)', function (t) {
  cd = new Cooldown(TIMEOUT);
  cd.once('ready', function (blocked) {
    t.equal(blocked, true);
    t.end();
  });
  // fire twice so once is blocked
  t.ok(cd.fire());
  t.notOk(cd.fire());
});

test('reset', function (t) {
  cd = new Cooldown(TIMEOUT);

  start();
  t.ok(cd.fire(), 'started');
  cd.once('ready', function () {
    t.ok(cd.ready, 'reset');
    var diff = elapsed();
    t.ok(diff < TIMEOUT, util.format('%d < %d', diff, TIMEOUT));
    cd.on('ready', t.fail.bind(t));
    t.end();
  });
  cd.reset();
});

test('reset - already ready', function (t) {
  cd = new Cooldown(TIMEOUT);
  t.ok(cd.ready);
  cd.on('ready', t.fail.bind(t, 'ready should not be emitted'));
  cd.reset();
  t.ok(cd.ready);
  t.end();
});

test('reset - noEmit', function (t) {
  cd = new Cooldown(TIMEOUT);

  t.ok(cd.fire(), 'started');
  cd.on('ready', t.fail.bind(t, 'ready should not be emitted'));
  cd.reset(true);
  t.ok(cd.ready, 'reset');
  t.end();
});

test('destroy', function (t) {
  cd = new Cooldown(TIMEOUT);

  t.ok(cd.fire(), 'started');
  cd.on('ready', t.fail.bind(t, 'ready should not be emitted'));
  cd.destroy();
  t.ok(!cd.ready, 'destroyed');
  t.end();
});
