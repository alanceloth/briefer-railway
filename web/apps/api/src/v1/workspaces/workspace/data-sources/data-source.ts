import { Router } from 'express'
import {
  deleteBigQueryDataSource,
  getBigQueryDataSource,
  updateBigQueryDataSource,
  deletePSQLDataSource,
  getPSQLDataSource,
  updatePSQLDataSource,
  deleteRedshiftDataSource,
  getRedshiftDataSource,
  updateRedshiftDataSource,
  getDatasource,
  recoverFromNotFound,
  updateAthenaDataSource,
  getAthenaDataSource,
  deleteAthenaDataSource,
  getOracleDataSource,
  updateOracleDataSource,
  deleteOracleDataSource,
  getMySQLDataSource,
  updateMySQLDataSource,
  deleteMySQLDataSource,
  getTrinoDataSource,
  updateTrinoDataSource,
  deleteTrinoDataSource,
  deleteSQLServerDataSource,
  getSQLServerDataSource,
  updateSQLServerDataSource,
  getSnowflakeDataSource,
  updateSnowflakeDataSource,
  deleteSnowflakeDataSource,
} from '@briefer/database'
import { z } from 'zod'
import { getParam } from '../../../../utils/express.js'
import { config } from '../../../../config/index.js'
import { ping } from '../../../../datasources/index.js'
import { fetchDataSourceStructure } from '../../../../datasources/structure.js'
import {
  broadcastDataSource,
  broadcastDataSources,
} from '../../../../websocket/workspace/data-sources.js'
import { IOServer } from '../../../../websocket/index.js'

const dataSourceRouter = (socketServer: IOServer) => {
  const router = Router({ mergeParams: true })

  const dataSourceSchema = z.union([
    z.object({
      type: z.union([z.literal('psql'), z.literal('redshift')]),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        host: z.string().min(1),
        port: z.string().min(1),
        database: z.string().min(1),
        username: z.string().min(1),
        password: z.string(),
        notes: z.string(),
        readOnly: z.boolean(),
        cert: z.string().optional(),
      }),
    }),
    z.object({
      type: z.union([z.literal('mysql'), z.literal('sqlserver')]),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        host: z.string().min(1),
        port: z.string().min(1),
        database: z.string().min(1),
        username: z.string().min(1),
        password: z.string(),
        notes: z.string(),
        cert: z.string().optional(),
      }),
    }),
    z.object({
      type: z.literal('bigquery'),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        projectId: z.string(),
        serviceAccountKey: z.string(),
        notes: z.string(),
      }),
    }),
    z.object({
      type: z.literal('athena'),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        region: z.string().min(1),
        accessKeyId: z.string(),
        secretAccessKeyId: z.string(),
        s3OutputPath: z.string(),
        notes: z.string(),
      }),
    }),
    z.object({
      type: z.literal('oracle'),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        host: z.string().min(1),
        port: z.string().min(1),
        database: z.string(),
        serviceName: z.string(),
        sid: z.string(),
        username: z.string().min(1),
        password: z.string(),
        notes: z.string(),
      }),
    }),
    z.object({
      type: z.literal('trino'),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        host: z.string().min(1),
        port: z.string().min(1),
        catalog: z.string(),
        username: z.string().min(1),
        password: z.string(),
        notes: z.string(),
        readOnly: z.boolean(),
      }),
    }),
    z.object({
      type: z.literal('snowflake'),
      data: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        account: z.string().min(1),
        user: z.string().min(1),
        password: z.string(),
        warehouse: z.string().min(1),
        database: z.string().min(1),
        region: z.string().optional(),
        notes: z.string(),
      }),
    }),
  ])

  router.put('/', async (req, res) => {
    const payload = dataSourceSchema.safeParse(req.body)
    if (!payload.success) {
      res.status(400).end()
      return
    }

    const workspaceId = getParam(req, 'workspaceId')
    const dataSourceId = getParam(req, 'dataSourceId')
    const data = payload.data
    const existingDb = (
      await Promise.all([
        getPSQLDataSource(workspaceId, dataSourceId),
        getBigQueryDataSource(workspaceId, dataSourceId),
        getRedshiftDataSource(workspaceId, dataSourceId),
        getAthenaDataSource(workspaceId, dataSourceId),
        getOracleDataSource(workspaceId, dataSourceId),
        getMySQLDataSource(workspaceId, dataSourceId),
        getSQLServerDataSource(workspaceId, dataSourceId),
        getTrinoDataSource(workspaceId, dataSourceId),
        getSnowflakeDataSource(workspaceId, dataSourceId),
      ])
    ).find((e) => e !== null)
    if (!existingDb) {
      res.status(404).end()
      return
    }

    if (existingDb.isDemo) {
      res.status(403).end()
      return
    }

    switch (data.type) {
      case 'psql': {
        await updatePSQLDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'mysql': {
        await updateMySQLDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'sqlserver': {
        await updateSQLServerDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'redshift': {
        await updateRedshiftDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'bigquery': {
        await updateBigQueryDataSource(
          {
            ...data.data,
            id: dataSourceId,
            projectId:
              data.data.projectId === '' ? undefined : data.data.projectId,
            serviceAccountKey:
              data.data.serviceAccountKey === ''
                ? undefined
                : data.data.serviceAccountKey,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'athena': {
        await updateAthenaDataSource(
          {
            ...data.data,
            id: dataSourceId,
            accessKeyId:
              data.data.accessKeyId === '' ? undefined : data.data.accessKeyId,
            secretAccessKeyId:
              data.data.secretAccessKeyId === ''
                ? undefined
                : data.data.secretAccessKeyId,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'oracle': {
        if (!data.data.sid && !data.data.serviceName && !data.data.database) {
          res.status(400).json({
            error: 'Either service name, database or SID must be provided',
          })
          return
        }

        await updateOracleDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'trino': {
        await updateTrinoDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
      case 'snowflake': {
        await updateSnowflakeDataSource(
          {
            ...data.data,
            id: dataSourceId,
            password:
              data.data.password === '' ? undefined : data.data.password,
          },
          config().DATASOURCES_ENCRYPTION_KEY
        )
        break
      }
    }

    const ds = await getDatasource(workspaceId, dataSourceId, data.type)
    if (!ds) {
      req.log.error(
        {
          workspaceId,
          dataSourceId,
          type: data.type,
        },
        'Failed to find datasource after update'
      )
      res.status(500).end()
      return
    }

    const structure = await fetchDataSourceStructure(socketServer, ds, {
      forceRefresh: true,
    })

    const result = await ping(socketServer, { config: ds, structure })
    res.json(result)
  })

  router.delete('/', async (req, res) => {
    const workspaceId = getParam(req, 'workspaceId')
    const targetId = getParam(req, 'dataSourceId')

    const run = async () => {
      const targetPsqlDb = await recoverFromNotFound(
        deletePSQLDataSource(workspaceId, targetId)
      )
      if (targetPsqlDb) {
        return {
          status: 200,
          payload: {
            type: 'psql',
            data: targetPsqlDb,
          },
        }
      }

      const targetRedshiftDb = await recoverFromNotFound(
        deleteRedshiftDataSource(targetId)
      )
      if (targetRedshiftDb) {
        return {
          status: 200,
          payload: {
            type: 'redshift',
            data: targetRedshiftDb,
          },
        }
      }

      const targetBigQueryDb = await recoverFromNotFound(
        deleteBigQueryDataSource(targetId)
      )
      if (targetBigQueryDb) {
        return {
          status: 200,
          payload: {
            type: 'bigquery',
            data: targetBigQueryDb,
          },
        }
      }

      const targetAthenaDb = await recoverFromNotFound(
        deleteAthenaDataSource(workspaceId, targetId)
      )
      if (targetAthenaDb) {
        return {
          status: 200,
          payload: {
            type: 'athena',
            data: targetAthenaDb,
          },
        }
      }

      const targetOracleDb = await recoverFromNotFound(
        deleteOracleDataSource(workspaceId, targetId)
      )
      if (targetOracleDb) {
        return {
          status: 200,
          payload: {
            type: 'oracle',
            data: targetOracleDb,
          },
        }
      }

      const targetMySQLDb = await recoverFromNotFound(
        deleteMySQLDataSource(workspaceId, targetId)
      )
      if (targetMySQLDb) {
        return {
          status: 200,
          payload: {
            type: 'mysql',
            data: targetMySQLDb,
          },
        }
      }

      const targetSQLServerDb = await recoverFromNotFound(
        deleteSQLServerDataSource(workspaceId, targetId)
      )
      if (targetSQLServerDb) {
        return {
          status: 200,
          payload: {
            type: 'sqlserver',
            data: targetSQLServerDb,
          },
        }
      }

      const targetTrinoDb = await recoverFromNotFound(
        deleteTrinoDataSource(workspaceId, targetId)
      )
      if (targetTrinoDb) {
        return {
          status: 200,
          payload: {
            type: 'trino',
            data: targetTrinoDb,
          },
        }
      }

      const targetSnowflakeDb = await recoverFromNotFound(
        deleteSnowflakeDataSource(workspaceId, targetId)
      )
      if (targetSnowflakeDb) {
        return {
          status: 200,
          payload: {
            type: 'snowflake',
            data: targetSnowflakeDb,
          },
        }
      }

      return { status: 404 }
    }

    const { status, payload } = await run()
    await broadcastDataSources(socketServer, workspaceId)

    if (payload) {
      res.status(status).json(payload)
    } else {
      res.status(status).end()
    }
  })

  const typeSchema = z.object({
    type: z.union([
      z.literal('psql'),
      z.literal('redshift'),
      z.literal('bigquery'),
      z.literal('athena'),
      z.literal('oracle'),
      z.literal('mysql'),
      z.literal('trino'),
      z.literal('sqlserver'),
      z.literal('snowflake'),
    ]),
  })
  router.post('/ping', async (req, res) => {
    const result = typeSchema.safeParse(req.body)
    if (!result.success) {
      res.status(400).end()
      return
    }

    const workspaceId = getParam(req, 'workspaceId')
    const dataSourceId = getParam(req, 'dataSourceId')
    try {
      const dsConfig = await getDatasource(
        workspaceId,
        dataSourceId,
        result.data.type
      )
      if (!dsConfig) {
        res.status(404).end()
        return
      }

      const structure = await fetchDataSourceStructure(socketServer, dsConfig, {
        forceRefresh: false,
      })

      const ds = await ping(socketServer, { config: dsConfig, structure })

      broadcastDataSource(socketServer, ds)

      res.json({
        lastConnection: dsConfig.data.lastConnection,
        connStatus: dsConfig.data.connStatus,
      })
    } catch (err) {
      req.log.error(
        {
          workspaceId,
          dataSourceId,
          err,
        },
        'Failed to ping data source'
      )
      res.status(500).end()
    }
  })

  return router
}

export default dataSourceRouter