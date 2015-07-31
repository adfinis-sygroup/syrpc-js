BIN=$(shell npm bin)
BASE=$(subst .bin,,$(BIN))
SRCS=$(wildcard syrpc/*.js)
OBJS=$(subst syrpc/,lib/,$(SRCS))

all: lib $(BIN)/babel $(OBJS)

$(BIN)/mocha:
	npm install mocha

$(BIN)/babel:
	npm install babel

$(BIN)/istanbul:
	npm install istanbul

$(BIN)/jsdoc:
	npm install https://github.com/jsdoc3/jsdoc

$(BASE)/siphash:
	npm install

doc: $(BIN)/jsdoc all
	$(BIN)/jsdoc -d docs -c jsdoc.json syrpc/server.js syrpc/client.js

test: all $(BIN)/mocha $(BIN)/istanbul $(BASE)/siphash
	rm -rf coverage
	$(BIN)/istanbul cover $(BIN)/_mocha tests/*.js
	$(BIN)/istanbul report text
	$(BIN)/istanbul check-coverage --lines 95 --functions 95 --statements 83

lib:
	mkdir -p lib

lib/%.js: syrpc/%.js
	$(BIN)/babel $< > $@
