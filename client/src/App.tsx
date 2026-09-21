
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/ui/HomePage"
import AppLayout from "./pages/ui/AppLayout";
import Login from "./pages/auth/LoginPage";
import About from "./pages/ui/About";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/ui/Dashboard";
import DietPlanHistory from "./pages/ui/DietPlanHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import { RouteErrorBoundary } from "./components/common/RouteErrorBoundary";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { initAuthSession } from "./services/authFlow";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path:'/',
        element:<Home/>
      },
      {
        path:'/login',
        element:<Login/>
      },
      {
        path:'/about',
        element:<About/>
      },
      {
        path:'/register',
        element: <Register/>
      },
      {
        element: <ProtectedRoute/>,
        children:[
          {
            path:'/dashboard',
            element: <Dashboard/>
          },
          {
            path: '/diet-history',
            element: <DietPlanHistory/>
          }
        ]
      }
    ]
  }
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
    <RouterProvider router={router}/>
  )
}

export default App