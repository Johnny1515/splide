import { Cast } from '../../../types';
import { isArray, isObject } from '../../type/type';
import { forOwn } from '../forOwn/forOwn';


/**
 * Merges U to T.
 *
 * @typeParam T - An object to merge U into.
 * @typeParam U - An object to merge properties from.
 *
 * @return A merged object type.
 */
export type Merge<T extends object, U extends object> = Omit<T, keyof U> & {
  [ K in ( keyof T & keyof U ) ]: U[ K ] extends object
    ? U[ K ] extends any[]
      ? T[ K ] extends any[]
        ? Array<T[ K ][ number ] | U[ K ][ number ]>
        : U[ K ]
      : T[ K ] extends object
        ? Merge<T[ K ], U[ K ]> extends infer A ? Cast<A, object> : never
        : U[ K ]
    : U[ K ];
} & Omit<U, keyof T>;

/**
 * Recursively merges source properties to the object.
 * Be aware that this method does not merge arrays. They are just duplicated by `slice()`.
 *
 * @param object - An object to merge properties to.
 * @param source - A source object to merge properties from.
 *
 * @return A new object with merged properties.
 */
export function merge<T extends object, U extends object>( object: T, source: U ): Merge<T, U> {
  forOwn( source, ( value, key ) => {
    if ( isArray( value ) ) {
      object[ key ] = value.slice();
    } else if ( isObject( value ) ) {
      object[ key ] = merge( isObject( object[ key ] ) ? object[ key ] : {}, value );
    } else {
      object[ key ] = value;
    }
  } );

  return object as Merge<T, U>;
}
