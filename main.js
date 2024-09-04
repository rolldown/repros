// this doesn't work
function foo() {
  if (!!(process.env.NODE_ENV !== 'production')) {
    bar()
  }
}

// this works
function foo2() {
  if (!!false) {
    bar()
  }
}

// this also works
function foo3() {
  if (process.env.NODE_ENV !== 'production') {
    bar()
  }
}

function bar() {
  console.log('long message')
}

foo()
foo2()
foo3()
