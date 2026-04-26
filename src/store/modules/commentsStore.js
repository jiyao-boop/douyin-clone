import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const commentsStore = createSlice({
    name: 'comments',
    initialState: {
        commentsList: []
    },
    reducers: {
        setCommentsList(state, action) {
            state.commentsList = action.payload
        },
        setaddComments(state, action) {
            const newCmt = action.payload
            // 如果是回复评论，找到父评论插入children
            if (newCmt.parentId && newCmt.parentId !== 0) {
                const parent = state.commentsList.find(item => item.id === newCmt.parentId)
                if (parent) parent.children.push(newCmt)
            } else {
                // 主评论插入顶部
                state.commentsList.unshift(newCmt)
            }
        },
        setDeleteComments(state, action) {
            state.commentsList = state.commentsList.filter(item => item.id !== action.payload)
        },
        setLikeComment(state, action) {
            const { commentId, isLike } = action.payload
            // 查找主评论
            const comment = state.commentsList.find(item => item.id === commentId)
            if (comment) {
                comment.isLike = isLike
                comment.likeCount = isLike ? (comment.likeCount || 0) + 1 : Math.max(0, (comment.likeCount || 0) - 1)
            } else {
                // 查找子评论
                for (const parent of state.commentsList) {
                    const child = parent.children.find(item => item.id === commentId)
                    if (child) {
                        child.isLike = isLike
                        child.likeCount = isLike ? (child.likeCount || 0) + 1 : Math.max(0, (child.likeCount || 0) - 1)
                        break
                    }
                }
            }
        }
    }
})

const { setCommentsList, setaddComments, setDeleteComments, setLikeComment } = commentsStore.actions

// 获取评论 → 自动构建评论树
export const getsetCommentsList = (videoId) => {
    return async (dispatch) => {
        const [commentsRes, usersRes] = await Promise.all([
            axios.get(`/comments?videoId=${videoId}`),
            axios.get(`/users`)
        ])

        const comments = commentsRes.data
        const users = usersRes.data

        // 绑定用户信息
        const commentsWithUser = comments.map(comment => ({
            ...comment,
            userId: String(comment.userId), // 统一数据类型为字符串
            isLike: comment.isLike || false, // 初始化isLike字段
            user: (() => {
                const user = users.find(u => u.id === String(comment.userId)) // 使用严格相等比较
                return user ? {
                    uname: user.nickname || user.phone,
                    avatar: user.avatar
                } : { uname: '未知用户', avatar: '' }
            })()
        }))

        // 构建评论树
        const rootComments = []
        const replyMap = {}

        commentsWithUser.forEach(cmt => {
            if (!cmt.parentId || cmt.parentId === 0) {
                rootComments.push({ ...cmt, children: [] })
            } else {
                if (!replyMap[cmt.parentId]) replyMap[cmt.parentId] = []
                replyMap[cmt.parentId].push(cmt)
            }
        })

        rootComments.forEach(root => {
            root.children = replyMap[root.id] || []
        })

        dispatch(setCommentsList(rootComments))
    }
}

// 发布评论/回复通用接口
export const getsetaddComments = (commentData) => {
    return async (dispatch) => {
        const res = await axios.post('/comments', {
            parentId: commentData.parentId || 0,
            likeCount: 0,
            ...commentData
        })
        const newComment = { ...res.data, user: commentData.user }
        dispatch(setaddComments(newComment))
    }
}

export const getsetDeleteComments = (id) => {
    return async (dispatch) => {
        await axios.delete(`/comments/${id}`)
        dispatch(setDeleteComments(id))
    }
}

// 点赞评论
export const getsetLikeComment = (commentId, isLike) => {
    return async (dispatch) => {
        try {
            // 更新后端数据 - 修复：不使用字符串，直接更新状态
            await axios.patch(`/comments/${commentId}`, {
                isLike: isLike
            })
            // 更新前端状态
            dispatch(setLikeComment({ commentId, isLike }))
        } catch (error) {
            console.error('点赞评论失败:', error)
        }
    }
}

export default commentsStore.reducer