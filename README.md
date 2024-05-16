# @jcoreio/get-pg-config

apply default postgres connection config from dotfiles and .pgpass

[![CircleCI](https://circleci.com/gh/jcoreio/get-pg-config.svg?style=svg)](https://circleci.com/gh/jcoreio/get-pg-config)
[![Coverage Status](https://codecov.io/gh/jcoreio/get-pg-config/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/get-pg-config)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40jcoreio%2Fget-pg-config.svg)](https://badge.fury.io/js/%40jcoreio%2Fget-pg-config)

This solves two minor problems with `pg`'s default connection parameters:

- it doesn't read `~/.pgpass`/`PGPASSFILE`
- `user` defaults to the OS user. In our work we always use Docker and the `postgres` user,
  so we can configure that as the default with the following in `package.json` or `.get-pg-configrc` etc:
  ```json
  "get-pg-config": {
    "defaults": {
      "user": "postgres"
    }
  }
  ```
