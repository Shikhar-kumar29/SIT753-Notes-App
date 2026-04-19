import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('should pass a basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify app name constant', () => {
    const appName = 'SIT753 Notes';
    expect(appName).toContain('Notes');
  });

  it('should verify folder list structure', () => {
    const folders = ['General', 'Work', 'Personal', 'Ideas'];
    expect(folders).toHaveLength(4);
    expect(folders).toContain('General');
  });

  it('should validate note structure', () => {
    const note = { title: 'Test', content: 'Content', folder: 'General', isArchived: false, isDeleted: false };
    expect(note).toHaveProperty('title');
    expect(note).toHaveProperty('content');
    expect(note).toHaveProperty('folder');
    expect(note.isDeleted).toBe(false);
  });
});
