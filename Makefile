install: #node_modules
	rm -rf node_modules && npm install

doc:
	npm run jsdoc && open ./doc/index.html

.PHONY: doc
.PHONY: server
