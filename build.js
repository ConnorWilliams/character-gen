// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
require('esbuild').buildSync({
    bundle: true,
    platform: 'node',
    target: 'es2020',
    /*
        We can't reference typescript files here because of the following:
          https://github.com/shiftcode/dynamo-easy/issues/363
          https://github.com/evanw/esbuild/issues/1597
       */
    entryPoints: [
        'src/chats-handler.js',
    ],
    // eslint-disable-next-line no-undef
    absWorkingDir: path.join(__dirname, `dist`),
    minify: true,
    outdir: 'bundle',
});
