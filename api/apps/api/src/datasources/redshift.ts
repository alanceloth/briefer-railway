import { config } from '../config/index.js'
import prisma, { RedshiftDataSource } from '@briefer/database'
import { DataSourceStatus } from './index.js'
import { pingPSQL } from '../python/query/psql.js'

export async function ping(
  ds: RedshiftDataSource
): Promise<RedshiftDataSource> {
  const lastConnection = new Date()
  const err = await pingPSQL(
    ds,
    'redshift',
    config().DATASOURCES_ENCRYPTION_KEY
  )

  if (!err) {
    return updateConnStatus(ds, {
      connStatus: 'online',
      lastConnection,
    })
  }

  return updateConnStatus(ds, { connStatus: 'offline', connError: err })
}

export async function updateConnStatus(
  ds: RedshiftDataSource,
  status: DataSourceStatus
): Promise<RedshiftDataSource> {
  const newDs = await prisma().redshiftDataSource.update({
    where: { id: ds.id },
    data: {
      connStatus: status.connStatus,
      lastConnection:
        status.connStatus === 'online' ? status.lastConnection : undefined,
      connError:
        status.connStatus === 'offline'
          ? JSON.stringify(status.connError)
          : undefined,
    },
  })

  return {
    ...ds,
    connStatus: newDs.connStatus,
    lastConnection: newDs.lastConnection?.toISOString() ?? null,
    connError: newDs.connError,
  }
}
