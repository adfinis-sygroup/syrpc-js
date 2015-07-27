BIN=$(shell npm bin)
SRCS=$(wildcard syrpc/*.js)
OBJS=$(subst syrpc/,lib/,$(SRCS))

all: lib $(BIN)/babel $(OBJS)

$(BIN)/mocha:
	npm install mocha

$(BIN)/babel:
	npm install babel

$(BIN)/istanbul:
	npm install istanbul

test: all $(BIN)/mocha $(BIN)/istanbul
	rm -rf coverage
	$(BIN)/istanbul cover $(BIN)/_mocha tests/*.js
	$(BIN)/istanbul report text

lib:
	mkdir -p lib

lib/%.js: syrpc/%.js
	$(BIN)/babel $< > $@
