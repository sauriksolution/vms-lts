import Link from "next/link";
import { useEffect, useState } from "react";

import ThemeSelector from "./ThemeSelector";
import useAuth from "../store/authStore";

const Navbar = () => {
    const [isClient, setIsClient] = useState(false);
    const navlinks = useAuth((state) => {
        return state.navLinks;
    })();
    const token = useAuth((state) => {
        return state.decodedToken;
    })();

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <nav className="navbar w-full bg-neutral sm:rounded-xl">
            <div className="navbar-start">
                <Link href="/">
                    <a className="navIcon btn btn-ghost text-xl normal-case flex items-center space-x-2">
                        <svg
                            className="icon"
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-400"/>
                            <path d="M10 13L16 19L22 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"/>
                            <circle cx="16" cy="8" r="1.5" fill="currentColor" className="text-purple-400"/>
                            <circle cx="16" cy="24" r="1.5" fill="currentColor" className="text-purple-400"/>
                        </svg>
                        <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Nullexa
                        </span>
                    </a>
                </Link>
            </div>
            <div className="navbar-end space-x-5 text-xs text-neutral-content md:text-sm">
                <div>
                    <ThemeSelector />
                </div>
                {isClient && token && (
                    <Link href="/visitorDashboard">
                        <a>
                            <div
                                className={
                                    "avatar placeholder rounded-full " +
                                    (token.permission === 0
                                        ? "bg-primary"
                                        : token.permission === 1
                                        ? "bg-secondary"
                                        : "bg-accent")
                                }
                            >
                                <div className="w-10 text-primary-content">
                                    <span className="text-xl">
                                        {token ? token.name[0] : ""}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </Link>
                )}
                <div className="dropdown dropdown-end">
                    <label tabIndex="0" className="menuIcon btn btn-ghost">
                        <svg
                            width="16"
                            height="12"
                            viewBox="0 0 16 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                className="menuPath"
                                width="16"
                                height="2"
                                rx="1"
                                fill="#D9D9D9"
                            />
                            <rect
                                className="menuPath"
                                y="5"
                                width="16"
                                height="2"
                                rx="1"
                                fill="#D9D9D9"
                            />
                            <rect
                                className="menuPath"
                                y="10"
                                width="16"
                                height="2"
                                rx="1"
                                fill="#D9D9D9"
                            />
                        </svg>
                    </label>
                    <ul
                        tabIndex="0"
                        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-neutral p-2 text-neutral-content shadow"
                    >
                        {isClient && navlinks.map((link, idx) => {
                            return (
                                <Link key={idx} href={link.path}>
                                    <a
                                        className="btn btn-ghost"
                                        onClick={link.onClick && link.onClick}
                                    >
                                        {link.content}
                                    </a>
                                </Link>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
