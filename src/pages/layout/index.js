import { Tabbar } from 'react-vant'
import { Add, Video } from '@react-vant/icons'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'


const Layout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    return (
        <div className='demo-tabbar'>

            <Tabbar style={{ position: "fixed", zIndex: 1000 }}>
                {/* 首页 */}
                <Tabbar.Item onClick={() => navigate('/layout/home')}>
                    首页
                </Tabbar.Item>

                {/* 朋友 */}
                <Tabbar.Item onClick={() => navigate('/layout/friends')}>
                    朋友
                </Tabbar.Item>

                {/* 发布 - 只有图标 */}
                <Tabbar.Item onClick={() => navigate('/layout/publish')}>
                    <Add style={{ fontSize: '24px' }} />
                </Tabbar.Item>

                {/* 消息 */}
                <Tabbar.Item onClick={() => navigate('/layout/message')}>
                    消息
                </Tabbar.Item>

                {/* 我的 */}
                <Tabbar.Item onClick={() => navigate('/layout/my')}>
                    我的
                </Tabbar.Item>
            </Tabbar>

            {/* 子路由出口 */}
            <Outlet />
        </div>
    )
}

export default Layout