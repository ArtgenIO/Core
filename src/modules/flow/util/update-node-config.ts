import * as jsonSchemaInst from 'json-schema-instantiator';
import merge from 'lodash.merge';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';

/**
 * Ensures that the node has an up to date config, it's used
 * when a config changes over time, but the node is serialzed
 * with an old config, so it has to be updated to the new one with new
 * defaults or new types.
 */
export const updateNodeConfig = (
  currentValue: unknown,
  schema: ILambdaMeta['config'],
) => {
  // Lambda has some kind of config schema
  if (schema) {
    const defaultValue = jsonSchemaInst.instantiate(schema);
    let currentType = typeof currentValue;
    let defaultType = typeof defaultValue;

    // Expects an object as config
    if (defaultType == 'object') {
      // Not yet configured, so we provide an empty base
      if (!currentValue || currentType !== 'object') {
        currentValue = {};
        currentType = 'object';
      }

      // Already an object
      if (currentType == 'object') {
        currentValue = merge(defaultValue, currentValue);
      }
    } else {
      // Easy, config is non existing yet.
      if (!currentValue) {
        // Falsy but not boolean, so just a null or undefined leftover
        if (defaultType === 'boolean' && currentType !== 'boolean') {
          currentValue = defaultValue;
        } else if (defaultType !== 'boolean') {
          currentValue = defaultValue;
        }
      } else if (currentType !== defaultType) {
        throw new Error(
          `Config cannot be updated the current type [${currentType}] and the new base type [${defaultType}] is not compatible!`,
        );
      }
    }
  }

  return currentValue;
};
