import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GlobalStyles from './components/GlobalStyles';

// Import React Query
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// Tạo một instance QueryClient (chỉ tạo 1 lần cho toàn app)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,                    // Thử lại 1 lần nếu lỗi
            staleTime: 5 * 60 * 1000,    // Cache 5 phút
            refetchOnWindowFocus: false, // Không tự động refetch khi focus tab
            refetchOnReconnect: false,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode> // Tạm comment nếu bạn đang dev, vì StrictMode có thể gây double render
    <QueryClientProvider client={queryClient}>
        <GlobalStyles>
            <App/>
        </GlobalStyles>
    </QueryClientProvider>
    // </React.StrictMode>
);

