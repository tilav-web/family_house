import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns health payload', () => {
    const controller = new AppController();

    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
