import { useState, useEffect, useRef } from 'react';
import { Toast, Button, Input } from 'react-vant';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PublishVideo() {
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [title, setTitle] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loginUserId, setLoginUserId] = useState(null);

    // 读取登录用户
    useEffect(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            const user = JSON.parse(userInfoStr);
            const userId = Number(user.id);
            if (!isNaN(userId)) setLoginUserId(userId);
            else Toast.fail('账号ID错误');
        } else {
            Toast.fail('请先登录');
        }
    }, [navigate]);

    // 选择视频 - 修复可重复选、换文件
    const handleSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            Toast.fail('只能选择视频');
            e.target.value = '';
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            Toast.fail('视频不能超过50MB');
            e.target.value = '';
            return;
        }

        // 销毁旧预览
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(URL.createObjectURL(file));
        setVideoFile(file);
        Toast.success('视频已选择');
    };

    // 发布视频
    const handlePublish = async () => {
        if (!loginUserId) return Toast.fail('请先登录');
        if (!videoFile) return Toast.fail('请选择视频');
        if (!title.trim()) return Toast.fail('请输入标题');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('video', videoFile);

            const uploadRes = await axios.post(
                'http://localhost:8888/upload',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const realVideoUrl = uploadRes.data.url;

            await axios.post('http://localhost:8888/videos', {
                title: title.trim(),
                videoUrl: realVideoUrl,
                cover: 'https://picsum.photos/400/225',
                authorId: loginUserId,
                likeCount: 0,
                shareCount: 0,
                saveCount: 0,
            });

            Toast.success('发布成功！');
            // 发布后清空，方便下次发布
            resetFile();
            navigate('/layout/home');
        } catch (err) {
            console.error(err);
            Toast.fail('发布失败：请确保 json-server 已启动并支持上传');
        } finally {
            setLoading(false);
        }
    };

    // 重置选择，随便换其他视频
    const resetFile = () => {
        if (fileRef.current) fileRef.current.value = '';
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        setVideoFile(null);
    };

    // 组件销毁释放预览内存
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div style={{ padding: 16, backgroundColor: '#000', minHeight: '100vh' }}>
            <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 16 }}>发布视频</h2>

            {previewUrl && (
                <video
                    src={previewUrl}
                    controls
                    style={{ width: '100%', borderRadius: 12, marginBottom: 16 }}
                />
            )}

            <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={handleSelect}
                style={{ color: '#fff', marginBottom: 16 }}
            />

            {/* 重新选择按钮，随时换别的视频 */}
            {videoFile && (
                <Button
                    size="small"
                    onClick={resetFile}
                    style={{ marginBottom: 12, background: '#666', color: '#fff', border: 'none' }}
                >
                    重新选择其他视频
                </Button>
            )}

            <Input
                placeholder="请输入视频标题"
                value={title}
                onChange={setTitle}
                style={{ backgroundColor: '#1a1a1a', color: '#fff', marginBottom: 16, borderRadius: 6 }}
                maxLength={100}
                clearable
            />

            <Button
                type="primary"
                block
                loading={loading}
                onClick={handlePublish}
                disabled={!videoFile || !loginUserId || loading}
                style={{ backgroundColor: '#fe2c55', borderRadius: 6, height: 44 }}
            >
                发布视频
            </Button>
        </div>
    );
}