import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import AccountSidebar from '@/components/dashboard/AccountSidebar';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import styled from 'styled-components/macro';

const AccountLayout = styled.div`
    display: flex;
    min-height: calc(100vh - 3.5rem);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const AccountContent = styled.div`
    flex: 1;
    min-width: 0;
`;

export default () => {
    const location = useLocation();
    const isAccountPage = location.pathname.startsWith('/account');

    return (
        <>
            <NavigationBar />
            {isAccountPage ? (
                <AccountLayout>
                    <AccountSidebar />
                    <AccountContent>
                        <TransitionRouter>
                            <React.Suspense fallback={<Spinner centered />}>
                                <Switch location={location}>
                                    {routes.account.map(({ path, component: Component }) => (
                                        <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                            <Component />
                                        </Route>
                                    ))}
                                    <Route path={'*'}>
                                        <NotFound />
                                    </Route>
                                </Switch>
                            </React.Suspense>
                        </TransitionRouter>
                    </AccountContent>
                </AccountLayout>
            ) : (
                <TransitionRouter>
                    <React.Suspense fallback={<Spinner centered />}>
                        <Switch location={location}>
                            <Route path={'/'} exact>
                                <DashboardContainer />
                            </Route>
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </React.Suspense>
                </TransitionRouter>
            )}
        </>
    );
};
