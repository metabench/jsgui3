CALL browserify app.js -o big-app-bundle.js --ignore ../cpp/build/Release/fin.node --ignore smalloc
REM CALL uglifyjs big-app-bundle.js -c hoist_vars=false,if_return=false,keep_fnames -o app-bundle.js
CALL uglifyjs big-app-bundle.js -c -o app-bundle.js
del big-app-bundle.js
REM pause