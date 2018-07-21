import { Iris } from '../../src/lib/datasets';

describe('datasets:Iris', () => {
  let iris = null;
  beforeAll(() => {
    iris = new Iris();
    iris.load();
  });
  it('should data match the snapshot', () => {
    expect(iris.data).toMatchSnapshot();
  });
  it('should targetNames match the snapshot', () => {
    expect(iris.targetNames).toMatchSnapshot();
  });
  it('should targets match the snapshot', () => {
    expect(iris.targets).toMatchSnapshot();
  });
  it('should description match the description', () => {
    expect(iris.description).toMatchSnapshot();
  });
});
