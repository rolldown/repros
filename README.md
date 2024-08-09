## `treeshake.moduleSideEffects: false` bugs

1. Check `dist/main-correct.js` line 596: `exports.pug = ...`
2. Check `dist/main.js` - no `exports.pug =` is found, many such exports are incorrectly removed
