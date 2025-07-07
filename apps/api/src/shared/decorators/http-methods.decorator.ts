/**
 * HTTP method decorators
 */

function createMethodDecorator(method: string) {
  return (path: string = ''): MethodDecorator => {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      // Store routes as a property on the constructor
      if (!target.constructor._routes) {
        target.constructor._routes = [];
      }
      target.constructor._routes.push({
        method,
        path,
        handler: propertyKey
      });
      return descriptor;
    };
  };
}

export const Get = createMethodDecorator('GET');
export const Post = createMethodDecorator('POST');
export const Put = createMethodDecorator('PUT');
export const Delete = createMethodDecorator('DELETE');
export const Patch = createMethodDecorator('PATCH');
