import { useState, useEffect } from 'react'
import { Image, Tabs, Empty } from 'react-vant'
import axios from 'axios'

const My = () => {
    const [currentUser, setCurrentUser] = useState(null)
    const [userVideos, setUserVideos] = useState([])

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const localUser = localStorage.getItem('userInfo')
            if (!localUser) return

            const loginUser = JSON.parse(localUser)

            try {
                // ✅ 这里必须是 8888！
                const res = await axios.get('http://localhost:8888/users?phone=' + loginUser.phone)
                if (res.data.length > 0) {
                    setCurrentUser(res.data[0])
                    // 获取当前用户的视频
                    fetchUserVideos(res.data[0].id)
                }
            } catch (err) {
                console.log('请求错误：', err)
            }
        }

        fetchCurrentUser()
    }, [])

    // 获取用户视频
    const fetchUserVideos = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8888/videos?authorId=${userId}`)
            setUserVideos(res.data)
        } catch (err) {
            console.log('获取视频失败：', err)
        }
    }

    const [activeTab, setActiveTab] = useState('作品')

    if (!currentUser) {
        return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
    }

    return (
        <div>
            <div style={{ position: 'relative', width: '100vw', height: '28vh' }}>
                <div className="bgc" style={{
                    filter: 'blur(2px)',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    background: 'linear-gradient(to bottom,transparent, rgba(50, 57, 70, 0.4))'
                }}></div>

                {/* ✅ 头像直接用 URL，正常显示！ */}
                <Image
                    src={currentUser.avatar}
                    width={120}
                    height={120}
                    radius={100}
                    style={{
                        position: 'absolute',
                        bottom: '8%',
                        left: '7%'
                    }}
                />

                <div className='info' style={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '43%'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px', color: 'white' }}>
                        {currentUser.nickname}
                    </div>
                    <div style={{ color: '#29253284', fontSize: '14px' }}>账号：</div>
                    <div style={{ color: '#29253284', fontSize: '14px' }}>
                        {currentUser.phone}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3vh', borderRadius: '10px', marginLeft: '5%' }}>
                <ul style={{ display: 'flex', justifyContent: 'space-between', width: '80%', height: '3vh' }}>
                    <li>{currentUser.likeCount}</li>
                    <li>{currentUser.friendCount}</li>
                    <li>{currentUser.followCount}</li>
                    <li>{currentUser.fanCount}</li>
                </ul>
                <ul style={{ display: 'flex', justifyContent: 'space-between', width: '80%', height: '3vh', marginBottom: '1vh' }}>
                    <li>获赞</li>
                    <li>互关</li>
                    <li>关注</li>
                    <li>粉丝</li>
                </ul>

                <div className='demo-tabs'>
                    <Tabs active={activeTab} align='left' type='line' color='black' lineWidth={50} onChange={setActiveTab}>
                        {['作品', '日常', '推荐', '收藏', '喜欢'].map((item) => (
                            <Tabs.TabPane name={item} key={item} title={item}>
                                {item === '作品' ? (
                                    <div style={{
                                        minHeight: '50vh',
                                        padding: '10px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '10px'
                                    }}>
                                        {userVideos.length > 0 ? (
                                            userVideos.map(video => (
                                                <div key={video.id} style={{ position: 'relative', aspectRatio: '9/16', overflow: 'hidden', borderRadius: '8px' }}>
                                                    <img
                                                        src={video.cover || video.videoUrl}
                                                        alt={video.title}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '5px',
                                                        left: '5px',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                                    }}>
                                                        ❤️ {video.likeCount || 0}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{
                                                gridColumn: '1 / -1',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: '50vh'
                                            }}>
                                                <Empty description="暂无作品" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{
                                        minHeight: '50vh',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column'
                                    }}>
                                        <Empty description={`暂无${item}内容`} />
                                    </div>
                                )}
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default My