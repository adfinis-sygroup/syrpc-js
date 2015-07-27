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

$(BASE)/siphash:
	npm install

test: all $(BIN)/mocha $(BIN)/istanbul $(BASE)/siphash
	rm -rf coverage
	$(BIN)/istanbul cover $(BIN)/_mocha tests/*.js
	$(BIN)/istanbul report text

lib:
	mkdir -p lib

lib/%.js: syrpc/%.js
	$(BIN)/babel $< > $@
