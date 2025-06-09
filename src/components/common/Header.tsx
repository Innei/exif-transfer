import { AnimatePresence, m as motion } from 'motion/react'
import { useState } from 'react'
import { NavLink } from 'react-router'

import { clsxm } from '~/lib/cn'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="lg:max-w-5xl mx-auto px-5 lg:px-0 flex items-center justify-between lg:justify-start h-14">
          <NavLink
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <span className="font-bold">EXIF Tool</span>
          </NavLink>

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex ml-12">
            <NavLink
              to="/transfer"
              className={({ isActive }) =>
                isActive
                  ? 'text-foreground'
                  : 'text-foreground/60 transition-colors hover:text-foreground/80'
              }
            >
              EXIF Transfer
            </NavLink>
            <NavLink
              to="/reader"
              className={({ isActive }) =>
                isActive
                  ? 'text-foreground'
                  : 'text-foreground/60 transition-colors hover:text-foreground/80'
              }
            >
              EXIF Reader
            </NavLink>
          </nav>

          <div className="md:hidden flex items-center justify-center">
            <button
              onClick={toggleMenu}
              className="p-2 flex items-center justify-center"
              type="button"
            >
              <span
                className={clsxm(
                  'text-lg -mr-2',
                  isMenuOpen
                    ? 'i-mingcute-close-line'
                    : 'i-mingcute-menu-line ',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 z-40 md:hidden"
            onClick={closeMenu}
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute grid w-full gap-4 p-6 text-lg font-medium bg-background"
            >
              <NavLink
                to="/transfer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'text-foreground' : 'text-foreground/60'
                }
              >
                EXIF Transfer
              </NavLink>
              <NavLink
                to="/reader"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'text-foreground' : 'text-foreground/60'
                }
              >
                EXIF Reader
              </NavLink>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
