rem browserify app.js -o app-bundle.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc

CALL browserify app.js -o big-app-bundle.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc
REM CALL uglifyjs big-app-bundle.js -c hoist_vars=false,if_return=false,keep_fnames -o app-bundle.js
CALL uglifyjs big-app-bundle.js -b -o app-bundle.js
del big-app-bundle.js