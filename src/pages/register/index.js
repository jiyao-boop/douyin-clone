//注册逻辑 只要密码账号符合规矩 就把该类信息储存到后台
import { Button, Input, Form, Toast } from 'react-vant'
import { Phone, UserO } from '@react-vant/icons'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



const Register = () => {
    const navigate = useNavigate()
    const onFinish = async (values) => {

        try {
            // 1. 检查手机号是否已存在
            const res = await axios.get(`http://localhost:8888/users`, {
                params: { phone: values.text1 }
            })

            if (res.data.length > 0) {
                // Toast.fail('该手机号已被注册');
                alert('faulse')
            } else {
                // 2. 用户不存在，执行注册
                await axios.post('http://localhost:8888/users', {
                    phone: values.text1,
                    password: values.password,
                    nickname: `用户${values.text1.slice(7)}`,
                    avatar: "https://placeimg.com/64/64/any"
                })

                // 3. 提示成功并跳转
                // Toast.success('注册成功！');
                alert('success')
                setTimeout(() => {
                    navigate('/layout/home'); // 注册成功后跳转主页
                }, 1000) // 等待1秒让提示显示出来
            }
        } catch (error) {
            console.error(error);
            Toast.fail('注册失败，网络错误');
        }
    }

    return (
        <div style={{ position: 'relative', padding: '20px' }}>
            <UserO style={{ position: 'absolute', top: '-5vh', left: '7vw', color: '#c5433a' }} fontSize='24px' />
            <Form onFinish={onFinish} >
                <Form.Item
                    name='text1'
                    label='手机号'
                    rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入正确的电话号码' }]}
                >
                    <Input placeholder='请输入您的电话号码' />
                </Form.Item>

                <Form.Item
                    name='password'
                    label='密码'
                    rules={[{ required: true, pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/, message: '请输入6-8位包含字母和数字的密码' }]}
                >
                    <Input type='password' placeholder='请输入密码' />
                </Form.Item>

                <Button color='#f04c4c' round nativeType='submit' type='primary' block>
                    注册
                </Button>
            </Form>

            <div className='login' onClick={() => { navigate('/') }} style={{ cursor: 'pointer', marginTop: '20px', textAlign: 'center' }}>
                ?已有账号 立即登录
            </div>
            <Outlet />
        </div>
    )
}
export default Register