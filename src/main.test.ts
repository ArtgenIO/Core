import { IModule, Module } from '@hisorange/kernel';
import { jest } from '@jest/globals';
import { main } from './main';

describe('Main', () => {
  afterAll(() => {
    // Main has the side effect of registering listeners;
    // So, we have to delete them otherwise it will stop the kernel and call an exit
    process.removeAllListeners('SIGTERM').removeAllListeners('SIGINT');
  });

  test('should boostrap without modules', async () => {
    expect(async () => await (await main([])).stop()).not.toThrow();
  });

  test('should boostrap given modules', async () => {
    const onStartMock = jest.fn(() => Promise.resolve(null));

    @Module()
    class TestModule implements IModule {
      async onBoot() {}
    }

    TestModule.prototype.onBoot = onStartMock;

    try {
      await (await main([TestModule])).stop();
    } catch (error) {}

    expect(onStartMock).toHaveBeenCalled();
  });

  test('should register SIG handlers', async () => {
    const sigIntListeners = process.listenerCount('SIGINT');
    const sigTermListeners = process.listenerCount('SIGTERM');

    try {
      (await main([])).stop();
    } catch (error) {}

    expect(process.listenerCount('SIGINT')).toBe(sigIntListeners + 1);
    expect(process.listenerCount('SIGTERM')).toBe(sigTermListeners + 1);
  });
});
