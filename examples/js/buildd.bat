rem browserify app.js -o app-bundle.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc

CALL browserify app.js -o app-bundle.js -d --ignore ../cpp/build/Release/fin.node --ignore smalloc
rem CALL uglifyjs big-app-bundle.js -c hoist_vars=false,if_return=false,keep_fnames -o app-bundle.js
rem CALL uglifyjs big-app-bundle.js -b -o app-bundle.js
rem del big-app-bundle.js