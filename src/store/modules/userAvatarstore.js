import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const userAvatarStore = createSlice({
    name: 'userAvatar',
    initialState: {
        userList: []
    },
    reducers: {
        //设置用户列表
        setUserList(state, action) {
            state.userList = action.payload
        }
    }
})

export const { setUserList } = userAvatarStore.actions

// 编写异步 thunk
// 获取用户列表
export const getsetUserList = () => {
    return async (dispatch) => {
        const res = await axios.get('/users')
        dispatch(setUserList(res.data))
    }
}

// 根据用户ID获取用户信息
export const getsetUserById = (userId) => {
    return async (dispatch) => {
        const res = await axios.get(`/users/${userId}`)
        // 这里可以添加处理单个用户的逻辑
        console.log('获取到的用户信息:', res.data)
    }
}

export default userAvatarStore.reducer