import {
  AppstoreAddOutlined,
  GithubFilled,
  MediumOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Button, Input, notification, Tabs } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { IDashGridElement } from '../../../types/dash-grid.interface';
import { dashboardsAtom, lastViewedDashAtom } from '../../atoms/dashboard.atom';
import PageHeader from '../../layout/page-header.component';
import PageWithHeader from '../../layout/page-with-header.component';
import WidgetWrapperComponent from '../../widgets/widget.wrapper';
import './dashboard.component.less';
import WidgetDrawerComponent from './widget-drawer.component';

export default function DashboardPage() {
  const [dashboards, setDashboards] = useRecoilState(dashboardsAtom);
  const [active, setActive] = useRecoilState(lastViewedDashAtom);

  // Selected dashboard
  const [openWidgetCollection, setOpenWidgetCollection] = useState(false);
  const [widgets, setWidgets] = useState<IDashGridElement[]>([]);
  const [dashboardName, setDashboardName] = useState('Dashboards');

  useEffect(() => {
    if (dashboards.length) {
      if (!active) {
        setActive(dashboards[0].id);
      }
    }
  }, [dashboards]);

  useEffect(() => {
    if (active) {
      const dashboard = dashboards.find(d => d.id === active);

      if (dashboard) {
        setDashboardName(dashboard.name);
        setWidgets(dashboard.widgets);
      } else {
        if (dashboards.length) {
          setActive(dashboards[0].id);
        }
      }
    }
  }, [active, dashboards]);

  const onLayoutChange = (currentGridState: IDashGridElement[]) => {
    if (currentGridState) {
      setDashboards(oldState => {
        const newState = cloneDeep(oldState);
        const activeDashboard = newState.find(d => d.id === active);

        activeDashboard.widgets.forEach(widget => {
          const el = currentGridState.find(e => e.i === widget.i);
          widget.w = el.w;
          widget.h = el.h;
          widget.x = el.x;
          widget.y = el.y;
        });

        return newState;
      });
    }
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={
            <Input
              value={dashboardName}
              bordered={false}
              size="large"
              className="text-4xl leading-3 my-0 p-0 test--dashboard-title"
              onChange={e => setDashboardName(e.target.value)}
              onBlur={e =>
                setDashboards(oldState => {
                  const newState = cloneDeep(oldState);
                  const activeDashboard = newState.find(d => d.id === active);
                  activeDashboard.name = e.target.value;

                  return newState;
                })
              }
            />
          }
          actions={
            <>
              <a
                key="github"
                href="https://github.com/ArtgenIO/Core"
                target="_blank"
              >
                <Button icon={<GithubFilled />}>Star it on Github ❤️</Button>
              </a>
              <a key="blog" href="https://blog.artgen.io/" target="_blank">
                <Button icon={<MediumOutlined />}>Read more in our blog</Button>
              </a>
              <a key="site" href="https://artgen.io/" target="_blank">
                <Button icon={<SmileOutlined />}>Check Out Our Website</Button>
              </a>
            </>
          }
          footer={
            <Tabs
              activeKey={active}
              type="editable-card"
              className="test--dashboard-tabs"
              size="small"
              style={{
                borderBottom: '1px solid #37393f',
              }}
              tabBarGutter={1}
              destroyInactiveTabPane
              tabBarExtraContent={{
                right: (
                  <Button
                    size="large"
                    className="ml-1 border-b-0"
                    icon={<AppstoreAddOutlined />}
                    onClick={() => setOpenWidgetCollection(true)}
                  >
                    Add Widgets
                  </Button>
                ),
              }}
              onEdit={(e, action) => {
                if (action === 'add') {
                  const newId = v4();

                  setDashboards(oldState => {
                    const newState = cloneDeep(oldState);
                    let highestOrder = 0;

                    oldState.forEach(dash => {
                      if (dash.order > highestOrder) {
                        highestOrder = dash.order + 1;
                      }
                    });

                    const newDash = {
                      id: newId,
                      name: `New Dashboard ${oldState.length + 1}`,
                      order: highestOrder + 1,
                      widgets: [],
                    };

                    newState.push(newDash);

                    return newState;
                  });

                  setTimeout(() => setActive(newId), 50);
                } else {
                  if (dashboards.length === 1) {
                    notification.error({
                      message: 'You have to have at least one dashboard!',
                    });
                  } else {
                    setDashboards(oldState => {
                      const newState = cloneDeep(oldState).filter(
                        dash => dash.id !== e,
                      );

                      return newState;
                    });
                  }
                }
              }}
              onChange={selectedId => {
                setActive(selectedId);
              }}
              items={dashboards.map(dash => ({
                id: dash.id,
                key: dash.id,
                tab: dash.name,
                label: dash.name,
                closable: dashboards.length > 1,
              }))}
            />
          }
        />
      }
    >
      {active && (
        <GridLayout
          width={window.innerWidth - 88}
          cols={14}
          className="text-center -ml-3"
          layout={widgets}
          rowHeight={60}
          onLayoutChange={onLayoutChange}
        >
          {widgets.map(gridElement => (
            <div key={gridElement.i}>
              <WidgetWrapperComponent
                dashboardId={active}
                gridElement={gridElement}
                onDelete={() => {
                  setDashboards(oldState => {
                    const newState = cloneDeep(oldState);
                    const activeRef = newState.find(dash => dash.id === active);
                    activeRef.widgets = activeRef.widgets.filter(
                      w => w.i !== gridElement.i,
                    );

                    return newState;
                  });
                }}
                onChange={newWidgetData => {
                  setDashboards(oldState => {
                    const newState = cloneDeep(oldState);
                    const refDashboard = newState.find(d => d.id === active);
                    const refWidget = refDashboard.widgets.find(
                      w => w.i == gridElement.i,
                    );

                    refWidget.widget = newWidgetData;

                    return newState;
                  });
                }}
              />
            </div>
          ))}
        </GridLayout>
      )}
      {openWidgetCollection && (
        <WidgetDrawerComponent
          onClose={() => setOpenWidgetCollection(false)}
          onAdd={(widget: IDashGridElement) => {
            setDashboards(oldState => {
              const newState = cloneDeep(oldState);
              const activeDashboard = newState.find(dash => dash.id === active);

              activeDashboard.widgets.push(
                Object.assign(cloneDeep(widget), {
                  x: 0,
                  y: 0,
                  i: v4(), // Dashboard ID
                } as Pick<IDashGridElement, 'x' | 'y' | 'i'>),
              );

              return newState;
            });
          }}
        />
      )}
    </PageWithHeader>
  );
}
