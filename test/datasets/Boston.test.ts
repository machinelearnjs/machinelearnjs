import { Boston } from "../../src/lib/datasets/Boston";

describe('datasets:Boston', () => {
  let boston = null;
  beforeAll(() => {
    boston = new Boston();
  });
  it('should data match the snapshot', async () => {
    const { data } = await boston.load();
    expect(data).toMatchSnapshot();
  });
});
