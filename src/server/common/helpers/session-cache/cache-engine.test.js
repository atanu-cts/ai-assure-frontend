import { vi } from 'vitest'

import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { getCacheEngine } from './cache-engine.js'

const mockLoggerInfo = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('ioredis', () => ({
  ...vi.importActual('ioredis'),
  Cluster: vi.fn(function () {
    return { on: () => ({}) }
  }),
  Redis: vi.fn(function () {
    return { on: () => ({}) }
  })
}))
vi.mock('@hapi/catbox-redis')
vi.mock('@hapi/catbox-memory')
vi.mock('../logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

describe('#getCacheEngine', () => {
  describe('When Redis cache engine has been requested', () => {
    beforeEach(() => {
      getCacheEngine('redis')
    })

    test('Should setup Redis cache', () => {
      expect(CatboxRedis).toHaveBeenCalledWith(expect.any(Object))
    })

    test('Should log expected Redis message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith('Using Redis session cache')
    })
  })

  describe('When Memory cache engine has been requested', () => {
    beforeEach(() => {
      getCacheEngine('memory')
    })

    test('Should setup Memory cache', () => {
      expect(CatboxMemory).toHaveBeenCalled()
    })

    test('Should log expected Memory message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
    })
  })
})
