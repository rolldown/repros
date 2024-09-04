function foo() {
  if (!!(process.env.NODE_ENV !== 'production')) {
    bar()
  }
}

function foo2() {
  if (!!false) {
    bar()
  }
}

function bar() {
  console.log('long message')
}

foo()
foo2()
