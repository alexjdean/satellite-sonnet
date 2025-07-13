import { render, screen, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

// Mock data for tests
const mockApiResponse = {
  date: '2025-01-11',
  visitor_count: 42,
  copyright: 'Test Photographer',
  poem: '**Test Poem Title**\n\nFirst line of poem\nSecond line of poem',
  title: 'Test APOD Title',
  imageUrl: 'https://example.com/test-image.jpg',
  explanation: 'This is a test explanation of the astronomical image.'
}

const mockApiResponseMissingFields = {
  date: '2025-01-10', // Yesterday
  visitor_count: null,
  copyright: 'null',
  poem: '',
  title: 'Test Title',
  imageUrl: null,
  explanation: null
}

describe('App Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks()
    
    // Mock current date to 2025-01-11 for consistent testing
    vi.setSystemTime(new Date('2025-01-11T12:00:00Z'))
  })

  it('shows loading state initially', () => {
    // Mock fetch to never resolve (simulate slow network)
    fetch.mockImplementation(() => new Promise(() => {}))
    
    render(<App />)
    
    expect(screen.getByText('Warming up the telescopes…')).toBeInTheDocument()
    expect(document.querySelector('.skeleton')).toBeInTheDocument()
  })

  it('renders complete content when API returns all fields', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Today is Saturday, January 11, 2025')).toBeInTheDocument()
    })

    expect(screen.getByText('Welcome! You are visitor number 42 today.')).toBeInTheDocument()
    expect(screen.getByText("Today's image is below.")).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    expect(screen.getByText('© Test Photographer')).toBeInTheDocument()
    expect(screen.getByText('Test Poem Title')).toBeInTheDocument()
    expect(screen.getByText(/First line of poem/)).toBeInTheDocument()
    expect(screen.getByText('This is a test explanation of the astronomical image.')).toBeInTheDocument()
  })

  it('handles missing/null fields gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponseMissingFields
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Today is Friday, January 10, 2025')).toBeInTheDocument()
    })

    // Should not show visitor count when null
    expect(screen.queryByText(/visitor number/)).not.toBeInTheDocument()
    
    // Should not show copyright when "null"
    expect(screen.queryByText(/©/)).not.toBeInTheDocument()
    
    // Should not show poem box when poem is empty
    expect(screen.queryByText(/poem/i)).not.toBeInTheDocument()
    
    // Should not show explanation when null
    expect(screen.queryByText(/explanation/i)).not.toBeInTheDocument()
  })

  it('shows date mismatch warning when API returns old date', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponseMissingFields // Has yesterday's date
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Today's image isn't available yet/)).toBeInTheDocument()
    })

    expect(screen.getByText('Image from Friday, January 10, 2025 is below.')).toBeInTheDocument()
  })

  it('handles fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
  })

  it('handles HTTP error responses', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP 500')).toBeInTheDocument()
    })
  })

  it('parses poem title and body correctly', async () => {
    const poemWithTitle = {
      ...mockApiResponse,
      poem: '**Amazing Space Poem**\n\nLine one\nLine two\nLine three'
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => poemWithTitle
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Amazing Space Poem')).toBeInTheDocument()
    })

    expect(screen.getByText(/Line one/)).toBeInTheDocument()
    expect(screen.getByText(/Line two/)).toBeInTheDocument()
  })

  it('handles poem without title format', async () => {
    const poemNoTitle = {
      ...mockApiResponse,
      poem: 'Just a poem without title markers\nSecond line here'
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => poemNoTitle
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Just a poem without title markers/)).toBeInTheDocument()
    })
  })

  it('toggles dark mode when button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Today is Saturday, January 11, 2025')).toBeInTheDocument()
    })

    const toggleButton = screen.getByText('Prefer dark mode?')
    expect(toggleButton).toBeInTheDocument()
    expect(document.body).toHaveClass('dark-mode') // Default based on system preference

    fireEvent.click(toggleButton)
    expect(screen.getByText('Prefer light mode?')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Prefer light mode?'))
    expect(screen.getByText('Prefer dark mode?')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    // Test the formatDate function indirectly through component rendering
    const testCases = [
      { date: '2025-01-11', expected: 'Saturday, January 11, 2025' },
      { date: '2025-12-25', expected: 'Thursday, December 25, 2025' },
      { date: '2025-07-04', expected: 'Friday, July 4, 2025' }
    ]

    testCases.forEach(({ date, expected }) => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockApiResponse, date })
      })

      const { unmount } = render(<App />)

      waitFor(() => {
        expect(screen.getByText(`Today is ${expected}`)).toBeInTheDocument()
      })

      unmount()
    })
  })
})
