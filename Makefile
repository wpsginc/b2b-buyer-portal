SHELL:=/bin/bash
PACKAGE_VERSION=$$(cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | sed 's/[,.]/-/g')
PV:=$(shell echo $(PACKAGE_VERSION))

deploy:
	@echo 'Deploying to Version $(PV)'
	@az storage blob upload-batch --account-name buyersportal --source ./apps/storefront/dist --destination '$$web/BPE/${PV}' --overwrite
build-staging:
	@echo 'STAGING'
	@echo $(PACKAGE_VERSION)
	az storage blob upload-batch --account-name buyersportal --source ./apps/storefront/dist/staging --destination '$$web/BPE/staging/${PV}' --overwrite


# check package json version
# check env same version in package json
# then yarn build