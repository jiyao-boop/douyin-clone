// 路由配置
import Layout from '@/pages/layout'
import Login from '@//pages/login'
import My from '@/pages/my'
import Message from '@/pages/message'
import Publish from '@/pages/publish'
import Friends from '@/pages/Friends'
import Home from '../pages/home'
import Register from '../pages/register'
import Other from '../pages/other'
import { createBrowserRouter } from 'react-router-dom'
const router = createBrowserRouter([
    {
        path: "/layout",
        element: <Layout />,
        children: [

            {
                path: 'home',
                element: <Home />
            },
            {
                path: "friends",
                element: <Friends />
            },
            {
                path: "message",
                element: <Message />
            },
            {
                path: "my",
                element: <My />
            },
            {
                path: "publish",
                element: <Publish />
            },
            {
                path: "other/:userId",
                element: <Other />
            }
        ]
    },
    {
        path: "/",
        element: <Login />,

    },
    {
        path: "/register",
        element: <Register />
    }

])
export default router