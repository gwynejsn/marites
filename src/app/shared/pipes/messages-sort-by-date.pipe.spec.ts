import { MessagesSortByDatePipe } from './messages-sort-by-date.pipe';

describe('MessagesSortByDatePipe', () => {
  it('create an instance', () => {
    const pipe = new MessagesSortByDatePipe();
    expect(pipe).toBeTruthy();
  });
});
