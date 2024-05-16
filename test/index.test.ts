import { describe, it } from 'mocha'
import chai, { expect } from 'chai'
import chaiSubset from 'chai-subset'
import fs from 'fs/promises'
import path from 'path'
chai.use(chaiSubset)
import { getPgConfig } from '../src'

const configFile = path.resolve(__dirname, '..', '.get-pg-configrc.json')
const pgpassfile = path.resolve(__dirname, '..', '.pgpass')

describe(`getPgConfig`, function () {
  beforeEach(async function () {
    await fs.unlink(configFile).catch(() => {})
    await fs.unlink(pgpassfile).catch(() => {})
  })
  after(async function () {
    await fs.unlink(configFile).catch(() => {})
    await fs.unlink(pgpassfile).catch(() => {})
  })
  it(`with separate fields`, async function () {
    const fields = {
      host: 'foo',
      port: 5431,
      user: 'us',
      password: 'passss',
      database: 'dbbb',
    }
    expect(await getPgConfig(fields)).to.containSubset(fields)
  })
  it(`with connectionString`, async function () {
    expect(
      await getPgConfig({
        connectionString: 'postgres://user:pass@localhost:5431/db',
      })
    ).to.containSubset({
      host: 'localhost',
      port: 5431,
      user: 'user',
      password: 'pass',
      database: 'db',
    })
  })
  describe(`with env vars`, function () {
    let envBefore = { ...process.env }
    beforeEach(() => (envBefore = { ...process.env }))
    afterEach(() => (process.env = envBefore))
    it(`works`, async function () {
      process.env.PGHOST = 'hozt'
      process.env.PGUSER = 'uzer'
      process.env.PGPORT = '5438'
      process.env.PGPASSWORD = 'pazzword'
      process.env.PGDATABASE = 'dbz'
      expect(await getPgConfig()).to.containSubset({
        host: 'hozt',
        port: 5438,
        user: 'uzer',
        password: 'pazzword',
        database: 'dbz',
      })
      expect(await getPgConfig({ user: 'USER' })).to.containSubset({
        host: 'hozt',
        port: 5438,
        user: 'USER',
        password: 'pazzword',
        database: 'dbz',
      })
    })
    it(`custom PGPASSFILE works`, async function () {
      await fs.writeFile(
        pgpassfile,
        `localhost:*:*:postgres:pgpassword
localhost:*:*:foo:foopassword
remote:*:*:foo:remotepass

`,
        { encoding: 'utf8', mode: 0o600 }
      )
      process.env.PGPASSFILE = pgpassfile
      expect(await getPgConfig({ user: 'postgres' })).to.containSubset({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'pgpassword',
        database: 'postgres',
      })
      expect(await getPgConfig({ user: 'foo' })).to.containSubset({
        host: 'localhost',
        port: 5432,
        user: 'foo',
        password: 'foopassword',
        database: 'foo',
      })
      expect(
        await getPgConfig({ host: 'remote', user: 'foo' })
      ).to.containSubset({
        host: 'remote',
        port: 5432,
        user: 'foo',
        password: 'remotepass',
        database: 'foo',
      })
    })
  })
  it(`config works`, async function () {
    await fs.writeFile(
      configFile,
      JSON.stringify({
        defaults: {
          user: 'postgres',
        },
      }),
      { encoding: 'utf8', mode: 0o600 }
    )
    expect(await getPgConfig()).to.containSubset({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      database: 'postgres',
    })
    expect(await getPgConfig({ database: 'foo' })).to.containSubset({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      database: 'foo',
    })
    expect(await getPgConfig({ user: 'foo' })).to.containSubset({
      host: 'localhost',
      port: 5432,
      user: 'foo',
      database: 'foo',
    })
  })
})
