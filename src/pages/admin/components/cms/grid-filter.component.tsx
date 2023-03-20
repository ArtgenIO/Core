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
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';
import { ISchema } from '../../../../models/schema.interface';
import { schemasAtom } from '../../atoms/admin.atoms';
import { toFieldFilter } from '../../library/to-field-filter';
import { toODataFilter } from '../../library/to-odata-filter';
import './grid-filter.component.less';

type Props = {
  schema: ISchema;
  setFilter: Dispatch<SetStateAction<string>>;
};

export default function GridFilterComponent({ schema, setFilter }: Props) {
  const [config, setConfig] = useState<Config>(null);
  const [tree, setTree] = useState<ImmutableTree>(null);
  const schemas = useRecoilValue(schemasAtom);

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
      const fieldConfig = toFieldFilter(f);

      if (fieldConfig) {
        config.fields[f.reference] = fieldConfig;
      }
    });

    if (schema.relations) {
      schema.relations.forEach(rel => {
        const target = schemas.find(
          r => r.database === schema.database && r.reference === rel.target,
        );

        config.fields[rel.name] = {
          type: '!struct',
          label: target.title,
          subfields: {},
        };

        target.fields.forEach(_rel_f => {
          const fieldConfig = toFieldFilter(_rel_f);

          if (fieldConfig) {
            (config.fields[rel.name] as any).subfields[_rel_f.reference] =
              fieldConfig;
          }
        });
      });
    }

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
    <>
      <Query
        {...config}
        value={tree}
        onChange={(tree, config, action) => {
          // setConfig(config);
          setTree(tree);
          const qb = new QueryBuilder();

          qb.filter(fb => {
            toODataFilter(fb, Utils.getTree(tree));
            return fb;
          });

          setFilter(qb.toQuery());
        }}
        renderBuilder={renderBuilder}
      />
    </>
  );
}
