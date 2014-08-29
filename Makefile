test:
	@node node_modules/lab/bin/lab
test-cov:
	@node node_modules/lab/bin/lab -t 100 -v
test-cov-html:
	@node node_modules/lab/bin/lab -v -r html -o coverage.html
test-verbose:
	@node node_modules/lab/bin/lab -v


.PHONY: test test-cov test-cov-html test-verbose
