import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../../../data/navigation';

export const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative">
        
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Abrir menú"
            >
               
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
            

          
            {isOpen && (
                <div className="absolute left-0 mt-5 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <ul className="flex flex-col py-2">
                        {NAV_LINKS.map((link) => (
                            <li key={link.path}>
                                <Link 
                                    to={link.path}
                                    onClick={handleLinkClick}
                                    className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};