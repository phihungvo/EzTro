import React, {useEffect, useMemo, useRef, useState} from 'react';
import {message, Tag} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '~/routes/AuthContext';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import useDebounce from '~/hooks/useDebounce';
import {
    closeModal,
    fetchTenants,
    openDeleteModal,
    removeTenant,
    setPagination,
    setViewMode,
} from '~/store/tenantSlice';
import {useAppDispatch, useAppSelector} from '~/store/hooks';

const resolveBasePath = (pathname) => (pathname.startsWith('/admin') ? '/admin/tenants' : '/owner/tenants');

const GENDER_OPTIONS = [
    {value: 'MALE', label: 'Nam'},
    {value: 'FEMALE', label: 'Nữ'},
    {value: 'OTHER', label: 'Khác'},
];

const OCCUPATION_OPTIONS = [
    {value: 'STUDENT', label: 'Sinh viên'},
    {value: 'EMPLOYEE', label: 'Nhân viên'},
    {value: 'FREELANCER', label: 'Freelancer'},
    {value: 'OTHER', label: 'Khác'},
];

const GENDER_META = {
    MALE: {color: 'blue', label: 'Nam'},
    FEMALE: {color: 'magenta', label: 'Nữ'},
    OTHER: {color: 'purple', label: 'Khác'},
};

export const useTenantPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const tenantBasePath = resolveBasePath(location.pathname);
    const {
        items,
        loading,
        deleting,
        total,
        pagination,
        viewMode,
        modal,
        error,
    } = useAppSelector((state) => state.tenant);
    const {current, pageSize} = pagination;

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [dateRange, setDateRange] = useState(null);
    const [genderFilter, setGenderFilter] = useState(null);
    const [occupationFilter, setOccupationFilter] = useState(null);
    const [hasActiveContractFilter, setHasActiveContractFilter] = useState(null);
    const filterFingerprint = useMemo(() => (
        [
            debouncedSearchTerm || '',
            dateRange?.[0]?.valueOf?.() ?? '',
            dateRange?.[1]?.valueOf?.() ?? '',
            genderFilter || '',
            occupationFilter || '',
            hasActiveContractFilter ?? '',
        ].join('|')
    ), [dateRange, debouncedSearchTerm, genderFilter, hasActiveContractFilter, occupationFilter]);
    const lastFilterFingerprintRef = useRef(filterFingerprint);

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || false;

    const currentCount = quota?.currentTenants ?? 0;
    const maxCount = quota?.maxTenants ?? 0;
    const addButtonText = isOwner ? `Thêm (${currentCount}/${maxCount})` : 'Thêm';
    const isAddDisabled = isOwner && currentCount >= maxCount;

    useEffect(() => {
        const filtersChanged = lastFilterFingerprintRef.current !== filterFingerprint;
        if (filtersChanged) {
            lastFilterFingerprintRef.current = filterFingerprint;
            if (current !== 1) {
                dispatch(setPagination({current: 1, pageSize}));
                return;
            }
        }

        const params = {
            page: current - 1,
            pageSize,
        };

        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (dateRange && dateRange.length === 2) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        if (genderFilter) params.gender = genderFilter;
        if (occupationFilter) params.occupation = occupationFilter;
        if (hasActiveContractFilter) {
            params.hasActiveContract = hasActiveContractFilter === 'YES';
        }

        dispatch(fetchTenants(params));
    }, [
        current,
        dateRange,
        debouncedSearchTerm,
        dispatch,
        filterFingerprint,
        genderFilter,
        hasActiveContractFilter,
        occupationFilter,
        pageSize,
    ]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setGenderFilter(null);
        setOccupationFilter(null);
        setHasActiveContractFilter(null);
        dispatch(setPagination({current: 1, pageSize}));
        message.success('Đã reset bộ lọc!');
    };

    const handleAddTenant = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số người thuê theo gói hiện tại. Vui lòng nâng cấp gói!');
            return;
        }
        navigate(`${tenantBasePath}/create-tenant`);
    };

    const handleEditTenant = (record) => {
        navigate(`${tenantBasePath}/${record.id}/edit`);
    };

    const handleViewTenant = (record) => {
        navigate(`${tenantBasePath}/${record.id}`);
    };

    const handleOpenDelete = (record) => {
        dispatch(openDeleteModal(record));
    };

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const refreshTenants = async () => {
        const params = {
            page: current - 1,
            pageSize,
        };

        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (dateRange && dateRange.length === 2) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        if (genderFilter) params.gender = genderFilter;
        if (occupationFilter) params.occupation = occupationFilter;
        if (hasActiveContractFilter) {
            params.hasActiveContract = hasActiveContractFilter === 'YES';
        }

        await dispatch(fetchTenants(params)).unwrap();
    };

    const handleDelete = async () => {
        if (!modal.selected?.id) {
            throw new Error('Thiếu thông tin người thuê cần xóa.');
        }

        await dispatch(removeTenant(modal.selected.id)).unwrap();
        invalidateQuota();
        message.success('Xóa người thuê thành công');
        try {
            await refreshTenants();
        } catch (refreshError) {
            message.warning(refreshError || 'Đã xóa người thuê nhưng chưa tải lại được danh sách.');
        }
    };

    const submitDelete = async () => {
        await handleDelete();
    };

    const handleTableChange = (nextPagination) => {
        const nextCurrent = nextPagination.pageSize !== pageSize ? 1 : nextPagination.current;
        dispatch(setPagination({current: nextCurrent, pageSize: nextPagination.pageSize}));
    };

    const handleViewModeChange = (nextMode) => {
        dispatch(setViewMode(nextMode));
    };

    const getGenderTag = (gender) => {
        if (!gender) return <Tag color="default">N/A</Tag>;
        const meta = GENDER_META[gender] || {color: 'default', label: gender};
        return <Tag color={meta.color}>{meta.label}</Tag>;
    };

    return {
        items,
        loading,
        deleting,
        pagination,
        total,
        viewMode,
        modal,
        searchTerm,
        dateRange,
        genderFilter,
        occupationFilter,
        hasActiveContractFilter,
        GENDER_OPTIONS,
        OCCUPATION_OPTIONS,
        addButtonText,
        isAddDisabled,
        getGenderTag,
        handleResetFilters,
        handleAddTenant,
        handleViewTenant,
        handleEditTenant,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handleTableChange,
        handleViewModeChange,
        setSearchTerm,
        setDateRange,
        setGenderFilter,
        setOccupationFilter,
        setHasActiveContractFilter,
        tenantBasePath,
    };
};
