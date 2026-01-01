import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from '../nav-bar'

const mockUsePathname = jest.fn(() => '/')

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock LogoutButton
jest.mock('@/components/LogoutButton', () => ({
  LogoutButton: ({ variant }: { variant?: string }) => (
    <button data-testid="logout-button" data-variant={variant}>
      ログアウト
    </button>
  ),
}))

describe('NavBar - Hamburger Menu Button (Requirement 1)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('Acceptance Criteria 1 & 2: Button visibility based on screen size', () => {
    it('should display hamburger button on small screens (<640px)', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Button should exist
      expect(hamburgerButton).toBeInTheDocument()

      // Button should have sm:hidden class (visible on small screens, hidden on large)
      expect(hamburgerButton).toHaveClass('sm:hidden')
    })

    it('should hide hamburger button on large screens (≥640px) via CSS', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Button should have sm:hidden class which hides it on screens ≥640px
      expect(hamburgerButton).toHaveClass('sm:hidden')
    })
  })

  describe('Acceptance Criteria 3: Hamburger icon when menu is closed', () => {
    it('should show hamburger icon (three lines) when menu is closed', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Button should contain SVG with hamburger icon paths
      const svg = hamburgerButton.querySelector('svg')
      expect(svg).toBeInTheDocument()

      // Hamburger icon has path with three horizontal lines
      const path = svg?.querySelector('path')
      expect(path?.getAttribute('d')).toContain('6.75h16.5')
      expect(path?.getAttribute('d')).toContain('12h16.5')
      expect(path?.getAttribute('d')).toContain('5.25h16.5')
    })
  })

  describe('Acceptance Criteria 4: Close icon when menu is open', () => {
    it('should show close icon (X) when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Click to open menu
      await user.click(hamburgerButton)

      // Button should now contain close icon (X)
      const svg = hamburgerButton.querySelector('svg')
      const path = svg?.querySelector('path')

      // Close icon has X shape: "M6 18L18 6M6 6l12 12"
      expect(path?.getAttribute('d')).toContain('6 18L18 6')
      expect(path?.getAttribute('d')).toContain('6 6l12 12')
    })
  })

  describe('Acceptance Criteria 5: Focus state on button', () => {
    it('should display focus state when hamburger button receives focus', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Directly focus the button (simulate keyboard navigation)
      hamburgerButton.focus()

      // Button should be focused
      expect(hamburgerButton).toHaveFocus()

      // Button should have focus styling classes (hover:bg-gray-100)
      expect(hamburgerButton).toHaveClass('hover:bg-gray-100')
    })

    it('should have proper accessibility attributes', () => {
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Should have aria-label
      expect(hamburgerButton).toHaveAttribute('aria-label', 'メニュー')

      // Should have aria-expanded (initially false)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})

describe('NavBar - Navigation links (Requirement 5)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
  })

  it('renders マイページ link with 📝 icon pointing to /coffee/my', () => {
    render(<NavBar userEmail="test@example.com" />)

    const myPageLink = screen.getByRole('link', { name: /📝\s*マイページ/i })
    expect(myPageLink).toBeInTheDocument()
    expect(myPageLink).toHaveAttribute('href', '/coffee/my')
  })

  it('renders コミュニティ link with 🌐 icon pointing to /coffee/community', () => {
    render(<NavBar userEmail="test@example.com" />)

    const communityLink = screen.getByRole('link', { name: /🌐\s*コミュニティ/i })
    expect(communityLink).toBeInTheDocument()
    expect(communityLink).toHaveAttribute('href', '/coffee/community')
  })

  it('highlights active link based on pathname', () => {
    mockUsePathname.mockReturnValue('/coffee/my')
    render(<NavBar userEmail="test@example.com" />)

    const myPageLink = screen.getByRole('link', { name: /マイページ/i })
    const communityLink = screen.getByRole('link', { name: /コミュニティ/i })

    expect(myPageLink).toHaveAttribute('aria-current', 'page')
    expect(myPageLink.className).toContain('bg-amber-100')
    expect(communityLink).not.toHaveAttribute('aria-current')
  })

  it('shows all links in mobile menu when opened', async () => {
    const user = userEvent.setup()
    render(<NavBar userEmail="test@example.com" />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    await user.click(menuButton)

    expect(screen.getAllByRole('link', { name: /マイページ/i }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByRole('link', { name: /コミュニティ/i }).length).toBeGreaterThanOrEqual(2)
  })

  it('renders desktop navigation horizontally with new links', () => {
    render(<NavBar userEmail="test@example.com" />)

    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    expect(nav).toHaveClass('sm:flex')
    expect(screen.getByRole('link', { name: /マイページ/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /コミュニティ/i })).toBeInTheDocument()
  })
})

describe('NavBar - Menu Toggle (Requirement 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Acceptance Criteria 1: Toggle menu on button click', () => {
    it('should open menu when hamburger button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Click to open menu
      await user.click(hamburgerButton)

      // Mobile menu should now be visible - both desktop and mobile links exist
      const openLinks = screen.getAllByRole('link', { name: /コミュニティ|マイページ/ })
      expect(openLinks.length).toBeGreaterThan(2)
    })

    it('should close menu when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)
      const openLinks = screen.getAllByRole('link', { name: /コミュニティ|マイページ/ })
      expect(openLinks.length).toBeGreaterThan(2)

      // Click again to close
      await user.click(hamburgerButton)

      // Menu should be closed (mobile nav links hidden)
      // Desktop nav still rendered; mobile menu unmounted
      expect(screen.getAllByText(/コミュニティ/).length).toBe(1)
    })
  })

  describe('Acceptance Criteria 2: Display navigation and user menu when open', () => {
    it('should display navigation links when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)

      // Navigation links should be visible
      const links = screen.getAllByRole('link', { name: /コミュニティ|マイページ/ })
      expect(links.length).toBeGreaterThan(2) // Desktop + mobile
    })

    it('should display user menu when logged in and menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)

      // User menu items should be visible
      const profileLinks = screen.getAllByText('プロフィール')
      expect(profileLinks.length).toBeGreaterThan(1) // Desktop + mobile

      const logoutButtons = screen.getAllByTestId('logout-button')
      expect(logoutButtons.length).toBeGreaterThan(1) // Desktop + mobile
    })
  })

  describe('Acceptance Criteria 3: Close menu after clicking navigation link', () => {
    it('should close menu after clicking Coffee link', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)

      // Get mobile community link (the second one in the array)
      const communityLinks = screen.getAllByText(/コミュニティ/)
      const mobileCommunityLink = communityLinks[1]

      // Click community link in mobile menu
      await user.click(mobileCommunityLink)

      // Menu should be closed (mobile links hidden)
      const communityLinksAfter = screen.getAllByText(/コミュニティ/)
      expect(communityLinksAfter.length).toBe(1) // Only desktop version
    })

    it('should close menu after clicking profile link', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)

      // Get mobile profile link
      const profileLinks = screen.getAllByText('プロフィール')
      const mobileProfileLink = profileLinks[1]

      // Click profile link in mobile menu
      await user.click(mobileProfileLink)

      // Menu should be closed
      const profileLinksAfter = screen.queryAllByText('プロフィール')
      expect(profileLinksAfter.length).toBe(1) // Only desktop version
    })
  })

  describe('Acceptance Criteria 5: Update aria-expanded based on menu state', () => {
    it('should set aria-expanded to true when menu is open', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Initially false
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')

      // Open menu
      await user.click(hamburgerButton)

      // Should be true
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should set aria-expanded to false when menu is closed', async () => {
      const user = userEvent.setup()
      render(<NavBar userEmail="test@example.com" />)

      const hamburgerButton = screen.getByRole('button', { name: 'メニュー' })

      // Open menu
      await user.click(hamburgerButton)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true')

      // Close menu
      await user.click(hamburgerButton)
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
