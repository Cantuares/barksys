import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../lib/stores/auth.store";
import { UserRole } from "../types/auth.types";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Link } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case UserRole.ADMIN:
          navigate("/dashboard");
          break;
        case UserRole.TRAINER:
          navigate("/trainer/dashboard");
          break;
        case UserRole.TUTOR:
          navigate("/tutor/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <AuthLayout title="DogTrain" subtitle="Sistema de Gestão para Treino de Cães">
      <Card className="text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <i className="fas fa-paw text-blue-600 text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">DogTrain</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de gestão para treino de cães
          </p>
          
          {/* Teste de ícones */}
          <div className="flex justify-center space-x-4 mb-6">
            <i className="fas fa-home text-2xl text-blue-500"></i>
            <i className="fas fa-user text-2xl text-blue-500"></i>
            <i className="fas fa-envelope text-2xl text-blue-500"></i>
            <i className="fas fa-lock text-2xl text-blue-500"></i>
            <i className="fas fa-building text-2xl text-blue-500"></i>
          </div>
        </div>

        <div className="space-y-4">
          <Link to="/login">
            <Button className="w-full">Fazer Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="w-full">Criar Conta</Button>
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}