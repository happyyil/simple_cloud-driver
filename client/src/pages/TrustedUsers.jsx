import { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Empty,
  Tabs,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { trustedUserAPI, fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;

const TrustedUsers = () => {
  const [trustedUsers, setTrustedUsers] = useState([]);
  const [trustedByUsers, setTrustedByUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadTrustedUsers();
    loadTrustedByUsers();
  }, []);

  const loadTrustedUsers = async () => {
    setLoading(true);
    try {
      const response = await trustedUserAPI.getTrustedUsers();
      setTrustedUsers(response.data.data);
    } catch (error) {
      message.error('加载受信任用户失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTrustedByUsers = async () => {
    try {
      const response = await trustedUserAPI.getTrustedByUsers();
      setTrustedByUsers(response.data.data);
    } catch (error) {
      message.error('加载信任我的用户失败');
    }
  };

  const handleAddTrustedUser = async () => {
    if (!userName.trim()) {
      message.error('请输入用户名');
      return;
    }
    try {
      await trustedUserAPI.addTrustedUser({ trustedUserName: userName.trim() });
      message.success('已添加受信任用户');
      setUserName('');
      setAddModalVisible(false);
      loadTrustedUsers();
    } catch (error) {
      message.error(error.response?.data?.error || '添加失败');
    }
  };

  const handleRemoveTrustedUser = (trustedUserId) => {
    Modal.confirm({
      title: '取消信任',
      content: '确定要取消对该用户的信任吗？',
      onOk: async () => {
        try {
          await trustedUserAPI.removeTrustedUser(trustedUserId);
          message.success('已取消信任');
          loadTrustedUsers();
        } catch (error) {
          message.error('取消失败');
        }
      },
    });
  };

  const handleViewFiles = (trustedUserId) => {
    window.location.href = `/?targetUserId=${trustedUserId}`;
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

  const trustedColumns = [
    {
      title: '用户',
      dataIndex: ['trustedUser', 'name'],
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: '邮箱',
      dataIndex: ['trustedUser', 'email'],
      key: 'email',
    },
    {
      title: '信任时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewFiles(record.trustedUser.id)}
          >
            查看文件
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveTrustedUser(record.trustedUser.id)}
          >
            取消信任
          </Button>
        </Space>
      ),
    },
  ];

  const trustedByColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: '邮箱',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: '信任时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          该用户信任我
        </Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'trusted',
      label: `我信任的用户 (${trustedUsers.length})`,
      children: (
        trustedUsers.length === 0 ? (
          <Empty description="暂无受信任用户" />
        ) : (
          <Table
            columns={trustedColumns}
            dataSource={trustedUsers}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        )
      ),
    },
    {
      key: 'trusted-by',
      label: `信任我的用户 (${trustedByUsers.length})`,
      children: (
        trustedByUsers.length === 0 ? (
          <Empty description="暂无用户信任我" />
        ) : (
          <Table
            columns={trustedByColumns}
            dataSource={trustedByUsers}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        )
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
        <h1 style={{ margin: 0, color: '#1890ff' }}>受信任用户</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
        >
          添加受信任用户
        </Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Tabs items={tabItems} />
      </Content>

      <Modal
        title="添加受信任用户"
        open={addModalVisible}
        onOk={handleAddTrustedUser}
        onCancel={() => {
          setAddModalVisible(false);
          setUserName('');
        }}
        okText="添加"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            用户名 <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Input
            placeholder="请输入要信任的用户名"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onPressEnter={handleAddTrustedUser}
          />
        </div>
        <div style={{ color: '#666', fontSize: '12px' }}>
          注意：添加受信任用户后，该用户将能够查看您的所有文件。
        </div>
      </Modal>
    </Layout>
  );
};

export default TrustedUsers;