/**
 * Controller decorator to define API routes
 */
export function Controller(basePath: string = ''): ClassDecorator {
  return (target: any) => {
    // Store metadata as properties on the class
    target._basePath = basePath;
    target._isController = true;
    return target;
  };
}
