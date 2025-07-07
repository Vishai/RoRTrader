/**
 * Injectable decorator for dependency injection
 */
export function Injectable(): ClassDecorator {
  return (target: any) => {
    // Mark class as injectable
    Reflect.defineMetadata('injectable', true, target);
    return target;
  };
}
