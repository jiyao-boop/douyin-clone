const express = require('express')
// 使用原生redis库，彻底抛弃坑人的@vercel/kv
const { createClient } = require('redis')
const app = express()
// 解析JSON请求体
app.use(express.json())

// ===================== 你的Redis URL（已填好） =====================
const REDIS_URL = "redis://default:D4PkvHwPHwQJyWmny9Cc9BJW6sqCemX1@redis-14604.c273.us-east-1-2.ec2.cloud.redislabs.com:14604"
// ==================================================================

// 初始化Redis客户端
const redisClient = createClient({
    url: REDIS_URL,
    // 额外配置：解决云Redis的连接超时问题
    socket: {
        connectTimeout: 10000,
        keepAlive: true
    }
})

// 连接Redis + 初始化用户表
async function initRedis() {
    try {
        await redisClient.connect()
        console.log('✅ Redis连接成功！🎉')

        // 首次运行创建空用户表（Redis只能存字符串，所以转JSON）
        const hasUsers = await redisClient.get('users')
        if (!hasUsers) {
            await redisClient.set('users', JSON.stringify([]))
            console.log('✅ 用户表初始化完成！')
        }
    } catch (err) {
        console.error('❌ Redis连接失败：', err.message)
        // 连接失败也不退出，方便看具体错误
    }
}
// 执行连接
initRedis()

// 🔑 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body
        // 校验参数
        if (!username || !password) {
            return res.json({ ok: 0, msg: '请输入账号和密码' })
        }
        // 读取用户数据并转数组
        const usersStr = await redisClient.get('users') || '[]'
        const users = JSON.parse(usersStr)
        // 验证账号密码
        const isLogin = users.some(u => u.username === username && u.password === password)
        res.json({
            ok: isLogin ? 1 : 0,
            msg: isLogin ? '登录成功✅' : '账号或密码错误❌'
        })
    } catch (err) {
        res.json({ ok: 0, msg: '接口出错：' + err.message })
    }
})

// 📝 注册接口
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body
        // 校验参数
        if (!username || !password) {
            return res.json({ ok: 0, msg: '请输入账号和密码' })
        }
        // 读取用户数据
        const usersStr = await redisClient.get('users') || '[]'
        const users = JSON.parse(usersStr)
        // 检查用户名是否重复
        if (users.some(u => u.username === username)) {
            return res.json({ ok: 0, msg: '用户名已存在❌' })
        }
        // 添加新用户并保存
        users.push({ username, password })
        await redisClient.set('users', JSON.stringify(users))
        res.json({ ok: 1, msg: '注册成功✅' })
    } catch (err) {
        res.json({ ok: 0, msg: '接口出错：' + err.message })
    }
})

// 启动服务（本地运行用，Vercel部署会自动处理）
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 服务已启动：http://localhost:${PORT}`)
})

// 导出给Vercel部署
module.exports = app