import {type ReactNode} from 'react';
import {Navbar} from '../organisms/Navbar/Navbar';

interface MainTemplateProps {
    children: ReactNode;
}

export const MainTemplate = ({children}: MainTemplateProps) =>{
    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar/>
            <main className='p-8 max-w-7xl mx-auto'>
            {children}
            </main>
        </div>
    )
}