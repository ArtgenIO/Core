import { QueryBuilder } from 'odata-query-builder';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Builder,
  BuilderProps,
  Config,
  ImmutableTree,
  Query,
  Utils,
} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import 'react-awesome-query-builder/lib/css/compact_styles.css';
import 'react-awesome-query-builder/lib/css/styles.css';
import { v4 } from 'uuid';
import { FieldType, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import { toODataFilter } from '../util/to-odata-filter';
import './grid-filter.component.less';

type Props = {
  schema: ISchema;
  setFilter: Dispatch<SetStateAction<string>>;
};

export default function GridFilterComponent({ schema, setFilter }: Props) {
  const [config, setConfig] = useState<Config>(null);
  const [tree, setTree] = useState<ImmutableTree>(null);

  // Reset state on unload
  useEffect(() => {
    return () => {
      setConfig(null);
      setTree(null);
    };
  }, []);

  useEffect(() => {
    const config: Config = {
      ...AntdConfig,
      fields: {},
    };

    config.settings.renderSize = 'small';

    schema.fields.forEach(f => {
      let type: string = 'text';
      let operators = ['equal', 'not_equal'];

      if (FieldTool.isNumber(f)) {
        type = 'number';
        operators.push('less', 'less_or_equal', 'greater', 'greater_or_equal');
      } else if (f.type === FieldType.DATETIME) {
        type = 'datetime';
        operators.push('less', 'less_or_equal', 'greater', 'greater_or_equal');
      } else if (f.type === FieldType.DATEONLY) {
        type = 'date';
        operators.push('less', 'less_or_equal', 'greater', 'greater_or_equal');
      } else if (f.type == FieldType.BOOLEAN) {
        type = 'boolean';
      } else {
        operators.push(
          'like',
          'not_like',
          'starts_with',
          'ends_with',
          'is_empty',
          'is_not_empty',
        );
      }

      if (FieldTool.isNullable(f)) {
        operators.push('none', 'some');
      }

      config.fields[f.reference] = {
        label: f.title,
        type,
        operators,
        valueSources: ['value'],
      };
    });

    setConfig(config);
    setTree(
      Utils.checkTree(
        Utils.loadTree({
          id: v4(),
          type: 'group',
          children1: {
            [v4()]: {
              type: 'rule',
              properties: {
                field: null,
                operator: null,
                value: [],
                valueSrc: [],
              },
            },
          },
        }),
        config,
      ),
    );
  }, [schema]);

  const renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container grid-filter">
      <div className="query-builder">
        <Builder {...props} />
      </div>
    </div>
  );

  if (!tree || !config || !Utils.isValidTree(tree)) {
    return <>Loading...</>;
  }

  return (
    <Query
      {...config}
      value={tree}
      onChange={(tree, config, action) => {
        // setConfig(config);
        setTree(tree);
        console.log(Utils.getTree(tree));
        const qb = new QueryBuilder();

        qb.filter(fb => {
          toODataFilter(fb, Utils.getTree(tree));
          return fb;
        });

        setFilter(qb.toQuery());
      }}
      renderBuilder={renderBuilder}
    />
  );
}
