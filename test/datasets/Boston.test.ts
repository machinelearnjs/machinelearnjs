import { Boston } from '../../src/lib/datasets/Boston';

describe('datasets:Boston', () => {
  let boston = null;
  beforeAll(() => {
    boston = new Boston();
  });
  it('should data match the snapshot', async () => {
    const { data } = await boston.load();
    expect(data).toMatchSnapshot();
  });

  it('should targets match the snapshot', async () => {
    const { targets } = await boston.load();
    expect(targets).toMatchSnapshot();
  });

  it('should labels match the snapshot', async () => {
    const { labels } = await boston.load();
    expect(labels).toMatchSnapshot();
  });
});
