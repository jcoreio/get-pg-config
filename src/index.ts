import { cosmiconfig } from 'cosmiconfig'
import { Client, type ClientConfig } from 'pg'
// @ts-expect-error not typed
import pgpass from 'pgpass'

export async function getPgConfig(given?: ClientConfig): Promise<ClientConfig> {
  const defaults =
    (await cosmiconfig('get-pg-config').search())?.config?.defaults || {}
  const base = { ...given }
  if (defaults) {
    for (const key in defaults) {
      if (defaults[key] != null && (base as any)[key] == null) {
        ;(base as any)[key] = defaults[key]
      }
    }
  }
  // const defaulted = new ConnectionParameters(base)
  const { user, database, password, port, host, ssl } = new Client(base)
  const defaulted = { user, database, password, port, host, ssl }
  if (base.user) defaulted.user = base.user
  const result = { ...defaulted, password: defaulted.password }
  if (!result.password) {
    result.password = await new Promise((resolve) => pgpass(result, resolve))
  }
  return result
}
