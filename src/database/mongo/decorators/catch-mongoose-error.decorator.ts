import { handleMongooseError } from '../lib/handle-mongoose-error';

export function CatchMongooseError(context = 'Операція'): MethodDecorator {
  return (
    _target,
    _propertyKey,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return (await originalMethod.apply(this, args)) as unknown;
      } catch (error) {
        handleMongooseError(error, context);
        throw error;
      }
    };

    return descriptor;
  };
}
