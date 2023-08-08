import { pluckFirst, useObservable, useSubscription } from 'observable-hooks';
import { filter, map } from 'rxjs';
import { isEqual } from 'lodash';

export function useFormSync<T>({
  originData,
  formData,
  setOriginData,
  setFormData,
}: {
  originData: T;
  formData: T;
  setOriginData: (val: T) => void;
  setFormData: (val: T) => void;
}) {
  const $syncFormToOrigin = useObservable(pluckFirst, [formData]);
  useSubscription($syncFormToOrigin, setOriginData);
  const $syncOriginToForm = useObservable(
    ($inputs) => {
      return $inputs.pipe(
        filter(([_currentData, _formData]) => {
          return !isEqual(_currentData, _formData);
        }),
        map(([_currentData]) => {
          return _currentData;
        })
      );
    },
    [originData, formData]
  );
  useSubscription($syncOriginToForm, setFormData);
}
