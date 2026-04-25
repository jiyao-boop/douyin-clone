import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const videoStore = createSlice({
    name: 'videoStore',
    initialState: {
        videoList: [],
        currentVideo: null,
        followList: [] // 新增：关注用户id列表
    },
    reducers: {
        setVideoList(state, action) {
            state.videoList = action.payload
        },

        setCurrentVideo(state, action) {
            state.currentVideo = action.payload
        },

        //点赞收藏
        setLikeVideoList(state, action) {
            const video = state.videoList.find(item => item.id === action.payload)
            if (video) {
                video.isLike = !video.isLike
                video.likeCount += video.isLike ? 1 : -1
            }
        },
        setSaveVideoList(state, action) {
            const video = state.videoList.find(item => item.id === action.payload)
            if (video) {
                video.isSave = !video.isSave
                video.saveCount += video.isSave ? 1 : -1
            }
        },

        // ========== 我给你补上的关注方法 ==========
        addFollow(state, action) {
            const uid = action.payload
            if (!state.followList.includes(uid)) {
                state.followList.push(uid)
            }
        },
        cancelFollow(state, action) {
            const uid = action.payload
            state.followList = state.followList.filter(id => id !== uid)
        }
    }
})


export const {
    setVideoList,
    setCurrentVideo,
    setLikeVideoList,
    setSaveVideoList,
    addFollow,
    cancelFollow
} = videoStore.actions

// 编写异步 thunk
export const getVideoList = () => {
    return async (dispatch) => {
        try {
            const res = await axios.get('http://localhost:8888/videos')
            const videosWithDefaults = res.data.map(video => ({
                ...video,
                isLike: false,
                likeCount: video.likeCount || 0,
                isSave: false,
                saveCount: video.saveCount || 0
            }))
            dispatch(setVideoList(videosWithDefaults))
        } catch (error) {
            console.error('获取视频列表失败:', error)
        }
    }
}

export default videoStore.reducer