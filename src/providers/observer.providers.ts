import { BlueprintObserver } from '../observers/blueprint.observer';
import { FlowObserver } from '../observers/flow.observer';
import { HttpObserver } from '../observers/http.observer';

export const ObserverProviders = [
  HttpObserver,
  BlueprintObserver,
  FlowObserver,
];
