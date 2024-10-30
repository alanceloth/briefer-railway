import dotenv from 'dotenv'
import { ISimpleConfig, simpleConfig } from './simple.js'
import { IBaseConfig } from './base.js'

dotenv.config()

export type BrieferConfig = IBaseConfig & ISimpleConfig

export function getVar(key: string, allowEmpty?: boolean) {
  const value = process.env[key]

  if (allowEmpty && value === '') {
    return ''
  }

  if (!value) {
    throw new Error(`Missing ${key} environment variable`)
  }

  return value
}

export function parseIntOr(value: string, defaultValue: number): number {
  const parsed = parseInt(value)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

export function config(): BrieferConfig {
  return simpleConfig()
}
