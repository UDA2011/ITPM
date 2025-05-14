import { Fragment, useContext } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";
import { Link } from "react-router-dom";

const userNavigation = [{ name: "Sign out", href: "./login" }];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const authContext = useContext(AuthContext);
  const localStorageData = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 group">
                    <div className="flex items-center gap-3 transition-transform group-hover:scale-105">
                      <img
                        className="h-9 w-9 rounded-full"
                        src={require("../assets/logo.png")}
                        alt="Inventory Management System"
                      />
                      <span className="font-semibold text-xl text-white tracking-tight">
                        Inventory Management
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Right Section: Icons and Profile */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Search Icon */}
                  <button
                    type="button"
                    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-200"
                    title="Search"
                  >
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Notification Bell */}
                  <button
                    type="button"
                    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors duration-200"
                    title="Notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-9 w-9 rounded-full ring-2 ring-gray-700 hover:ring-blue-500 transition-all duration-200"
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                )}
                                onClick={() => authContext.signout()}
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
                  <Disclosure.Button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                    <span className="sr-only">Open main menu</span>
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
              <div className="border-t border-gray-700 pt-4 pb-4 bg-gray-800 bg-opacity-90">
                <div className="flex items-center px-5">
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-gray-600"
                    src={localStorageData.imageUrl}
                    alt="Profile"
                  />
                  <div className="ml-4">
                    <div className="text-base font-medium text-white">
                      {localStorageData.firstName + " " + localStorageData.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {localStorageData.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto p-2 text-gray-300 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Notifications"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 space-y-2 px-3">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block rounded-lg px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      onClick={() => authContext.signout()}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}