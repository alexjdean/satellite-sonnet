import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock fetch globally for tests
globalThis.fetch = vi.fn()

// Setup cleanup after each test
afterEach(() => {
  vi.restoreAllMocks()
}) 