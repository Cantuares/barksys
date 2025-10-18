import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Dog, Users, Calendar, Award } from "lucide-react";
import { useAuthStore } from "../lib/stores/auth.store";
import { UserRole } from "../types/auth.types";
import { Button } from "../components/ui/Button";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const features = [
    {
      icon: Users,
      title: t("home.features.professional.title"),
      description: t("home.features.professional.description"),
    },
    {
      icon: Calendar,
      title: t("home.features.scheduling.title"),
      description: t("home.features.scheduling.description"),
    },
    {
      icon: Award,
      title: t("home.features.tracking.title"),
      description: t("home.features.tracking.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dog className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">{t("home.title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-8">
              <Dog className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {t("home.title")}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
              {t("home.subtitle")}
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              {t("home.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button size="lg" className="min-w-[200px]">
                  {t("home.loginButton")}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  {t("home.registerButton")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-16">
              {t("home.features.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 mb-6 group-hover:bg-green-100 transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          {t("home.footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
