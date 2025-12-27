import { useNavigate } from "react-router-dom"
import { authService } from "../../../services/auth.service";
import { Button } from "../../atoms/Button";

export const LogoutButton = () =>{
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log("1. Click detectado");
        await authService.logout();
        navigate('/login');
    };
    return(
        <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
        </Button>
    );
};