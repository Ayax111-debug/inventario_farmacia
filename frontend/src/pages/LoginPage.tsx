import { AuthTemplate } from "../components/templates/AuthTemplate";
import { LoginForm } from "../components/organisms/LoginForm";


interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage = ({onLoginSuccess}:LoginPageProps) => {
  return (
    <AuthTemplate>
      <LoginForm onLoginSuccess={onLoginSuccess}/>
    </AuthTemplate>
  );
};