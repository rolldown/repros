
//#region main.js
function foo() {
	if (!!false) {
		bar();
	}
}
function foo2() {}
function bar() {
	console.log("long message");
}
foo();
foo2();

//#endregion