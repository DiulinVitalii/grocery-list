import { FormControl } from '@angular/forms';

import { trimmedRequired } from './trimmed-required.validator';

describe('trimmedRequired', () => {
  const validator = trimmedRequired();

  it('returns { required: true } for an empty string', () => {
    const control = new FormControl('');
    expect(validator(control)).toEqual({ required: true });
  });

  it('returns { required: true } for a whitespace-only string', () => {
    const control = new FormControl('   \t\n ');
    expect(validator(control)).toEqual({ required: true });
  });

  it('returns { required: true } for null and undefined', () => {
    expect(validator(new FormControl(null))).toEqual({ required: true });
    expect(validator(new FormControl(undefined))).toEqual({ required: true });
  });

  it('returns null for a non-empty trimmed string', () => {
    const control = new FormControl('Milk');
    expect(validator(control)).toBeNull();
  });

  it('returns null for a string with surrounding spaces but real content', () => {
    const control = new FormControl('  bread  ');
    expect(validator(control)).toBeNull();
  });
});
