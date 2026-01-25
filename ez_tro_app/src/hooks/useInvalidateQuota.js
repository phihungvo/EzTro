import {useQueryClient} from '@tanstack/react-query';
/* Hook để invalidate cache của quota chủ sở hữu
 Khi gọi hàm trả về từ hook này, nó sẽ làm mới dữ liệu quota trong các component sử dụng useOwnerQuota
 Ví dụ: sau khi người dùng nâng cấp gói dịch vụ thành công thì gọi hàm này để cập nhật lại quota mới nhất.

 Sử dụng:
 const invalidateQuota = useInvalidateQuota();
 ...
 await upgradeSubscriptionPlan(...);
 invalidateQuota();  Làm mới quota sau khi nâng cấp

 Giúp các component hiển thị quota luôn có dữ liệu mới nhất mà không cần reload trang hoặc component thủ công nữa
 vì React Query sẽ tự động fetch lại dữ liệu khi cache bị invalidated
 */
export const useInvalidateQuota = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({queryKey: ['owner-quota']});
    };
};