import { lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AuthenticatedLayout } from "./components/layout/AuthenticatedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { RouteErrorBoundary } from "./components/common/RouteErrorBoundary";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { initAuthSession } from "./services/authFlow";

// Lazy-loaded routes
const Home = lazy(() => import("./pages/ui/HomePage"));
const Login = lazy(() => import("./pages/auth/LoginPage"));
const About = lazy(() => import("./pages/ui/About"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/ui/Dashboard"));
const Progress = lazy(() => import("./pages/ui/Progress"));
const Meals = lazy(() => import("./pages/ui/Meals"));
const Profile = lazy(() => import("./pages/ui/Profile"));
const Security = lazy(() => import("./pages/ui/Security"));
const GuestOnboarding = lazy(() => import("./pages/auth/GuestOnboarding"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));

const router = createBrowserRouter([
  // Public Marketing Routes
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
    ],
  },
  // Authenticated Workspace Routes
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/progress',
            element: <Progress />,
          },
          {
            path: '/meals',
            element: <Meals />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/security',
            element: <Security />,
          },
          {
            path: '/welcome',
            element: <GuestOnboarding />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initAuthSession(dispatch);
    }
  }, [dispatch, isInitialized]);

  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

export default App;
