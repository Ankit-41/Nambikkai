"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@/contexts/ThemeContext"
import { Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
  showFooter?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true, showFooter = true }) => {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showNavbar && (
        <nav className="bg-card border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link to="/" className="flex items-center">
              {theme === "light" ? (
                <img
                  src="https://www.nambikkairehab.in/assets/icons/1000064619_1_15.svg"
                  alt="Nambikkai Logo"
                  className="h-14 w-auto"
                />
              ) : (
                <span className="text-lg font-bold text-blue-400">Nambikkai</span>
              )}
            </Link>



            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-1 h-8 w-8"
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-1 mr-2 h-8 w-8"
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-1 h-8 w-8"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-card border-t py-2 px-4 shadow-md">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/about"
                  className="text-sm py-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm py-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="flex-1">{children}</main>

      {showFooter && (
        <footer className="bg-muted/30 border-t mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <Link to="/" className="flex items-center">
                  {theme === "light" ? (
                    <img
                      src="https://www.nambikkairehab.in/assets/icons/1000064619_1_15.svg"
                      alt="Nambikkai Logo"
                      className="h-14 w-auto"
                    />
                  ) : (
                    <span className="text-lg font-bold text-blue-400">Nambikkai</span>
                  )}
                </Link>


                <p className="text-xs text-muted-foreground mt-1">Advanced knee health diagnostics</p>
              </div>

              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                <Link
                  to="/about"
                  className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/privacy"
                  className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms
                </Link>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground">&copy; 2024 Nambikkai</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default Layout
