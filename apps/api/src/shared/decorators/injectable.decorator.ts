/**
 * Injectable decorator for dependency injection
 * For now, just returns the class as-is
 */
export function Injectable(): ClassDecorator {
  return (target: any) => {
    // For now, just return the target without metadata
    return target;
  };
}
