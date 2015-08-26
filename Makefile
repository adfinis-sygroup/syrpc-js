BIN=$(shell npm bin)
BASE=$(subst .bin,,$(BIN))
SRCS=$(wildcard syrpc/*.js)
OBJS=$(subst syrpc/,lib/,$(SRCS))

all: lib install $(OBJS)

README.md: README.rst
	pandoc README.rst -o README.md

doc: $(BIN)/jsdoc README.md all
	$(BIN)/jsdoc -d docs -c jsdoc.json main.md syrpc/server.js syrpc/client.js

install:
	npm install

test: all
	rm -rf coverage
	$(BIN)/istanbul cover -x lib/runner.js $(BIN)/_mocha tests/*.js
	$(BIN)/istanbul report text
	$(BIN)/istanbul check-coverage --lines 95 --functions 95 --statements 97 --branches 95

lib:
	mkdir -p lib

lib/%.js: syrpc/%.js
	$(BIN)/babel $< > $@
