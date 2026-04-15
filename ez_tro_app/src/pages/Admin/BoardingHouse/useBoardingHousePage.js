import {useEffect, useMemo} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '~/routes/AuthContext';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {
    closeModal,
    fetchBoardingHouses,
    openDeleteModal,
    removeBoardingHouse,
    setPagination,
    setSearchTerm,
    setViewMode,
} from '~/store/boardingHouseSlice';
import {useAppDispatch, useAppSelector} from '~/store/hooks';

const resolveBasePath = (pathname) =>
    pathname.startsWith('/admin') ? '/admin/boarding-houses' : '/owner/boarding-houses';

export const useBoardingHousePage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        items,
        loading,
        deleting,
        error,
        total,
        pagination,
        viewMode,
        searchTerm,
        modal,
    } = useAppSelector((state) => state.boardingHouse);
    const {current, pageSize} = pagination;

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || user?.role === 'OWNER';
    const basePath = resolveBasePath(location.pathname);

    useEffect(() => {
        dispatch(fetchBoardingHouses({
            page: current - 1,
            pageSize,
        }));
    }, [dispatch, current, pageSize]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const filteredBoardingHouses = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            return items;
        }

        return items.filter((item) => [
            item.name,
            item.address,
            item.contactPhone,
            item.ownerName,
            item.ownerEmail,
        ].some((value) => String(value || '').toLowerCase().includes(keyword)));
    }, [items, searchTerm]);

    const currentQuota = quota?.currentBoardingHouses ?? 0;
    const maxQuota = quota?.maxBoardingHouses ?? 0;
    const isAddDisabled = isOwner && maxQuota > 0 && currentQuota >= maxQuota;
    const addButtonText = isOwner ? `Thêm (${currentQuota}/${maxQuota})` : 'Thêm';

    const handleAddBoardingHouse = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số khu trọ theo gói hiện tại. Vui lòng nâng cấp gói.');
            return;
        }

        navigate(`${basePath}/create`);
    };

    const handleEditBoardingHouse = (record) => {
        navigate(`${basePath}/${record.id}/edit`);
    };

    const handleOpenDelete = (record) => {
        dispatch(openDeleteModal(record));
    };

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const refreshBoardingHouses = async () => {
        await dispatch(fetchBoardingHouses({
            page: current - 1,
            pageSize,
        })).unwrap();
    };

    const handleDelete = async () => {
        if (!modal.selected?.id) {
            throw new Error('Thiếu thông tin khu trọ cần xóa.');
        }

        await dispatch(removeBoardingHouse(modal.selected.id)).unwrap();
        invalidateQuota();
        message.success('Xóa khu trọ thành công');
        try {
            await refreshBoardingHouses();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã xóa khu trọ nhưng chưa tải lại được danh sách.');
        }
    };

    const submitDelete = async () => {
        await handleDelete();
    };

    const handlePaginationChange = (page, nextPageSize) => {
        const nextCurrent = nextPageSize !== pageSize ? 1 : page;
        dispatch(setPagination({current: nextCurrent, pageSize: nextPageSize}));
    };

    const handleTableChange = (newPagination) => {
        handlePaginationChange(newPagination.current, newPagination.pageSize);
    };

    const changeViewMode = (nextMode) => {
        dispatch(setViewMode(nextMode));
    };

    const changeSearchTerm = (nextTerm) => {
        dispatch(setSearchTerm(nextTerm));
    };

    return {
        loading,
        deleting,
        error,
        total,
        pagination,
        viewMode,
        searchTerm,
        modal,
        filteredBoardingHouses,
        isAddDisabled,
        addButtonText,
        handleAddBoardingHouse,
        handleEditBoardingHouse,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handlePaginationChange,
        handleTableChange,
        changeViewMode,
        changeSearchTerm,
    };
};
