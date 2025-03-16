import fakeFetch from 'jest-fetch-mock';
import { Iris } from '../../src/lib/datasets';

// Mock fetch
global.fetch = fakeFetch;

describe('datasets:Iris', () => {
  let iris = null;
  beforeAll(() => {
    iris = new Iris();
  });
  it('should data match the snapshot', async () => {
    const { data } = await iris.load();
    expect(data).toMatchSnapshot();
  });
  it('should targetNames match the snapshot', async () => {
    const { targetNames } = await iris.load();
    expect(targetNames).toMatchSnapshot();
  });
  it('should targets match the snapshot', async () => {
    const { targets } = await iris.load();
    expect(targets).toMatchSnapshot();
  });
  it('should description match the description', async () => {
    const { description } = await iris.load();
    expect(description).toMatchSnapshot();
  });
});
