/**
 * Controller decorator to define API routes
 */
export function Controller(basePath: string = ''): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('basePath', basePath, target);
    Reflect.defineMetadata('isController', true, target);
    return target;
  };
}
