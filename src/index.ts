import { cosmiconfig } from 'cosmiconfig'
import { type ClientConfig } from 'pg'
import ConnectionParameters from 'pg/lib/connection-parameters'
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
  const defaulted = new ConnectionParameters(base)
  if (base.user) defaulted.user = base.user
  const result = { ...defaulted, password: defaulted.password }
  if (!result.password) {
    result.password = await new Promise((resolve) => pgpass(result, resolve))
  }
  return result
}
