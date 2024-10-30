import { logger } from '../logger.js'
import { BaseConfig } from './base.js'
import { getVar, parseIntOr } from './index.js'

export interface ISimpleConfig {
  DEPLOY_MODE: 'compose'
  JUPYTER_PROTOCOL: string
  JUPYTER_HOST: string
  JUPYTER_PORT: number | null
  JUPYTER_TOKEN: string
}

export class SimpleConfig extends BaseConfig implements ISimpleConfig {
  public readonly DEPLOY_MODE: 'compose' = 'compose'
  public readonly JUPYTER_PROTOCOL: string
  public readonly JUPYTER_HOST: string
  public readonly JUPYTER_PORT: number | null
  public readonly JUPYTER_TOKEN: string

  public constructor() {
    super()

    this.JUPYTER_PROTOCOL = process.env['JUPYTER_PROTOCOL'] || 'http'
    if (this.JUPYTER_PROTOCOL !== 'http' && this.JUPYTER_PROTOCOL !== 'https') {
      logger().warn(
        {
          protocol: this.JUPYTER_PROTOCOL,
        },
        'Invalid JUPYTER_PROTOCOL, defaulting to http'
      )
      this.JUPYTER_PROTOCOL = 'http'
    }

    this.JUPYTER_HOST = getVar('JUPYTER_HOST')
    this.JUPYTER_PORT = parseIntOr(process.env['JUPYTER_PORT'] ?? '', -1)
    if (this.JUPYTER_PORT === -1) {
      this.JUPYTER_PORT = null
    }
    this.JUPYTER_TOKEN = getVar('JUPYTER_TOKEN')
  }
}

let config: SimpleConfig
export function simpleConfig() {
  if (config) {
    return config
  }

  config = new SimpleConfig()

  return config
}
