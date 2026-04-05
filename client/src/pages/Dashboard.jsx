import { useState, useEffect } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Upload,
  Modal,
  Input,
  message,
  Table,
  Space,
  Dropdown,
  Tag,
  Empty,
  Badge
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  FolderAddOutlined,
  HomeOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  InboxOutlined,
  SafetyOutlined,
  UserOutlined
} from '@ant-design/icons';
import { fileAPI, shareAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ShareModal from '../components/ShareModal';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [unreadShareCount, setUnreadShareCount] = useState(0);
  const [targetUser, setTargetUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadFiles();
    loadUnreadShares();
    checkTargetUser();
  }, [currentFolderId]);

  const checkTargetUser = () => {
    const targetUserId = searchParams.get('targetUserId');
    if (targetUserId) {
      setTargetUser({ id: parseInt(targetUserId) });
    }
  };

  const loadUnreadShares = async () => {
    try {
      const response = await shareAPI.getReceivedShares();
      const unreadCount = response.data.data.filter(share => !share.isRead).length;
      setUnreadShareCount(unreadCount);
    } catch (error) {
      console.error('加载未读分享失败', error);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentFolderId) {
        params.parentId = currentFolderId;
      }
      if (targetUser?.id) {
        params.targetUserId = targetUser.id;
      }
      const response = await fileAPI.getFiles(currentFolderId, params.targetUserId);
      setFiles(response.data.data);
    } catch (error) {
      message.error(error.response?.data?.error || '加载文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error('请输入文件夹名称');
      return;
    }
    try {
      await fileAPI.createFolder({
        name: newFolderName,
        parentId: currentFolderId
      });
      message.success('文件夹创建成功');
      setNewFolderName('');
      setNewFolderModalVisible(false);
      loadFiles();
    } catch (error) {
      message.error(error.response?.data?.error || '创建文件夹失败');
    }
  };

  const handleUploadFile = async (file) => {
    setUploading(true);
    try {
      await fileAPI.uploadFile(file, currentFolderId);
      message.success('文件上传成功');
      loadFiles();
    } catch (error) {
      message.error('文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async () => {
    if (!newItemName.trim()) {
      message.error('请输入新名称');
      return;
    }
    try {
      await fileAPI.renameFile(renameItem.id, newItemName);
      message.success('重命名成功');
      setRenameModalVisible(false);
      setRenameItem(null);
      setNewItemName('');
      loadFiles();
    } catch (error) {
      message.error(error.response?.data?.error || '重命名失败');
    }
  };

  const handleDelete = async (item) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${item.isFolder ? '文件夹' : '文件'} "${item.name}" 吗？`,
      onOk: async () => {
        try {
          await fileAPI.deleteFile(item.id);
          message.success('删除成功');
          loadFiles();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleDownload = async (file) => {
    try {
      const response = await fileAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShareModalVisible(true);
  };

  const handleShareSuccess = () => {
    message.success('文件已分享');
  };

  const getFileIcon = (item) => {
    return item.isFolder ? <FolderOutlined /> : <FileOutlined />;
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
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => record.isFolder && handleFolderClick(record)}
        >
          {getFileIcon(record)}
          {text}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'isFolder',
      key: 'type',
      render: (isFolder) => (
        <Tag color={isFolder ? 'blue' : 'green'}>
          {isFolder ? '文件夹' : '文件'}
        </Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatFileSize(size),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.isFolder && (
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          )}
          {!targetUser && (
            <>
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={() => handleShare(record)}
              />
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setRenameItem(record);
                  setNewItemName(record.name);
                  setRenameModalVisible(true);
                }}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </>
          )}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, color: '#1890ff' }}>
            {targetUser ? (
              <span>
                <UserOutlined /> {files.length > 0 ? files[0]?.user?.name || '未知用户' : '用户'} 的文件
              </span>
            ) : (
              '云盘系统'
            )}
          </h1>
          {targetUser && (
            <Button
              type="link"
              onClick={() => {
                setTargetUser(null);
                navigate('/');
              }}
            >
              返回我的文件
            </Button>
          )}
        </div>
        <Space>
          <Badge count={unreadShareCount} offset={[-5, 5]}>
            <Button
              icon={<InboxOutlined />}
              onClick={() => navigate('/shared-files')}
            >
              共享文件
            </Button>
          </Badge>
          <Button
            icon={<SafetyOutlined />}
            onClick={() => navigate('/trusted-users')}
          >
            受信任用户
          </Button>
          <span>欢迎, {user?.name}</span>
          <Button type="primary" onClick={logout}>
            退出登录
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => handleBreadcrumbClick(-1)} style={{ cursor: 'pointer' }}>
              <HomeOutlined />
            </Breadcrumb.Item>
            {folderPath.map((folder, index) => (
              <Breadcrumb.Item
                key={folder.id}
                onClick={() => handleBreadcrumbClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {folder.name}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
            {!targetUser && (
              <>
                <Button
                  type="primary"
                  icon={<FolderAddOutlined />}
                  onClick={() => setNewFolderModalVisible(true)}
                >
                  新建文件夹
                </Button>
                <Upload
                  customRequest={({ file }) => handleUploadFile(file)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    上传文件
                  </Button>
                </Upload>
              </>
            )}
          </Space>
        </div>

        {files.length === 0 ? (
          <Empty description="暂无文件" />
        ) : (
          <Table
            columns={columns}
            dataSource={files}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        )}
      </Content>

      <Modal
        title="新建文件夹"
        open={newFolderModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => {
          setNewFolderModalVisible(false);
          setNewFolderName('');
        }}
      >
        <Input
          placeholder="文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
        />
      </Modal>

      <Modal
        title="重命名"
        open={renameModalVisible}
        onOk={handleRename}
        onCancel={() => {
          setRenameModalVisible(false);
          setRenameItem(null);
          setNewItemName('');
        }}
      >
        <Input
          placeholder="新名称"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleRename}
        />
      </Modal>

      <ShareModal
        visible={shareModalVisible}
        file={selectedFile}
        onCancel={() => {
          setShareModalVisible(false);
          setSelectedFile(null);
        }}
        onSuccess={handleShareSuccess}
      />
    </Layout>
  );
};

export default Dashboard;