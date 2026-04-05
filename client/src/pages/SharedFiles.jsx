import { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Empty,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  CloseOutlined,
  CheckOutlined,
  FileOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { shareAPI, fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;

const SharedFiles = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    setLoading(true);
    try {
      const response = await shareAPI.getReceivedShares();
      setShares(response.data.data);
    } catch (error) {
      message.error('加载共享文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (share) => {
    try {
      const response = await fileAPI.downloadFile(share.file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', share.file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 标记为已读
      if (!share.isRead) {
        await shareAPI.markAsRead(share.id);
        loadSharedFiles();
      }
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleCancelShare = (share) => {
    Modal.confirm({
      title: '取消分享',
      content: '确定要取消这个共享文件吗？',
      onOk: async () => {
        try {
          await shareAPI.deleteShare(share.id);
          message.success('已取消分享');
          loadSharedFiles();
        } catch (error) {
          message.error('取消失败');
        }
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const columns = [
    {
      title: '文件信息',
      key: 'file',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileOutlined />
            <span style={{ fontWeight: 500 }}>{record.file.name}</span>
            {!record.isRead && <Tag color="red">新</Tag>}
          </div>
          {record.message && (
            <div style={{ marginTop: 4, color: '#666', fontSize: '12px' }}>
              留言: {record.message}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '分享者',
      dataIndex: ['fromUser', 'name'],
      key: 'fromUser',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <UserOutlined />
          {name}
        </div>
      ),
    },
    {
      title: '大小',
      dataIndex: ['file', 'size'],
      key: 'size',
      render: (size) => formatFileSize(size),
    },
    {
      title: '分享时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockCircleOutlined />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="下载文件">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              下载
            </Button>
          </Tooltip>
          <Tooltip title="取消分享">
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleCancelShare(record)}
            >
              取消
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#1890ff' }}>共享文件</h1>
      </Header>
      <Content style={{ padding: '24px' }}>
        {shares.length === 0 ? (
          <Empty description="暂无共享文件" />
        ) : (
          <Table
            columns={columns}
            dataSource={shares}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个文件`,
            }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default SharedFiles;