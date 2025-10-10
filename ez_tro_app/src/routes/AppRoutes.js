import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '~/components/Layout/DashboardLayout';
import { publicRoutes, privateRoutes } from './index';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {publicRoutes.map(({ path, component: Page }, index) => (
                <Route key={index} path={path} element={<Page />} />
            ))}

            {privateRoutes.map(({ path, component: Page, role, title }, index) => (
                <Route
                    key={index}
                    path={path}
                    element={
                        <PrivateRoute
                            role={role}
                            title={title}
                            element={
                                <DashboardLayout>
                                    <Page />
                                </DashboardLayout>
                            }
                        />
                    }
                />
            ))}
        </Routes>
    );
};

export default AppRoutes;
