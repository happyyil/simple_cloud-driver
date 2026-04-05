import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { shareAPI } from '../services/api';

const ShareModal = ({ visible, file, onCancel, onSuccess }) => {
  const [toUserName, setToUserName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!toUserName.trim()) {
      message.error('请输入用户名');
      return;
    }

    setLoading(true);
    try {
      await shareAPI.shareFile({
        fileId: file.id,
        toUserName: toUserName.trim(),
        message: messageText.trim() || undefined,
      });
      message.success('分享成功');
      setToUserName('');
      setMessageText('');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.error || '分享失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setToUserName('');
    setMessageText('');
    onCancel();
  };

  return (
    <Modal
      title="分享文件"
      open={visible}
      onOk={handleShare}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="分享"
      cancelText="取消"
    >
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 500, color: '#666' }}>文件：</span>
        <span>{file?.name}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          分享给 <span style={{ color: '#ff4d4f' }}>*</span>
        </label>
        <Input
          placeholder="请输入用户名"
          value={toUserName}
          onChange={(e) => setToUserName(e.target.value)}
          onPressEnter={handleShare}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>留言（可选）</label>
        <Input.TextArea
          placeholder="给接收方留个言吧..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
};

export default ShareModal;