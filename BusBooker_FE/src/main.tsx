import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { ConfigProvider } from 'antd';
import { UserProvider } from './providers/UserProvider';

dayjs.locale('vi');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <UserProvider>
    <ConfigProvider locale={viVN}>
      <App />
    </ConfigProvider>
  </UserProvider>
);

