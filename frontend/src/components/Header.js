import { Fragment, useContext, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, MagnifyingGlassIcon, XMarkIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";
import { Link } from "react-router-dom";

const userNavigation = [
  { name: "Profile", href: "./profile" },
  { name: "Settings", href: "./settings" },
  { name: "Sign out", href: "./login" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const authContext = useContext(AuthContext);
  const localStorageData = JSON.parse(localStorage.getItem("user")) || {
    imageUrl: "https://via.placeholder.com/40",
    firstName: "Guest",
    lastName: "",
    email: "guest@example.com",
  };
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gradient-to-r from-teal-700 to-indigo-800 bg-opacity-95 backdrop-blur-lg shadow-xl">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-4"> {/* Reduced padding from px-4 to px-2 */}
              <div className="flex h-16 items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 group">
                    <div className="flex items-center gap-3 bg-teal-800 bg-opacity-60 px-3 py-2 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.7)]">
                      <img
                        className="h-12 w-12 rounded-full ring-2 ring-teal-400 transition-transform duration-300 group-hover:scale-110"
                        src={require("../assets/logo.png")}
                        alt="Animal Nutrition & Health"
                      />
                      <span className="font-bold text-xl text-white tracking-tight font-sans">
                        ANIMAL NUTRITION & HEALTH
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Right Section: Icons and Profile */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <button
                      type="button"
                      className="p-2 text-teal-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-full transition-colors duration-200"
                      title="Search"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    {isSearchOpen && (
                      <div className="absolute right-0 mt-2 w-64">
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-full px-4 py-2 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Notification Bell with Badge */}
                  <button
                    type="button"
                    className="relative p-2 text-teal-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-full transition-colors duration-200"
                    title="Notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    type="button"
                    className="p-2 text-teal-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-full transition-colors duration-200"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    onClick={toggleTheme}
                  >
                    <span className="sr-only">Toggle theme</span>
                    {isDarkMode ? (
                      <SunIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MoonIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-teal-700 transition-all duration-200"
                      aria-label="Open user menu"
                    >
                      <img
                        className="h-9 w-9 rounded-full ring-2 ring-teal-600 hover:ring-teal-400 transition-all duration-200"
                        src={localStorageData.imageUrl}
                        alt="Profile"
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-teal-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={classNames(
                                  active ? "bg-teal-700" : "",
                                  "block px-4 py-2 text-sm text-teal-100 hover:bg-teal-700 hover:text-white rounded-lg transition-colors duration-150"
                                )}
                                onClick={item.name === "Sign out" ? () => authContext.signout() : undefined}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Mobile Menu Button */}
                <div className="-mr-2 flex md:hidden">
                  <Disclosure.Button
                    className="p-2 text-teal-300 hover:text-white hover:bg-teal-700 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
                    aria-label="Open main menu"
                  >
                    {open ? (
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Panel */}
            <Disclosure.Panel className="md:hidden">
              <div className="border-t border-teal-600 pt-4 pb-4 bg-teal-800 bg-opacity-95">
                <div className="flex items-center px-5">
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-teal-600"
                    src={localStorageData.imageUrl}
                    alt="Profile"
                  />
                  <div className="ml-4">
                    <div className="text-base font-medium text-white">
                      {localStorageData.firstName + " " + localStorageData.lastName}
                    </div>
                    <div className="text-sm font-medium text-teal-300">
                      {localStorageData.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto p-2 text-teal-300 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
                    title="Notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
                  </button>
                </div>
                <div className="mt-4 space-y-2 px-3">
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 rounded-lg bg-teal-700 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block rounded-lg px-4 py-3 text-base font-medium text-teal-200 hover:bg-teal-700 hover:text-white transition-all duration-200"
                      onClick={item.name === "Sign out" ? () => authContext.signout() : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-teal-200 hover:bg-teal-700 hover:text-white rounded-lg transition-all duration-200"
                    onClick={toggleTheme}
                  >
                    {isDarkMode ? (
                      <>
                        <SunIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                        Switch to Light Mode
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                        Switch to Dark Mode
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}