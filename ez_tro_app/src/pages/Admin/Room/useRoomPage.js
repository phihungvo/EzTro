import {useEffect, useMemo, useRef, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '~/routes/AuthContext';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import usePagination from '~/hooks/usePagination';
import useDebounce from '~/hooks/useDebounce';
import {
    closeModal,
    fetchRoomBoardingHouseOptions,
    fetchRooms,
    openDeleteModal,
    removeRoom,
    setViewMode,
} from '~/store/roomSlice';
import {useAppDispatch, useAppSelector} from '~/store/hooks';

const resolveBasePath = (pathname) => pathname.startsWith('/admin') ? '/admin/rooms' : '/owner/rooms';

const STATUS_OPTIONS = [
    {value: 'AVAILABLE', label: 'Trống'},
    {value: 'OCCUPIED', label: 'Đã cho thuê'},
    {value: 'MAINTENANCE', label: 'Đang bảo trì'},
];

export const useRoomPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();
    const basePath = resolveBasePath(location.pathname);

    const {
        items,
        boardingHouseOptions,
        loading,
        boardingHouseLoading,
        deleting,
        error,
        total,
        viewMode,
        modal,
    } = useAppSelector((state) => state.room);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [boardingHouseFilter, setBoardingHouseFilter] = useState(null);
    const [areaRange, setAreaRange] = useState([null, null]);
    const [priceRange, setPriceRange] = useState([null, null]);
    const [hasActiveContractFilter, setHasActiveContractFilter] = useState(null);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const filterFingerprint = useMemo(() => (
        [
            debouncedSearch || '',
            statusFilter || '',
            boardingHouseFilter || '',
            areaRange?.[0] ?? '',
            areaRange?.[1] ?? '',
            priceRange?.[0] ?? '',
            priceRange?.[1] ?? '',
            hasActiveContractFilter ?? '',
        ].join('|')
    ), [areaRange, boardingHouseFilter, debouncedSearch, hasActiveContractFilter, priceRange, statusFilter]);
    const lastFilterFingerprintRef = useRef(filterFingerprint);

    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
    } = usePagination({initialPageSize: 10});
    const {current, pageSize} = pagination;

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const isOwner = user?.isOwner || false;

    const currentRooms = quota?.currentRooms ?? 0;
    const maxRooms = quota?.maxRooms ?? 0;
    const addButtonText = isOwner ? `Thêm (${currentRooms}/${maxRooms})` : 'Thêm';
    const isAddDisabled = isOwner && maxRooms > 0 && currentRooms >= maxRooms;

    useEffect(() => {
        dispatch(fetchRoomBoardingHouseOptions());
    }, [dispatch]);

    useEffect(() => {
        const filtersChanged = lastFilterFingerprintRef.current !== filterFingerprint;
        if (filtersChanged) {
            lastFilterFingerprintRef.current = filterFingerprint;
            if (current !== 1) {
                resetPagination();
                return;
            }
        }

        const params = {
            page: current - 1,
            pageSize,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;
        if (boardingHouseFilter) params.boardingHouseId = boardingHouseFilter;
        if (areaRange[0] !== null) params.minArea = areaRange[0];
        if (areaRange[1] !== null) params.maxArea = areaRange[1];
        if (priceRange[0] !== null) params.minPrice = priceRange[0];
        if (priceRange[1] !== null) params.maxPrice = priceRange[1];
        if (hasActiveContractFilter !== null) {
            params.hasActiveContract = hasActiveContractFilter === 'YES';
        }

        dispatch(fetchRooms(params));
    }, [
        areaRange,
        boardingHouseFilter,
        current,
        debouncedSearch,
        dispatch,
        filterFingerprint,
        hasActiveContractFilter,
        pageSize,
        priceRange,
        resetPagination,
        statusFilter,
    ]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter(null);
        setBoardingHouseFilter(null);
        setAreaRange([null, null]);
        setPriceRange([null, null]);
        setHasActiveContractFilter(null);
        resetPagination();
        message.success('Đã reset bộ lọc');
    };

    const handleAddRoom = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số phòng theo gói. Vui lòng nâng cấp gói để thêm mới.');
            return;
        }
        navigate(`${basePath}/create-room`);
    };

    const handleEditRoom = (record) => {
        navigate(`${basePath}/${record.id}/edit`);
    };

    const handleOpenDelete = (record) => {
        dispatch(openDeleteModal(record));
    };

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const refreshRooms = async () => {
        const params = {
            page: current - 1,
            pageSize,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;
        if (boardingHouseFilter) params.boardingHouseId = boardingHouseFilter;
        if (areaRange[0] !== null) params.minArea = areaRange[0];
        if (areaRange[1] !== null) params.maxArea = areaRange[1];
        if (priceRange[0] !== null) params.minPrice = priceRange[0];
        if (priceRange[1] !== null) params.maxPrice = priceRange[1];
        if (hasActiveContractFilter !== null) {
            params.hasActiveContract = hasActiveContractFilter === 'YES';
        }

        await dispatch(fetchRooms(params)).unwrap();
    };

    const handleDelete = async () => {
        if (!modal.selected?.id) {
            throw new Error('Thiếu thông tin phòng cần xóa.');
        }

        await dispatch(removeRoom(modal.selected.id)).unwrap();
        invalidateQuota();
        message.success('Xóa phòng thành công');
        try {
            await refreshRooms();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã xóa phòng nhưng chưa tải lại được danh sách.');
        }
    };

    const submitDelete = async () => {
        await handleDelete();
    };

    const handlePaginationChangeSafe = (page, nextPageSize) => {
        handlePaginationChange(page, nextPageSize);
    };

    const handleViewModeChange = (nextMode) => {
        dispatch(setViewMode(nextMode));
    };

    return {
        items,
        boardingHouseOptions,
        boardingHouseLoading,
        loading,
        deleting,
        total,
        pagination,
        viewMode,
        modal,
        searchTerm,
        statusFilter,
        boardingHouseFilter,
        areaRange,
        priceRange,
        hasActiveContractFilter,
        STATUS_OPTIONS,
        addButtonText,
        isAddDisabled,
        handleResetFilters,
        handleAddRoom,
        handleEditRoom,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handlePaginationChange: handlePaginationChangeSafe,
        handleViewModeChange,
        setSearchTerm,
        setStatusFilter,
        setBoardingHouseFilter,
        setAreaRange,
        setPriceRange,
        setHasActiveContractFilter,
    };
};
