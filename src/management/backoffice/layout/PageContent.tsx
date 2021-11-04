import { animated, useTransition } from '@react-spring/web';
import { Layout } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { animatedLoadingAtom } from '../backoffice.atoms';
import DashboardPage from '../component/dashboard.component';
import Route404 from '../route/404.route';
import PageLoading from './PageLoading';
import PageWrapper from './PageWrapper';

const { Content } = Layout;

export default function PageContent() {
  const location = useLocation();
  const animateLoading = useRecoilValue(animatedLoadingAtom);

  const transitions = useTransition(location, {
    from: { x: 500, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    config: {
      duration: 266,
    },
    immediate: !animateLoading,
  });

  return (
    <Content className="overflow-y-auto overflow-x-hidden h-screen scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-400 wave-bg scrollbar-w-2">
      <PageWrapper>
        <Suspense fallback={<PageLoading />}>
          {transitions((props, item) => (
            <animated.div style={props}>
              <Switch location={item}>
                <Route
                  exact
                  path="/backoffice(/index.html)?"
                  component={DashboardPage}
                />
                <Route
                  path="/backoffice/management/workflow"
                  component={lazy(
                    () => import('../../workflow/components/index.component'),
                  )}
                />
                <Route
                  path="/backoffice/content/schema"
                  component={lazy(
                    () =>
                      import(
                        '../../../content/schema/component/index.component'
                      ),
                  )}
                />
                <Route
                  path="/backoffice/content/crud"
                  component={lazy(
                    () =>
                      import('../../../content/crud/component/index.component'),
                  )}
                />

                {/* Hygen insert routes above */}
                <Route path="*" component={Route404} />
              </Switch>
            </animated.div>
          ))}
        </Suspense>
      </PageWrapper>
    </Content>
  );
}
