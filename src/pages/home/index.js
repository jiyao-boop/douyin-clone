import React, { useState, useEffect, useRef } from 'react'
import { ShareSheet, Popup, Toast, Image, Dialog } from 'react-vant'
import { Input, Button } from 'react-vant'
import { useDispatch, useSelector } from 'react-redux'
import { Chat, Like, Star, Share, Music, Add, Clear, Delete } from '@react-vant/icons'
import { getsetaddComments, getsetCommentsList, getsetLikeComment, getsetDeleteComments } from '../../store/modules/commentsStore'
import { getVideoList, setLikeVideoList, setSaveVideoList } from '../../store/modules/videostore'
import { getsetUserList } from '../../store/modules/userAvatarstore'
import defaultAvatar from '../../../src/assets/默认头像.jpg'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [replyParentId, setReplyParentId] = useState(null)
    const userInfoString = localStorage.getItem('userInfo')
    const currentUser = userInfoString ? JSON.parse(userInfoString) : null
    const videoList = useSelector(state => state.video.videoList) || []
    const commentList = useSelector(state => state.comments.commentsList) || []
    const userList = useSelector(state => state.userAvatar.userList) || []

    const [currentIndex, setCurrentIndex] = useState(0)
    const [visible, setVisible] = useState(false)
    const [commentVisible, setCommentVisible] = useState(false)
    const [followActive, setFollowActive] = useState(false)
    const [value, setValue] = useState('')
    const [isPlaying, setIsPlaying] = useState(true)
    const [hearts, setHearts] = useState([])

    const containerRef = useRef(null)
    const videoRef = useRef(null)
    const commentScrollRef = useRef(null)
    const touchStartY = useRef(0)
    const lastTapTime = useRef(0)

    const currentVideo = videoList[currentIndex] || null

    // 初始化数据
    useEffect(() => {
        dispatch(getVideoList())
        dispatch(getsetUserList())
    }, [dispatch])

    // 视频切换：加载评论 + 自动播放
    // 视频切换：加载评论 + 自动播放
    useEffect(() => {
        if (!currentVideo) return
        // 一进来就拉评论，不要等点开弹窗
        dispatch(getsetCommentsList(currentVideo.id))

        const video = videoRef.current
        if (video) {
            video.currentTime = 0
            video.play().catch(() => { })
            setIsPlaying(true)
        }
        setHearts([])
        // 依赖加上 currentVideo，一加载就执行
    }, [currentVideo, dispatch])

    // 评论滚动到底部
    useEffect(() => {
        if (!commentVisible || !commentScrollRef.current) return
        const scrollEl = commentScrollRef.current

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollEl
            const isBottom = scrollTop + clientHeight >= scrollHeight - 50
            if (isBottom) {
                console.log('已滑到评论底部：暂无更多评论')
            }
        }

        scrollEl.addEventListener('scroll', handleScroll)
        return () => scrollEl.removeEventListener('scroll', handleScroll)
    }, [commentVisible])

    // 单击/双击视频
    const handleVideoClick = (e) => {
        const now = Date.now()
        const timeDiff = now - lastTapTime.current

        if (timeDiff < 300) {
            handleDoubleTapLike(e)
            lastTapTime.current = 0
        } else {
            lastTapTime.current = now
            setTimeout(() => {
                if (Date.now() - lastTapTime.current >= 300) {
                    const video = videoRef.current
                    if (!video) return
                    if (isPlaying) {
                        video.pause()
                        setIsPlaying(false)
                    } else {
                        video.play().catch(() => { })
                        setIsPlaying(true)
                    }
                }
            }, 250)
        }
    }

    // 双击点赞动画
    const handleDoubleTapLike = (e) => {
        if (!currentVideo || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX || (e.changedTouches?.[0]?.clientX) || rect.width / 2
        const y = e.clientY || (e.changedTouches?.[0]?.clientY) || rect.height / 2

        const heartId = Date.now()
        setHearts(prev => [...prev, { id: heartId, x, y }])
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== heartId)), 1500)

        if (!currentVideo.isLike) dispatch(setLikeVideoList(currentVideo.id))
    }

    // 视频滑动切换
    const handleTouchStart = (e) => {
        if (commentVisible) return
        touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
        if (commentVisible) return
        const touchEndY = e.changedTouches[0].clientY
        const diff = touchStartY.current - touchEndY

        if (diff > 50 && currentIndex < videoList.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setFollowActive(false)
        } else if (diff < -50 && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
            setFollowActive(false)
        }
    }

    // 获取头像
    const getUserAvatar = (userId) => {
        if (!userId) return defaultAvatar
        const user = userList.find(u => String(u.id) === String(userId))
        if (!user || !user.avatar) return defaultAvatar
        if (user.avatar.startsWith('http')) return user.avatar
        return user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`
    }

    const handleFollow = (e) => {
        e.stopPropagation()
        setFollowActive(true)
        Toast.success('关注成功')
    }

    const handleLike = (e) => {
        e.stopPropagation()
        if (currentVideo) dispatch(setLikeVideoList(currentVideo.id))
    }

    const handleStar = (e) => {
        e.stopPropagation()
        if (currentVideo) dispatch(setSaveVideoList(currentVideo.id))
    }

    const handleOpenComments = (e) => {
        e.stopPropagation()
        if (currentVideo) {
            dispatch(getsetCommentsList(currentVideo.id))
            setCommentVisible(true)
        }
    }

    const handleShare = (e) => {
        e.stopPropagation()
        setVisible(true)
    }


    const handleDeleteComment = (commentId) => {
        if (!currentUser) {
            Toast.info('请先登录')
            return
        }

        Dialog.confirm({
            title: '确认删除',
            message: '删除后无法恢复，确定删除吗？',
            cancelButtonColor: '#000000',   // 取消字：黑色
            confirmButtonColor: '#000'   // 确定字：黑色
        }).then(() => {
            // 👇 这里调用你自己的删除方法，完全匹配
            dispatch(getsetDeleteComments(commentId))
            Toast.success('删除成功')
        }).catch(() => {
            Toast.info('已取消')
        })
    }

    // 发布评论
    const handlePublish = () => {
        if (!currentUser) {
            Toast.info('请先登录')
            return
        }
        if (!value.trim() || !currentVideo) return

        dispatch(getsetaddComments({
            videoId: currentVideo.id,
            userId: currentUser.id,
            content: value.trim(),
            parentId: replyParentId || 0,
            createTime: new Date().toISOString(),
            likeCount: 0,
            user: {
                uname: currentUser.nickname || currentUser.phone || '匿名用户',
                avatar: getUserAvatar(currentUser.id)
            }
        }))

        setValue('')
        setReplyParentId(null)
        Toast.success(replyParentId ? '回复成功' : '评论成功')
    }

    // 点赞评论
    const handleLikeComment = (commentId, isLike) => {
        if (!currentUser) {
            Toast.info('请先登录')
            return
        }
        dispatch(getsetLikeComment(commentId, isLike))
    }

    const options = [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: '复制链接', icon: 'link' },
        { name: '分享海报', icon: 'poster' },
        { name: '二维码', icon: 'qrcode' },
    ]

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000'
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {currentVideo && (
                <video
                    ref={videoRef}
                    key={currentVideo.id}
                    autoPlay
                    src={currentVideo.videoUrl}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onClick={handleVideoClick}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                    }}
                />
            )}

            {/* 双击爱心 */}
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    style={{
                        position: 'absolute',
                        left: heart.x,
                        top: heart.y,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        animation: 'heartPop 1.5s ease-out forwards',
                        zIndex: 100
                    }}
                >
                    <Like style={{ fontSize: '80px', color: '#ff4646' }} />
                </div>
            ))}

            <style>{`
                @keyframes heartPop {
                    0% { opacity:1; transform:translate(-50%,-50%) scale(0); }
                    15% { transform:translate(-50%,-50%) scale(1.2); }
                    30% { transform:translate(-50%,-50%) scale(0.95); }
                    45%,80% { opacity:1; transform:translate(-50%,-50%) scale(1); }
                    100% { opacity:0; transform:translate(-50%,-150%) scale(1); }
                }
            `}</style>

            {/* 暂停按钮 */}
            {!isPlaying && (
                <div onClick={handleVideoClick} style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                }}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <path d="M8 4L28 18L8 32Z" fill="white" stroke="white" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                </div>
            )}

            {/* 右侧栏 */}
            <div style={{
                position: 'absolute', right: '15px', bottom: '150px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 20
            }}>
                <div style={{ position: 'relative' }} onClick={() => currentVideo?.authorId && navigate(`/layout/other/${currentVideo.authorId}`)}>
                    <Image src={getUserAvatar(currentVideo?.authorId)} width={50} height={50} round style={{ border: '2px solid #fff', backgroundColor: '#fff' }} onError={(e) => e.target.src = defaultAvatar} />
                    {!followActive && (
                        <Add onClick={handleFollow} style={{ fontSize: '14px', color: '#fff', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ff4646', borderRadius: '50%', padding: '2px' }} />
                    )}
                </div>

                <div onClick={handleLike} style={{ textAlign: 'center' }}>
                    <Like style={{ fontSize: '30px', color: currentVideo?.isLike ? '#ff4646' : '#fff' }} />
                    <div style={{ color: '#fff', fontSize: '12px', marginTop: '3px' }}>{currentVideo?.likeCount || 0}</div>
                </div>

                <div onClick={handleOpenComments} style={{ textAlign: 'center' }}>
                    <Chat style={{ fontSize: '30px', color: '#fff' }} />
                    <div style={{ color: '#fff', fontSize: '12px', marginTop: '3px' }}>
                        {commentList.reduce((t, c) => t + 1 + (c.children?.length || 0), 0)}
                    </div>
                </div>

                <div onClick={handleStar} style={{ textAlign: 'center' }}>
                    <Star style={{ fontSize: '30px', color: currentVideo?.isSave ? '#ffd700' : '#fff' }} />
                    <div style={{ color: '#fff', fontSize: '12px', marginTop: '3px' }}>{currentVideo?.saveCount || 0}</div>
                </div>

                <div onClick={handleShare} style={{ textAlign: 'center' }}>
                    <Share style={{ fontSize: '30px', color: '#fff' }} />
                    <div style={{ color: '#fff', fontSize: '12px', marginTop: '3px' }}>分享</div>
                </div>

                <div><Music style={{ fontSize: '30px', color: '#fff' }} spin /></div>
            </div>

            {/* 底部文案 */}
            {currentVideo && (
                <div style={{ position: 'absolute', left: '15px', bottom: '80px', color: '#fff', maxWidth: '70%', zIndex: 10 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>@{userList.find(u => u.id == currentVideo.authorId)?.nickname || '匿名用户'}</div>
                    <div style={{ fontSize: '14px' }}>{currentVideo.title}</div>
                </div>
            )}

            {/* 进度条 */}
            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                {videoList.map((_, index) => (
                    <div key={index} style={{ width: '4px', height: index === currentIndex ? '20px' : '4px', borderRadius: '2px', backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,250,0.5)', transition: 'all 0.3s' }} />
                ))}
            </div>

            <ShareSheet visible={visible} options={options} title="立即分享给好友" onCancel={() => setVisible(false)} onSelect={() => setVisible(false)} />

            {/* 评论弹窗 */}
            <Popup
                visible={commentVisible}
                position="bottom"
                round
                closeable
                closeIcon={<Clear />}
                title={`${commentList.reduce((t, c) => t + 1 + (c.children?.length || 0), 0)}条评论`}
                onClose={() => { setCommentVisible(false); setReplyParentId(null) }}
                style={{ height: '60vh' }}
                lockScroll={true}
            >
                <div ref={commentScrollRef} style={{ height: 'calc(100% - 70px)', overflowY: 'auto', padding: '10px', WebkitOverflowScrolling: 'touch' }}>
                    {commentList.length > 0 ? (
                        commentList.map((item) => (
                            <div key={item.id} style={{ marginBottom: '16px' }}>
                                {/* 主评论 */}
                                <div style={{ display: 'flex', padding: '8px 0' }}>
                                    <img src={item.user?.avatar || defaultAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: 10 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>{item?.user?.uname || '匿名用户'}</div>
                                        <div style={{ color: '#333', margin: '4px 0' }}>{item.content}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                            <div onClick={() => setReplyParentId(item.id)} style={{ fontSize: '12px', color: '#999', cursor: 'pointer' }}>回复</div>
                                            <div
                                                onClick={() => handleLikeComment(item.id, !item.isLike)}
                                                style={{ fontSize: '12px', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Like
                                                    color={item.isLike ? '#ff4646' : '#999'}
                                                    fill={item.isLike ? 'currentColor' : undefined}
                                                    style={{ fontSize: '14px' }}
                                                />
                                                {item.likeCount ?? 0}
                                            </div>


                                            {currentUser && item.userId === currentUser.id && (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteComment(item.id) }}
                                                    style={{ fontSize: '12px', color: '#000000', cursor: 'pointer' }}
                                                >
                                                    <Delete style={{ fontSize: '14px' }} /> 删除
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 子评论 */}
                                {(item.children || []).length > 0 && (
                                    <div style={{ paddingLeft: '50px', marginTop: '8px' }}>
                                        {item.children.map((rep) => (
                                            <div key={rep.id} style={{ display: 'flex', marginBottom: '8px' }}>
                                                <img src={rep.user?.avatar || defaultAvatar} style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: 8 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{rep?.user?.uname || '匿名用户'}</div>
                                                    <div style={{ fontSize: '13px', color: '#333' }}>{rep.content}</div>
                                                    <div
                                                        style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}
                                                    >
                                                        <div
                                                            onClick={() => handleLikeComment(rep.id, !rep.isLike)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                        >
                                                            <Like
                                                                color={rep.isLike ? '#ff3030' : '#999'}
                                                                fill={rep.isLike ? 'currentColor' : undefined}
                                                                style={{ fontSize: '12px' }}
                                                            />
                                                            {rep.likeCount ?? 0}
                                                        </div>

                                                        {/* ✅ 子评论删除按钮 */}
                                                        {currentUser && rep.userId === currentUser.id && (
                                                            <div
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteComment(rep.id) }}
                                                                style={{ color: '#000000', cursor: 'pointer' }}
                                                            >
                                                                <Delete style={{ fontSize: '12px', color: '#000000' }} /> 删除
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>暂无评论，快来抢首评</div>
                    )}
                    <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>暂无更多评论</div>
                </div>

                {/* 输入框 */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                    <Input.TextArea
                        placeholder={replyParentId ? `回复 @${commentList.find(c => c.id === replyParentId)?.user?.uname || '匿名用户'}` : "发表评论..."}
                        value={value}
                        onChange={setValue}
                        style={{ flex: 1, marginRight: 10 }}
                        autoSize={{ minHeight: 40, maxHeight: 80 }}
                    />
                    <Button onClick={handlePublish} round style={{ backgroundColor: value.trim() ? '#ff4646' : '#ccc', border: 'none', minWidth: '60px' }}>发送</Button>
                </div>
            </Popup>
        </div>
    )
}

export default Home