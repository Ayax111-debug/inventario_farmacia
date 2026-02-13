import React from 'react';

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export const Paginator: React.FC<PaginatorProps> = ({ 
    currentPage, 
    totalPages, 
    onNext, 
    onPrev,
    hasNext,
    hasPrev 
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-6 py-4">
            <button 
                onClick={onPrev} 
                disabled={!hasPrev}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors
                    ${!hasPrev 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                    }`}
            >
                Anterior
            </button>
            
            <span className="text-gray-600 font-medium text-sm">
                Página <span className="text-gray-900">{currentPage}</span> de {totalPages}
            </span>

            <button 
                onClick={onNext} 
                disabled={!hasNext}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors
                    ${!hasNext 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                    }`}
            >
                Siguiente
            </button>
        </div>
    );
};