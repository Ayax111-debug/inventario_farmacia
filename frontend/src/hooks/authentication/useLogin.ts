import {useState } from "react";
import { authService } from "../../services/auth.service";

export const useLogin = (onSuccess: () => void) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError] = useState <string | null>(null);

    const login = async (username: string, password: string) =>{
        setIsLoading(true);
        setError(null);

        try {
            await authService.login(username, password);
            localStorage.setItem('username',username);

            onSuccess();
        }catch(err:any){
            console.error(err);
            setError("Credenciales incorrectas o error del servidor");

        }finally{
            setIsLoading(false);
        }
    };
    
    return{
        login,
        isLoading,
        error,
    };
};

