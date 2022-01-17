import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Builder,
  BuilderProps,
  Config,
  ImmutableTree,
  JsonGroup,
  Query,
  Utils as QbUtils,
} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import 'react-awesome-query-builder/lib/css/compact_styles.css';
import 'react-awesome-query-builder/lib/css/styles.css';
import { FieldType, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import './grid-filter.component.less';

type Props = {
  schema: ISchema;
  filter: JsonGroup;
  setFilter: Dispatch<SetStateAction<JsonGroup>>;
};

export default function GridFilterComponent({
  schema,
  filter,
  setFilter,
}: Props) {
  const [tree, setTree] = useState<ImmutableTree>(null);
  const [config, setConfig] = useState<Config>(null);

  useEffect(() => {
    const _config: Config = {
      ...AntdConfig,
      fields: {},
    };

    _config.settings.renderSize = 'small';

    schema.fields.forEach(f => {
      let type: string = 'text';
      let operators = ['equal', 'not_equal', 'is_empty', 'is_not_empty'];

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
        operators.push('like', 'not_like', 'starts_with', 'ends_with');
      }

      if (FieldTool.isNullable(f)) {
        operators.push('none', 'some');
      }

      _config.fields[f.reference] = {
        label: f.title,
        type,
        operators,
        valueSources: ['value'],
      };
    });

    setConfig(_config);
  }, [schema]);

  useEffect(() => {
    if (config) {
      setTree(QbUtils.checkTree(QbUtils.loadTree(filter), config));
    }
  }, [config, filter]);

  const onChange = (tree: ImmutableTree, config: Config) => {
    // setTree(tree);
    setConfig(config);
    setFilter(QbUtils.getTree(tree));
  };

  const renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container grid-filter">
      <div className="query-builder">
        <Builder {...props} />
      </div>
    </div>
  );

  if (!tree) {
    return <>Loading...</>;
  }

  return (
    <Query
      {...config}
      onChange={(tree, config, action) => {
        onChange(tree, config);
      }}
      value={tree}
      renderBuilder={renderBuilder}
    />
  );
}
