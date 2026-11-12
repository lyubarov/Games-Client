import { describe, expect, it } from 'vitest';
import { CleanupStack } from './lifecycle';

describe('CleanupStack', () => {
  it('releases in reverse order, each cleanup once', () => {
    const order: string[] = [];
    const stack = new CleanupStack();
    stack.defer(() => {
      order.push('first');
    });
    stack.own({
      dispose: () => {
        order.push('second');
      },
    });

    stack.releaseAll();
    stack.releaseAll();

    expect(order).toEqual(['second', 'first']);
  });

  it('keeps releasing after a cleanup throws, then rethrows', () => {
    const order: string[] = [];
    const stack = new CleanupStack();
    stack.defer(() => {
      order.push('first');
    });
    stack.defer(() => {
      throw new Error('boom');
    });
    stack.defer(() => {
      order.push('third');
    });

    expect(() => {
      stack.releaseAll();
    }).toThrow('boom');
    expect(order).toEqual(['third', 'first']);
  });
});
