
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/ui/HomePage"
import AppLayout from "./pages/ui/AppLayout";
import Error404 from "./pages/ui/Error404";
import Login from "./pages/auth/LoginPage";
import About from "./pages/ui/About";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/ui/Dashboard";
import DietPlanHistory from "./pages/ui/DietPlanHistory";



const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    errorElement:<Error404/>,
    children:[
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
        path:'/dashboard',
        element: <Dashboard/>
      },
      {
        path: 'diet-history',
        element: <DietPlanHistory/>
      }
    ]
  }
]);

function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App