rem browserify app.js -o app-bundle.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc

CALL browserify app-active.js -o big-app-bundle-active.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc
REM CALL uglifyjs big-app-bundle.js -c hoist_vars=false,if_return=false,keep_fnames -o app-bundle.js
CALL uglifyjs big-app-bundle-active.js -b -o app-bundle-active.js
del big-app-bundle-active.js

CALL browserify app-inert.js -o big-app-bundle-inert.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc
REM CALL uglifyjs big-app-bundle.js -c hoist_vars=false,if_return=false,keep_fnames -o app-bundle.js
CALL uglifyjs big-app-bundle-inert.js -b -o app-bundle-inert.js
del big-app-bundle-inert.js