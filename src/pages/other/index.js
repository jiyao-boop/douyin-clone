import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { Image, Tabs, Empty, Button } from 'react-vant'
import { addFollow, cancelFollow } from '../../store/modules/videostore'
import { Plus, ArrowLeft } from '@react-vant/icons'
import '../../../src/index.scss'

function Other() {
    const { userId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const uid = Number(userId) || 1
    const followList = useSelector(state => state.video?.followList || [])
    const isFollowed = followList.includes(uid)

    const [userInfo, setUserInfo] = useState({})
    const [userVideos, setUserVideos] = useState([])

    // 获取用户信息
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:8888/users/${uid}`)
                setUserInfo(res.data)
            } catch (err) {
                console.log("❌ 请求失败", err)
            }
        }
        fetchUserInfo()
    }, [uid])

    // 获取用户作品
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await axios.get(`http://localhost:8888/videos?authorId=${uid}`)
                setUserVideos(res.data)
            } catch (err) {
                console.log("❌ 作品获取失败")
            }
        }
        fetchVideos()
    }, [uid])

    const handleFollow = () => dispatch(addFollow(uid))
    const handleCancelFollow = () => {
        if (window.confirm('确定取消关注？')) dispatch(cancelFollow(uid))
    }

    // 还原你原来的完整抖音主页UI
    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* 返回按钮 */}
            <Button
                icon={<ArrowLeft />}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '15px',
                    zIndex: 1000,
                    backgroundColor: 'rgba(52, 51, 51, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onClick={() => navigate('/layout/home')}
            />

            {/* 顶部模糊渐变背景 */}
            <div style={{ position: 'relative', width: '100vw', height: '25vh' }}>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, transparent, rgba(50,57,70,0.4))',
                    filter: 'blur(2px)'
                }} />

                <Image
                    src={userInfo?.avatar || ''}
                    width={120}
                    height={120}
                    radius="100%"
                    style={{ position: 'absolute', bottom: '8%', left: '7%' }}
                />

                <div style={{ position: 'absolute', bottom: '15%', left: '43%', color: '#fff' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                        {userInfo?.nickname || '未知用户'}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>账号：{userInfo?.phone || ''}</div>
                </div>
            </div>

            {/* 数据 + 关注按钮 */}
            <div style={{ margin: '15px 20px' }}>
                <ul style={{ display: 'flex', justifyContent: 'space-between', width: '80%', height: '3vh', padding: 0, margin: 0, listStyle: 'none', color: '#000000' }}>
                    <li>{userInfo?.likeCount || 0} </li>
                    <li>{userInfo?.friendCount || 0} </li>
                    <li>{userInfo?.followCount || 0}</li>
                    <li>{userInfo?.fanCount || 0} </li>
                </ul>
                <ul style={{ display: 'flex', justifyContent: 'space-between', width: '80%', height: '3vh', padding: 0, margin: 0, listStyle: 'none', color: '#000000' }}>
                    <li>获赞</li>
                    <li>互关</li>
                    <li>关注</li>
                    <li>粉丝</li>
                </ul>

                <Button
                    icon={<Plus color="white" />}
                    color={isFollowed ? '#999' : '#f73a3a'}
                    onClick={isFollowed ? handleCancelFollow : handleFollow}
                    style={{ width: '88%', height: '45px', marginTop: '10px' }}
                >
                    {isFollowed ? '已关注' : '关注'}
                </Button>
            </div>

            {/* ✅ 作品栏 紧贴顶部，无缝隙 */}
            <Tabs
                defaultActive="作品"
                align="start"
                color="#000000"
                style={{
                    margin: '0 20px',   /* 去掉多余的上间距 */
                    padding: 0         /* 无内边距 */
                }}
            >
                <Tabs.TabPane title="作品">
                    <div style={{
                        padding: 0,
                        margin: 0
                    }}>
                        {userVideos.length === 0 ? (
                            <Empty description="暂无作品" />
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '5px',
                                padding: 0,
                                margin: 0
                            }}>
                                {userVideos.map(item => (
                                    <div key={item.id}>
                                        <img src={item.cover} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
}

export default Other