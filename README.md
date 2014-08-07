# Cooldown

Timer mechanism to limit place upper bound on rate of events.

## Example

This example reads lines of text from stdin.  When 'spam' is entered, it will
output 'spam' but only at a rate of once per 5 seconds.  Entering 'reset' can
reset the cooldown and allow 'spam' to succeed immediately after.  Entering
'ready?' will display the state of the cooldown timer.  The 'ready' event
listener will automatically print when the timer is off cooldown.

```javascript
var Cooldown = require('./index');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Set limit to 5s
var cd = new Cooldown(5000);
cd.on('ready', console.log.bind('console', 'off cooldown'));

rl.on('line', function (line) {
  switch (line) {
  case 'spam':
    if (cd.fire()) {
      console.log('have some spam');
    } else {
      console.log('not yet');
    }
    break;
  case 'ready?':
    console.log(cd.ready ? 'yep' : 'nope');
    break;
  case 'reset':
    // reset the cooldown
    cd.reset();
    break;
  case 'quit':
    cd.destroy();
    rl.close();
    break;
  }
});
```

## Installation

    npm install cooldown

## License

BSD


## Bugs

See <https://github.com/pfmooney/node-cooldown/issues>.
