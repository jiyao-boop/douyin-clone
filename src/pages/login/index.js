//登录逻辑 主要判断后台有没有输入的数据 有的话就登录 没有的话显示没有这个账号跳回来
import React, { useState } from 'react'
import { Button, Input, Form, Toast, Checkbox } from 'react-vant'
import { UserO, LockO, Eye, EyeOff } from '@react-vant/icons'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate()
    const onFinish = async (values) => {

        try {
            // 1. 检查手机号是否已存在
            const res = await axios.get(`http://localhost:8888/users?phone=${values.phone}&password=${values.password}`)

            if (res.data && res.data.length > 0) {
                // 登录成功
                const userInfo = res.data[0]
                // 保存登录状态
                localStorage.setItem('userInfo', JSON.stringify(userInfo))
                localStorage.setItem('loginPhone', values.phone)
                Toast.success('登录成功')
                setTimeout(() => {
                    navigate('/layout/home') //成功后跳转主页
                }, 1000);
            } else {
                Toast.fail('账号或密码有误')
            }
        } catch (error) {
            console.error(error);
            Toast.fail('登录失败，网络错误');
        }
    }
    return (
        <div style={{ position: 'relative' }}>
            <UserO style={{ position: 'absolute', top: '-5vh', left: '7vw', color: '#c5433a' }} fontSize='24px' />
            <Form onFinish={onFinish}>
                <Form.Item
                    name='phone'
                    label='手机号'
                    rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入正确的电话号码' }]}
                >
                    <Input placeholder='请输入您的电话号码' />
                </Form.Item>
                <Form.Item
                    rules={[{ required: true, pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/, message: '请输入6-8位符号,包含字母和数字' }]}
                    name='password'
                    label='密码'
                >
                    <Input placeholder='请输入密码' />
                </Form.Item>
                <Button color='#f04c4c' round nativeType='submit' type='primary' block >
                    登录
                </Button>
            </Form>
            <div className='register' onClick={() => { navigate('/register') }} style={{ cursor: 'pointer' }}>?没有账号 立即注册</div>
            <Outlet />
        </div>)
}
export default Login