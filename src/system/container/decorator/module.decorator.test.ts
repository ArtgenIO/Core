import { Reflector } from '@loopback/context';
import { IModuleMeta, Module, MODULE_KEY } from '.';

describe('@Module', () => {
  test('should work without configuration', () => {
    @Module()
    class testModule {}

    expect(Reflector.hasOwnMetadata(MODULE_KEY, testModule)).toBe(true);
  });

  test('should accept class constructors', () => {
    class Provider {}

    @Module({
      providers: [Provider],
    })
    class testModule {}

    const meta: IModuleMeta = Reflector.getOwnMetadata(MODULE_KEY, testModule);

    expect(typeof meta).toBe('object');
    expect(meta).toHaveProperty('providers');
    expect(meta.providers[0]).toBe(Provider);
  });
});
