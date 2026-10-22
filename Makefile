.PHONY: serve check build test-db
serve:
	APP_ENV=local npm run dev
check:
	npm run check
	npm test
build:
	npm run build
test-db:
	bash deploy/rehearse.sh
