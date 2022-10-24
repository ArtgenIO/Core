import { JSXElementConstructor, lazy, LazyExoticComponent } from 'react';
import { IBaseWidgetProps } from '../../types/base-widget.type.js';

type IWidgetRef = {
  element: LazyExoticComponent<JSXElementConstructor<IBaseWidgetProps>>;
  defaults: {
    dimensions: {
      w: number;
      h: number;
      minW: number;
      minH: number;
    };
    header: string;
    config: {};
  };
};

export const WidgetMap = new Map<string, IWidgetRef>();

WidgetMap.set('telemetry.uptime', {
  element: lazy(() => import('../../../telemetry/component/uptime.widget')),
  defaults: {
    dimensions: {
      w: 3,
      h: 3,
      minW: 3,
      minH: 3,
    },
    header: 'Telemetry - Uptime',
    config: {},
  },
});

WidgetMap.set('telemetry.serie', {
  element: lazy(() => import('../../../telemetry/component/serie.widget')),
  defaults: {
    dimensions: {
      w: 7,
      h: 4,
      minW: 4,
      minH: 2,
    },
    header: 'Telemetry - Serie',
    config: {
      legend: 'Serie Label',
      serie: null,
      color: '#ccff00',
      refresh: 10,
    },
  },
});

WidgetMap.set('note', {
  element: lazy(() => import('../../../content/component/widget/note.widget')),
  defaults: {
    dimensions: {
      w: 3,
      h: 2,
      minW: 3,
      minH: 2,
    },
    header: 'Content - Note',
    config: {
      content: 'Example note, you can edit this in the widget config',
    },
  },
});
