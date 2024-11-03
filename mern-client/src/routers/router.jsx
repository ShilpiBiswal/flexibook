import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import App from "../App";
import Home from "../Home/home";
import Shop from "../shop/Shop";
import About from "../components/About";
import Blog from "../components/Blog";
import SingleBook from "../shop/SingleBook";
import ManageBooks from "../dashboard/ManageBooks";
import EditBooks from "../dashboard/EditBooks";
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
      children : [
        {
            path:'/',
            element: <Home/>
        },
        {
            path:"/shop",
            element: <Shop/>
        },
        {
            path: "/about",
            element : <About/>
        },
        {
            path: "/blog",
            element: <Blog/>
        },
        {
          path: "/book/:id",
          element: <SingleBook/>,
          loader:({params})=>fetch(`http://localhost:5500/book/${params.id}`)
      }
      ]
    },
    {
      path: "/admin/dashboard",
      element: <DashboardLayout/>,
      children: [
        {
          path: "/admin/dashboard",
          element: <Dashboard/>  //private routing
        },
        {
          path: "/admin/dashboard/upload",
          element: <UploadBook/>
        },
        {
          path: "/admin/dashboard/manage",
          element: <ManageBooks/>
        },
        {
          path: "/admin/dashboard/edit-books/:id",
          element: <EditBooks/>,
          loader:({params})=>fetch(`http://localhost:5500/book/${params.id}`)
        }
      ]
    }
  ]);

  export default router;