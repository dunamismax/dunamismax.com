.PHONY: serve check build test-db verify
serve:
	APP_ENV=local pnpm run dev
check:
	pnpm run check
	pnpm run db:check
	pnpm run test
build:
	pnpm run build
test-db:
	bash deploy/rehearse.sh
# Every gate in AGENTS.md section 8, in order. Uses Homebrew's PostgreSQL 18 on macOS unless PGBIN is set.
verify:
	pnpm run check
	pnpm run db:check
	pnpm run test
	APP_ENV=production pnpm run build
	if [ -z "$$PGBIN" ] && [ -x /opt/homebrew/opt/postgresql@18/bin/initdb ]; then export PGBIN=/opt/homebrew/opt/postgresql@18/bin LC_ALL="$${LC_ALL:-en_US.UTF-8}"; fi; bash deploy/rehearse.sh
	for file in deploy/*.sh; do bash -n "$$file" || exit 1; done
	shellcheck -x deploy/*.sh
	git diff --check
