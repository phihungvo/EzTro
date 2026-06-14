# EZ Tro Mobile

Ứng dụng mobile React Native/Expo cho EZ Tro. Project dùng Expo Router, TypeScript và cấu trúc `src` để tách rõ route, feature, service và shared UI.

## Cấu trúc chính

- `src/app`: route theo Expo Router. Chỉ đặt màn hình và layout routing tại đây.
- `src/features`: module nghiệp vụ theo domain, ví dụ `dashboard`, `billing`.
- `src/services`: HTTP client, adapter lưu trữ, service nền dùng chung.
- `src/shared`: component, type và util dùng lại nhiều nơi.
- `src/config`: đọc cấu hình môi trường.
- `src/constants`: theme/token dùng toàn app.
- `assets`: icon, splash và static asset của Expo.

## Chạy local

1. Cài dependency

   ```bash
   npm install
   ```

2. Tạo `.env.local` nếu cần đổi API

   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:8080/api
   ```

3. Start app

   ```bash
   npx expo start
   ```

## Quy ước code

- Route mới: thêm file trong `src/app`.
- Màn hình route chỉ orchestration UI/data. Logic API nằm trong `src/features/*/api` hoặc `src/services`.
- Component dùng lại nhiều feature đặt trong `src/shared/components`.
- Component chỉ dùng trong một domain đặt trong `src/features/<domain>/components`.
- Không lưu secret trong biến `EXPO_PUBLIC_*` vì giá trị sẽ nằm trong bundle client.

## Mẫu đã có

- `src/services/http/api-client.ts`: wrapper `fetch` có query, JSON body, Authorization header và unwrap `ApiResponse.result`.
- `src/features/auth`: đăng nhập `/auth/login`, lưu session bằng SecureStore trên native và localStorage trên web.
- `src/features/dashboard/api/dashboard-service.ts`: service gọi `/user/dashboard/summary`.
- `src/features/billing/api/billing-service.ts`: service gọi `/user/bills/paged`.
- `src/features/dashboard/components/summary-card.tsx` và `src/features/billing/components/bill-card.tsx`: component mẫu theo feature.

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
