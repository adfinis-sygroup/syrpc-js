node_modules/.bin/mocha:
	npm install .

test: node_modules/.bin/mocha
	node_modules/.bin/mocha tests/unit.js
