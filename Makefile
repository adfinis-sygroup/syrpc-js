BIN=$(shell npm bin)
SRCS=$(wildcard syrpc/*.js)
OBJS=$(subst syrpc/,lib/,$(SRCS))

all: lib $(OBJS) $(BIN)/babel

$(BIN)/mocha:
	npm install mocha

$(BIN)/babel:
	npm install babel

test: all $(BIN)/mocha
	$(BIN)/mocha tests/unit.js

lib:
	mkdir -p lib

lib/%.js: syrpc/%.js
	$(BIN)/babel $< > $@
