import { describe, it, expect } from 'vitest';
import { greetingText } from './greeting';

describe('greeting', () => {
  it('includes name', () => expect(greetingText(9, 'Ada', 'en')).toContain('Ada'));
  it('no name', () => expect(greetingText(9, '', 'en')).not.toContain(','));
});
