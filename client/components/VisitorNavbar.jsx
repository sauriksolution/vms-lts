import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaUser, FaFileAlt, FaHome, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import useAuth from '../store/authStore';

const VisitorNavbar = () => {
    const router = useRouter();
    const { decodedToken, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/visitor/dashboard', icon: FaHome },
        { name: 'Visa Application', path: '/visitor/visa-form', icon: FaFileAlt },
        { name: 'My Applications', path: '/visitor/applications', icon: FaFileAlt },
        { name: 'Profile', path: '/visitor/profile', icon: FaUser },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isActive = (path) => router.pathname === path;

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link href="/visitor/dashboard">
                            <motion.div 
                                className="flex items-center space-x-2 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <FaFileAlt className="text-white text-sm" />
                                </div>
                                <span className="text-xl font-bold text-gray-800">VMS Visitor</span>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <motion.div
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                                            isActive(item.path)
                                                ? 'text-primary bg-primary/10'
                                                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon className="text-sm" />
                                        <span>{item.name}</span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaUser className="text-xs" />
                            <span>Welcome, {decodedToken()?.firstName || 'Visitor'}</span>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaSignOutAlt className="text-sm" />
                            <span>Logout</span>
                        </motion.button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
                        >
                            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-white border-t border-gray-200"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <div
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                                            isActive(item.path)
                                                ? 'text-primary bg-primary/10'
                                                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="text-sm" />
                                        <span>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600">
                                <FaUser className="text-xs" />
                                <span>Welcome, {decodedToken()?.firstName || 'Visitor'}</span>
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md w-full text-left"
                            >
                                <FaSignOutAlt className="text-sm" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default VisitorNavbar;