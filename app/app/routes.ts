import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  
  // Auth routes (public)
  route("login", "routes/_auth.login.tsx"),
  route("register", "routes/_auth.register.tsx"),
  route("forgot-password", "routes/_auth.forgot-password.tsx"),
  route("onboarding/:token", "routes/_auth.onboarding.$token.tsx"),
  route("reset-password/:token", "routes/_auth.reset-password.$token.tsx"),
  
          // Protected routes
          route("dashboard", "routes/_protected.dashboard.tsx"),
          route("trainer/dashboard", "routes/_protected.trainer-dashboard.tsx"),
          route("tutor/dashboard", "routes/_protected.tutor-dashboard.tsx"),
          
          // Tutor pet management routes
          route("tutor/pets", "routes/_protected.tutor-pets.tsx"),
          route("tutor/pets/new", "routes/_protected.tutor-pets-new.tsx"),
          route("tutor/pets/:id", "routes/_protected.tutor-pets.$id.tsx"),
          route("tutor/pets/:id/edit", "routes/_protected.tutor-pets.$id.edit.tsx"),
          
          // Tutor package routes
          route("tutor/packages", "routes/_protected.tutor-packages.tsx"),
          route("tutor/packages/:id", "routes/_protected.tutor-packages.$id.tsx"),
] satisfies RouteConfig;
