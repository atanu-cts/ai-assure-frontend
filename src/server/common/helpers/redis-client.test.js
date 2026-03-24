import { vi } from 'vitest'

import { Cluster, Redis } from 'ioredis'

import { config } from '../../../config/config.js'
import { buildRedisClient } from './redis-client.js'

vi.mock('ioredis', () => ({
  ...vi.importActual('ioredis'),
  Cluster: vi.fn(function () {
    return { on: () => ({}) }
  }),
  Redis: vi.fn(function () {
    return { on: () => ({}) }
  })
}))

describe('#buildRedisClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When Redis Single InstanceCache is requested', () => {
    beforeEach(() => {
      buildRedisClient({ ...config.get('redis'), useSingleInstanceCache: true })
    })

    test('Should instantiate a single Redis client', () => {
      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          db: 0,
          host: '127.0.0.1',
          keyPrefix: 'ai-assure-frontend:',
          port: 6379
        })
      )
    })

    test('Should not instantiate a Redis Cluster', () => {
      expect(Cluster).not.toHaveBeenCalled()
    })
  })

  describe('When a Redis Cluster is requested', () => {
    beforeEach(() => {
      buildRedisClient({
        ...config.get('redis'),
        useSingleInstanceCache: false,
        useTLS: true,
        username: 'user',
        password: 'pass'
      })
    })

    test('Should instantiate a Redis Cluster client', () => {
      expect(Cluster).toHaveBeenCalledWith(
        [{ host: '127.0.0.1', port: 6379 }],
        {
          dnsLookup: expect.any(Function),
          keyPrefix: 'ai-assure-frontend:',
          redisOptions: { db: 0, password: 'pass', tls: {}, username: 'user' },
          slotsRefreshTimeout: 10000
        }
      )
    })

    test('Should not instantiate a single Redis client', () => {
      expect(Redis).not.toHaveBeenCalled()
    })
  })
})
