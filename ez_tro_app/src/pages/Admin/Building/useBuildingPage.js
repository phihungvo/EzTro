import {useEffect, useMemo, useState} from 'react';
import {Form, message} from 'antd';
import {useAuth} from '~/routes/AuthContext';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {
    closeModal,
    createBuildingItem,
    deleteBuildingItem,
    fetchBoardingHouseOptions,
    fetchBuildings,
    openCreateModal,
    openDeleteModal,
    openEditModal,
    setPagination,
    setViewMode,
    updateBuildingItem,
} from '~/store/buildingSlice';
import {useAppDispatch, useAppSelector} from '~/store/hooks';

const getModalTitle = (mode) => {
    switch (mode) {
        case 'create':
            return 'Thêm tòa nhà mới';
        case 'edit':
            return 'Chỉnh sửa tòa nhà';
        case 'delete':
            return 'Xóa tòa nhà';
        default:
            return 'Chi tiết tòa nhà';
    }
};

export const useBuildingPage = () => {
    const dispatch = useAppDispatch();
    const {
        items,
        boardingHouseOptions,
        loading,
        boardingHouseLoading,
        saving,
        deleting,
        error,
        total,
        pagination,
        viewMode,
        modal,
    } = useAppSelector((state) => state.building);
    const {current, pageSize} = pagination;

    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || false;

    useEffect(() => {
        dispatch(fetchBoardingHouseOptions());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchBuildings({
            page: current - 1,
            pageSize,
        }));
    }, [dispatch, current, pageSize]);

    const filteredBuildings = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((building) => {
            const searchableValues = [
                building.name,
                building.description,
                building.boardingHouseName,
                building.id,
            ]
                .filter(Boolean)
                .map((value) => String(value).toLowerCase());

            return searchableValues.some((value) => value.includes(query));
        });
    }, [items, searchText]);

    const quotaCurrent = quota?.currentBuildings ?? 0;
    const quotaMax = quota?.maxBuildings ?? 0;
    const isAddDisabled = isOwner && quotaCurrent >= quotaMax;
    const addButtonText = isOwner ? `Thêm (${quotaCurrent}/${quotaMax})` : 'Thêm';

    const handleOpenCreate = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số tòa nhà theo gói hiện tại. Vui lòng nâng cấp gói!');
            return;
        }

        form.resetFields();
        dispatch(openCreateModal());
    };

    const handleOpenEdit = (building) => {
        dispatch(openEditModal(building));
        form.setFieldsValue({
            ...building,
            boardingHouseId: building?.boardingHouseId ?? building?.boardingHouse?.id,
        });
    };

    const handleOpenDelete = (building) => {
        dispatch(openDeleteModal(building));
        form.resetFields();
    };

    const handleCloseModal = () => {
        form.resetFields();
        dispatch(closeModal());
    };

    const refreshBuildings = async () => {
        await dispatch(fetchBuildings({
            page: current - 1,
            pageSize,
        })).unwrap();
    };

    const handleCreate = async (formData) => {
        await dispatch(createBuildingItem(formData)).unwrap();
        invalidateQuota();
        message.success('Thêm tòa nhà thành công!');
        try {
            await refreshBuildings();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã tạo tòa nhà nhưng chưa tải lại được danh sách.');
        }
    };

    const handleUpdate = async (formData) => {
        if (!modal.selected?.id) {
            throw new Error('Thiếu thông tin tòa nhà cần cập nhật.');
        }

        await dispatch(updateBuildingItem({
            buildingId: modal.selected.id,
            formData,
        })).unwrap();
        message.success('Cập nhật tòa nhà thành công!');
        try {
            await refreshBuildings();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã cập nhật tòa nhà nhưng chưa tải lại được danh sách.');
        }
    };

    const handleDelete = async () => {
        if (!modal.selected?.id) {
            throw new Error('Thiếu thông tin tòa nhà cần xóa.');
        }

        await dispatch(deleteBuildingItem(modal.selected.id)).unwrap();
        invalidateQuota();
        message.success('Xóa tòa nhà thành công!');
        try {
            await refreshBuildings();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã xóa tòa nhà nhưng chưa tải lại được danh sách.');
        }
    };

    const submitModal = async (formData) => {
        if (modal.mode === 'create') {
            await handleCreate(formData);
        } else if (modal.mode === 'edit') {
            await handleUpdate(formData);
        } else if (modal.mode === 'delete') {
            await handleDelete();
        }
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

    return {
        boardingHouseOptions,
        boardingHouseLoading,
        loading,
        saving,
        deleting,
        error,
        pagination,
        total,
        viewMode,
        modal,
        searchText,
        setSearchText,
        filteredBuildings,
        isAddDisabled,
        addButtonText,
        form,
        getModalTitle: () => getModalTitle(modal.mode),
        handleOpenCreate,
        handleOpenEdit,
        handleOpenDelete,
        handleCloseModal,
        submitModal,
        handleTableChange,
        handlePaginationChange,
        changeViewMode,
    };
};
