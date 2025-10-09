import { renameViewList, deleteViewFromList, decideShortcutAction } from './customerViews';

describe('customerViews utils', () => {
  test('renameViewList renames and prevents duplicates', () => {
    const views = [{ name: 'A' }, { name: 'B' }];
    const res1 = renameViewList(views, 'A', 'A');
    expect(res1.changed).toBe(false);
    const res2 = renameViewList(views, 'A', 'B');
    expect(res2.changed).toBe(false);
    expect(res2.error).toBe('duplicate');
    const res3 = renameViewList(views, 'A', 'C');
    expect(res3.changed).toBe(true);
    expect(res3.list.find(v=>v.name==='C')).toBeTruthy();
  });

  test('deleteViewFromList removes item by name', () => {
    const views = [{ name: 'A' }, { name: 'B' }];
    const res = deleteViewFromList(views, 'A');
    expect(res.removed).toBe(true);
    expect(res.list.map(v=>v.name)).toEqual(['B']);
  });

  test('decideShortcutAction', () => {
    expect(decideShortcutAction({ key: 'S', shiftKey: true })).toBe('quickSave');
    expect(decideShortcutAction({ key: 'v', shiftKey: true })).toBe('openManageViews');
    expect(decideShortcutAction({ key: 'V', altKey: true })).toBe('focusSavedViewsDropdown');
    expect(decideShortcutAction({ key: ',' })).toBe('prevPage');
    expect(decideShortcutAction({ key: '.' })).toBe('nextPage');
    expect(decideShortcutAction({ key: 'x' })).toBe(null);
  });
});

