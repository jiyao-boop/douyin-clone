// 组合实例对象 组合子模块
import { configureStore } from "@reduxjs/toolkit";
import videoReducer from './modules/videostore'
import commentsReducer from './modules/commentsStore'
import userAvatarReducer from './modules/userAvatarstore'
import userReducer from './modules/userStore'
const store = configureStore({
    reducer: {
        video: videoReducer,
        comments: commentsReducer,
        userAvatar: userAvatarReducer,
        user: userReducer
    }
})
export default store