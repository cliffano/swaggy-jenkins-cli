examples-remoteaccess:
	swaggy-jenkins response2definition examples/remoteaccess/responses --reporter file --out-file examples/remoteaccess/definitions.yml

examples-blueocean:
	swaggy-jenkins response2definition examples/blueocean/responses --reporter file --out-file examples/blueocean/definitions.yml

.PHONY: examples-remoteaccess examples-blueocean
