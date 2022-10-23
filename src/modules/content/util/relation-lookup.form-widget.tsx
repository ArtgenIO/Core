import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useHttpClientSimple } from '../../admin/library/simple.http-client';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { ISchema } from '../../schema/interface/schema.interface';
import { FieldTool } from '../../schema/util/field-tools';
import { toRestRoute } from './schema-url';

export const createCustomRelationLookupFormWidget = (
  relationName: string,
  localSchema: ISchema,
  remoteSchema: ISchema,
) => {
  return props => {
    console.log('Calling with props', relationName, props);

    const httpClient = useHttpClientSimple();
    const [options, setOptions] = useState<{ label: string; value: string }[]>(
      [],
    );

    useEffect(() => {
      handleSearch(props.value);
    }, []);

    const handleSearch = (value: string) => {
      // Value key is the remote ID
      const valueKey = remoteSchema.fields.find(FieldTool.isPrimary).reference;

      let labelKey: string = valueKey;

      const localField = localSchema.fields.find(
        f =>
          f.reference ==
          localSchema.relations.find(r => r.name === relationName).localField,
      );

      // Next try to find the relation's alternative view for label.
      if (localField?.meta?.grid?.replace) {
        labelKey = localField.meta.grid.replace;
      }
      httpClient
        .get<IFindResponse>(
          toRestRoute(remoteSchema, qb =>
            qb
              .select(
                Array.from(new Set([labelKey, valueKey]).values()).join(','),
              )
              .top(1000),
          ),
        )
        .then(reply => {
          const newOptions: typeof options = [];

          for (const record of reply.data.data) {
            newOptions.push({
              label: record[labelKey],
              value: record[valueKey],
            });
          }

          setOptions(newOptions);
        });
    };

    console.log('Set auto complete to ---->', props.value);

    return (
      <Select
        options={options}
        value={
          options.length
            ? options.find(o => o.value == props.value)
            : props.value
        }
        onChange={nv => {
          props.onChange(nv.value);
        }}
        placeholder={props.placeholder}
        className="react-select-container"
        classNamePrefix="react-select"
      ></Select>
    );
  };
};
