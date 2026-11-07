import { csvCell } from './csv';
describe('CSV cells', () => {
  it('escapes quotes, separators, and line breaks', () =>
    expect(csvCell('Bread, "large"\nloaf')).toBe('"Bread, ""large""\nloaf"'));
  it('neutralizes formula prefixes, including after whitespace', () => {
    for (const text of ['=1+1', '+cmd', '-2', '@SUM(A1)', '  =1'])
      expect(csvCell(text)).toBe('"\'' + text + '"');
  });
  it('retains null and numeric values', () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(12.5)).toBe('"12.5"');
  });
});
