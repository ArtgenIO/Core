import { useEffect, useState } from 'react';
import {
  Builder,
  BuilderProps,
  Config,
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
};

export default function GridFilterComponent({ schema }: Props) {
  const [tree, setTree] = useState(null);
  const [config, setConfig] = useState(null);

  const InitialConfig = AntdConfig;
  const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' };

  useEffect(() => {
    const cfg: Config = {
      ...InitialConfig,
      fields: {},
    };

    cfg.settings.renderSize = 'small';

    schema.fields.forEach(f => {
      let type: string = 'text';
      let operators = ['equal', 'not_equal', 'is_empty', 'is_not_empty'];

      if (FieldTool.isNumber(f)) {
        type = 'number';
        operators.push('less', 'less_or_equal', 'greater', 'greater_or_equal');
      } else if (f.type === FieldType.DATETIME) {
        type = 'datetime';
      } else if (f.type === FieldType.DATEONLY) {
        type = 'date';
      } else if (f.type == FieldType.BOOLEAN) {
        type = 'boolean';
      } else {
        operators.push('like', 'not_like', 'starts_with', 'ends_with');
      }

      if (FieldTool.isNullable(f)) {
        operators.push('none', 'some');
      }

      cfg.fields[f.reference] = {
        label: f.title,
        type,
        operators,
        valueSources: ['value'],
      };
    });

    console.log(cfg);

    setTree(QbUtils.checkTree(QbUtils.loadTree(queryValue), cfg));
    setConfig(cfg);
  }, [schema]);

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

  return <Query {...config} value={tree} renderBuilder={renderBuilder} />;
}
