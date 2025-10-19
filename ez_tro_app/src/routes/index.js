import HomeDashboard from '~/pages/Admin/HomeDashboard';
import Login from '../pages/General/Login';
import Register from '../pages/General/Register';
import Role from '~/pages/Admin/Role';
import Permission from '~/pages/Admin/Permission';
import RootRedirect from '~/components/RootRedirect';
import UserManagement from "~/pages/Admin/User/UserManagement";
import Building from "~/pages/Admin/Building";
import Room from "~/pages/Admin/Room";
import Tenant from "~/pages/Admin/Tenant";
import TenantDetail from "~/pages/Admin/Tenant/detail";

const publicRoutes = [
    { path: '/login', component: Login, title: 'Login' },
    { path: '/register', component: Register, title: 'Register' },
];

const privateRoutes = [
    {
        path: '/admin/dashboard',
        component: HomeDashboard,
        title: 'Dashboard',
        role: 'admin',
    },
    {
        path: '/admin/user-management',
        component: UserManagement,
        title: 'User Management',
        role: 'admin',
    },
    {
        path: '/admin/role',
        component: Role,
        title: 'Role Management',
        role: 'admin',
    },
    {
        path: '/admin/permission',
        component: Permission,
        title: 'Permission Management',
        role: 'admin',
    },
    {
        path: '/admin/buildings',
        component: Building,
        title: 'Permission Management',
        role: 'admin',
    },
    {
        path: '/admin/rooms',
        component: Room,
        title: 'Permission Management',
        role: 'admin',
    },
    {
        path: '/admin/tenants',
        component: Tenant,
        title: 'Permission Management',
        role: 'admin',
    },
    {
        path: '/admin/tenants/:id',
        component: TenantDetail,
        title: 'Tenant Detail',
        role: 'admin',
    },

    {
        path: '/',
        component: RootRedirect,
        title: 'Home'
    }
];

export { publicRoutes, privateRoutes };
