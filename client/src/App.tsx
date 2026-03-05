
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/homePage"
import AppLayout from "./pages/AppLayout";
import Error404 from "./pages/Error404";
import Login from "./pages/LoginPage";

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