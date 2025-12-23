import {useState, useEffect } from 'react';


export const Navbar = () =>{
    const[initial, setInitial] = useState("U");
    const[name, setName] = useState("");

    useEffect(() =>{
        const username = localStorage.getItem('username');
        if (username) {
            setInitial(username.charAt(0).toUpperCase());
            setName(username);
        }
        
    },[]);

    return (
        <nav className='w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm'>
            <div className='text-lg font-bold text-slate-700'>
                Inventario en creación por ayax :D
            </div>


            <div className='flex items-center gap-4'>
                <span className='text-sm text-slate-500 mr-2'>Bienvenido, {name}</span>
                <div className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md'>
                    {initial}
                </div>
            </div>
        </nav>        
    );
};