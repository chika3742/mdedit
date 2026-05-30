#!/bin/sh
# Create a date-based version tag in the form vX.yyyyMMdd.n.
# Try n=0, n=1, ... until git tag succeeds (i.e. the name is unused).
# The tag is only created locally; push it manually afterwards.
set -eu

# Edit this to change the major version
MAJOR_VERSION=1

DATE=$(date +%Y%m%d)
PREFIX="v${MAJOR_VERSION}.${DATE}."

n=0
# git tag refuses to overwrite an existing tag, so retry until it succeeds.
while ! git tag "${PREFIX}${n}" 2>/dev/null; do
  n=$((n + 1))
done

NEW_TAG="${PREFIX}${n}"
echo "Created tag: ${NEW_TAG}"
