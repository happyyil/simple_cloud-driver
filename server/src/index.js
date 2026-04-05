const app = require('./app');
const prisma = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// 连接数据库
prisma.$connect()
  .then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});