
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/HomePage"
import AppLayout from "./pages/AppLayout";
import Error404 from "./pages/Error404";
import Login from "./pages/LoginPage";
import About from "./pages/About";
import Register from "./pages/Register";

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