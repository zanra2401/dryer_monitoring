
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model SystemFlag
 * 
 */
export type SystemFlag = $Result.DefaultSelection<Prisma.$SystemFlagPayload>
/**
 * Model JobTracker
 * 
 */
export type JobTracker = $Result.DefaultSelection<Prisma.$JobTrackerPayload>
/**
 * Model MustExecutedJob
 * 
 */
export type MustExecutedJob = $Result.DefaultSelection<Prisma.$MustExecutedJobPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const FlagType: {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN'
};

export type FlagType = (typeof FlagType)[keyof typeof FlagType]


export const StatusJob: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export type StatusJob = (typeof StatusJob)[keyof typeof StatusJob]

}

export type FlagType = $Enums.FlagType

export const FlagType: typeof $Enums.FlagType

export type StatusJob = $Enums.StatusJob

export const StatusJob: typeof $Enums.StatusJob

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more SystemFlags
 * const systemFlags = await prisma.systemFlag.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more SystemFlags
   * const systemFlags = await prisma.systemFlag.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.systemFlag`: Exposes CRUD operations for the **SystemFlag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemFlags
    * const systemFlags = await prisma.systemFlag.findMany()
    * ```
    */
  get systemFlag(): Prisma.SystemFlagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.jobTracker`: Exposes CRUD operations for the **JobTracker** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobTrackers
    * const jobTrackers = await prisma.jobTracker.findMany()
    * ```
    */
  get jobTracker(): Prisma.JobTrackerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mustExecutedJob`: Exposes CRUD operations for the **MustExecutedJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MustExecutedJobs
    * const mustExecutedJobs = await prisma.mustExecutedJob.findMany()
    * ```
    */
  get mustExecutedJob(): Prisma.MustExecutedJobDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    SystemFlag: 'SystemFlag',
    JobTracker: 'JobTracker',
    MustExecutedJob: 'MustExecutedJob'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "systemFlag" | "jobTracker" | "mustExecutedJob"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SystemFlag: {
        payload: Prisma.$SystemFlagPayload<ExtArgs>
        fields: Prisma.SystemFlagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemFlagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemFlagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          findFirst: {
            args: Prisma.SystemFlagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemFlagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          findMany: {
            args: Prisma.SystemFlagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>[]
          }
          create: {
            args: Prisma.SystemFlagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          createMany: {
            args: Prisma.SystemFlagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemFlagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>[]
          }
          delete: {
            args: Prisma.SystemFlagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          update: {
            args: Prisma.SystemFlagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          deleteMany: {
            args: Prisma.SystemFlagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemFlagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SystemFlagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>[]
          }
          upsert: {
            args: Prisma.SystemFlagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemFlagPayload>
          }
          aggregate: {
            args: Prisma.SystemFlagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemFlag>
          }
          groupBy: {
            args: Prisma.SystemFlagGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemFlagGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemFlagCountArgs<ExtArgs>
            result: $Utils.Optional<SystemFlagCountAggregateOutputType> | number
          }
        }
      }
      JobTracker: {
        payload: Prisma.$JobTrackerPayload<ExtArgs>
        fields: Prisma.JobTrackerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobTrackerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobTrackerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          findFirst: {
            args: Prisma.JobTrackerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobTrackerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          findMany: {
            args: Prisma.JobTrackerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>[]
          }
          create: {
            args: Prisma.JobTrackerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          createMany: {
            args: Prisma.JobTrackerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobTrackerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>[]
          }
          delete: {
            args: Prisma.JobTrackerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          update: {
            args: Prisma.JobTrackerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          deleteMany: {
            args: Prisma.JobTrackerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobTrackerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JobTrackerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>[]
          }
          upsert: {
            args: Prisma.JobTrackerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobTrackerPayload>
          }
          aggregate: {
            args: Prisma.JobTrackerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobTracker>
          }
          groupBy: {
            args: Prisma.JobTrackerGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobTrackerGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobTrackerCountArgs<ExtArgs>
            result: $Utils.Optional<JobTrackerCountAggregateOutputType> | number
          }
        }
      }
      MustExecutedJob: {
        payload: Prisma.$MustExecutedJobPayload<ExtArgs>
        fields: Prisma.MustExecutedJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MustExecutedJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MustExecutedJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          findFirst: {
            args: Prisma.MustExecutedJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MustExecutedJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          findMany: {
            args: Prisma.MustExecutedJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>[]
          }
          create: {
            args: Prisma.MustExecutedJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          createMany: {
            args: Prisma.MustExecutedJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MustExecutedJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>[]
          }
          delete: {
            args: Prisma.MustExecutedJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          update: {
            args: Prisma.MustExecutedJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          deleteMany: {
            args: Prisma.MustExecutedJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MustExecutedJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MustExecutedJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>[]
          }
          upsert: {
            args: Prisma.MustExecutedJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MustExecutedJobPayload>
          }
          aggregate: {
            args: Prisma.MustExecutedJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMustExecutedJob>
          }
          groupBy: {
            args: Prisma.MustExecutedJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<MustExecutedJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.MustExecutedJobCountArgs<ExtArgs>
            result: $Utils.Optional<MustExecutedJobCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    systemFlag?: SystemFlagOmit
    jobTracker?: JobTrackerOmit
    mustExecutedJob?: MustExecutedJobOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model SystemFlag
   */

  export type AggregateSystemFlag = {
    _count: SystemFlagCountAggregateOutputType | null
    _min: SystemFlagMinAggregateOutputType | null
    _max: SystemFlagMaxAggregateOutputType | null
  }

  export type SystemFlagMinAggregateOutputType = {
    key: string | null
    value: string | null
    type: $Enums.FlagType | null
  }

  export type SystemFlagMaxAggregateOutputType = {
    key: string | null
    value: string | null
    type: $Enums.FlagType | null
  }

  export type SystemFlagCountAggregateOutputType = {
    key: number
    value: number
    type: number
    _all: number
  }


  export type SystemFlagMinAggregateInputType = {
    key?: true
    value?: true
    type?: true
  }

  export type SystemFlagMaxAggregateInputType = {
    key?: true
    value?: true
    type?: true
  }

  export type SystemFlagCountAggregateInputType = {
    key?: true
    value?: true
    type?: true
    _all?: true
  }

  export type SystemFlagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemFlag to aggregate.
     */
    where?: SystemFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemFlags to fetch.
     */
    orderBy?: SystemFlagOrderByWithRelationInput | SystemFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemFlags
    **/
    _count?: true | SystemFlagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemFlagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemFlagMaxAggregateInputType
  }

  export type GetSystemFlagAggregateType<T extends SystemFlagAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemFlag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemFlag[P]>
      : GetScalarType<T[P], AggregateSystemFlag[P]>
  }




  export type SystemFlagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemFlagWhereInput
    orderBy?: SystemFlagOrderByWithAggregationInput | SystemFlagOrderByWithAggregationInput[]
    by: SystemFlagScalarFieldEnum[] | SystemFlagScalarFieldEnum
    having?: SystemFlagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemFlagCountAggregateInputType | true
    _min?: SystemFlagMinAggregateInputType
    _max?: SystemFlagMaxAggregateInputType
  }

  export type SystemFlagGroupByOutputType = {
    key: string
    value: string
    type: $Enums.FlagType
    _count: SystemFlagCountAggregateOutputType | null
    _min: SystemFlagMinAggregateOutputType | null
    _max: SystemFlagMaxAggregateOutputType | null
  }

  type GetSystemFlagGroupByPayload<T extends SystemFlagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemFlagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemFlagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemFlagGroupByOutputType[P]>
            : GetScalarType<T[P], SystemFlagGroupByOutputType[P]>
        }
      >
    >


  export type SystemFlagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    type?: boolean
  }, ExtArgs["result"]["systemFlag"]>

  export type SystemFlagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    type?: boolean
  }, ExtArgs["result"]["systemFlag"]>

  export type SystemFlagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    type?: boolean
  }, ExtArgs["result"]["systemFlag"]>

  export type SystemFlagSelectScalar = {
    key?: boolean
    value?: boolean
    type?: boolean
  }

  export type SystemFlagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"key" | "value" | "type", ExtArgs["result"]["systemFlag"]>

  export type $SystemFlagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemFlag"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
      type: $Enums.FlagType
    }, ExtArgs["result"]["systemFlag"]>
    composites: {}
  }

  type SystemFlagGetPayload<S extends boolean | null | undefined | SystemFlagDefaultArgs> = $Result.GetResult<Prisma.$SystemFlagPayload, S>

  type SystemFlagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SystemFlagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SystemFlagCountAggregateInputType | true
    }

  export interface SystemFlagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemFlag'], meta: { name: 'SystemFlag' } }
    /**
     * Find zero or one SystemFlag that matches the filter.
     * @param {SystemFlagFindUniqueArgs} args - Arguments to find a SystemFlag
     * @example
     * // Get one SystemFlag
     * const systemFlag = await prisma.systemFlag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemFlagFindUniqueArgs>(args: SelectSubset<T, SystemFlagFindUniqueArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SystemFlag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemFlagFindUniqueOrThrowArgs} args - Arguments to find a SystemFlag
     * @example
     * // Get one SystemFlag
     * const systemFlag = await prisma.systemFlag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemFlagFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemFlagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemFlag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagFindFirstArgs} args - Arguments to find a SystemFlag
     * @example
     * // Get one SystemFlag
     * const systemFlag = await prisma.systemFlag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemFlagFindFirstArgs>(args?: SelectSubset<T, SystemFlagFindFirstArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemFlag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagFindFirstOrThrowArgs} args - Arguments to find a SystemFlag
     * @example
     * // Get one SystemFlag
     * const systemFlag = await prisma.systemFlag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemFlagFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemFlagFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemFlags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemFlags
     * const systemFlags = await prisma.systemFlag.findMany()
     * 
     * // Get first 10 SystemFlags
     * const systemFlags = await prisma.systemFlag.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const systemFlagWithKeyOnly = await prisma.systemFlag.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends SystemFlagFindManyArgs>(args?: SelectSubset<T, SystemFlagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SystemFlag.
     * @param {SystemFlagCreateArgs} args - Arguments to create a SystemFlag.
     * @example
     * // Create one SystemFlag
     * const SystemFlag = await prisma.systemFlag.create({
     *   data: {
     *     // ... data to create a SystemFlag
     *   }
     * })
     * 
     */
    create<T extends SystemFlagCreateArgs>(args: SelectSubset<T, SystemFlagCreateArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SystemFlags.
     * @param {SystemFlagCreateManyArgs} args - Arguments to create many SystemFlags.
     * @example
     * // Create many SystemFlags
     * const systemFlag = await prisma.systemFlag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemFlagCreateManyArgs>(args?: SelectSubset<T, SystemFlagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemFlags and returns the data saved in the database.
     * @param {SystemFlagCreateManyAndReturnArgs} args - Arguments to create many SystemFlags.
     * @example
     * // Create many SystemFlags
     * const systemFlag = await prisma.systemFlag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemFlags and only return the `key`
     * const systemFlagWithKeyOnly = await prisma.systemFlag.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemFlagCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemFlagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SystemFlag.
     * @param {SystemFlagDeleteArgs} args - Arguments to delete one SystemFlag.
     * @example
     * // Delete one SystemFlag
     * const SystemFlag = await prisma.systemFlag.delete({
     *   where: {
     *     // ... filter to delete one SystemFlag
     *   }
     * })
     * 
     */
    delete<T extends SystemFlagDeleteArgs>(args: SelectSubset<T, SystemFlagDeleteArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SystemFlag.
     * @param {SystemFlagUpdateArgs} args - Arguments to update one SystemFlag.
     * @example
     * // Update one SystemFlag
     * const systemFlag = await prisma.systemFlag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemFlagUpdateArgs>(args: SelectSubset<T, SystemFlagUpdateArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SystemFlags.
     * @param {SystemFlagDeleteManyArgs} args - Arguments to filter SystemFlags to delete.
     * @example
     * // Delete a few SystemFlags
     * const { count } = await prisma.systemFlag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemFlagDeleteManyArgs>(args?: SelectSubset<T, SystemFlagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemFlags
     * const systemFlag = await prisma.systemFlag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemFlagUpdateManyArgs>(args: SelectSubset<T, SystemFlagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemFlags and returns the data updated in the database.
     * @param {SystemFlagUpdateManyAndReturnArgs} args - Arguments to update many SystemFlags.
     * @example
     * // Update many SystemFlags
     * const systemFlag = await prisma.systemFlag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SystemFlags and only return the `key`
     * const systemFlagWithKeyOnly = await prisma.systemFlag.updateManyAndReturn({
     *   select: { key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SystemFlagUpdateManyAndReturnArgs>(args: SelectSubset<T, SystemFlagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SystemFlag.
     * @param {SystemFlagUpsertArgs} args - Arguments to update or create a SystemFlag.
     * @example
     * // Update or create a SystemFlag
     * const systemFlag = await prisma.systemFlag.upsert({
     *   create: {
     *     // ... data to create a SystemFlag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemFlag we want to update
     *   }
     * })
     */
    upsert<T extends SystemFlagUpsertArgs>(args: SelectSubset<T, SystemFlagUpsertArgs<ExtArgs>>): Prisma__SystemFlagClient<$Result.GetResult<Prisma.$SystemFlagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SystemFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagCountArgs} args - Arguments to filter SystemFlags to count.
     * @example
     * // Count the number of SystemFlags
     * const count = await prisma.systemFlag.count({
     *   where: {
     *     // ... the filter for the SystemFlags we want to count
     *   }
     * })
    **/
    count<T extends SystemFlagCountArgs>(
      args?: Subset<T, SystemFlagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemFlagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemFlagAggregateArgs>(args: Subset<T, SystemFlagAggregateArgs>): Prisma.PrismaPromise<GetSystemFlagAggregateType<T>>

    /**
     * Group by SystemFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemFlagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemFlagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemFlagGroupByArgs['orderBy'] }
        : { orderBy?: SystemFlagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemFlagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemFlagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemFlag model
   */
  readonly fields: SystemFlagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemFlag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemFlagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemFlag model
   */
  interface SystemFlagFieldRefs {
    readonly key: FieldRef<"SystemFlag", 'String'>
    readonly value: FieldRef<"SystemFlag", 'String'>
    readonly type: FieldRef<"SystemFlag", 'FlagType'>
  }
    

  // Custom InputTypes
  /**
   * SystemFlag findUnique
   */
  export type SystemFlagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter, which SystemFlag to fetch.
     */
    where: SystemFlagWhereUniqueInput
  }

  /**
   * SystemFlag findUniqueOrThrow
   */
  export type SystemFlagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter, which SystemFlag to fetch.
     */
    where: SystemFlagWhereUniqueInput
  }

  /**
   * SystemFlag findFirst
   */
  export type SystemFlagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter, which SystemFlag to fetch.
     */
    where?: SystemFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemFlags to fetch.
     */
    orderBy?: SystemFlagOrderByWithRelationInput | SystemFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemFlags.
     */
    cursor?: SystemFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemFlags.
     */
    distinct?: SystemFlagScalarFieldEnum | SystemFlagScalarFieldEnum[]
  }

  /**
   * SystemFlag findFirstOrThrow
   */
  export type SystemFlagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter, which SystemFlag to fetch.
     */
    where?: SystemFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemFlags to fetch.
     */
    orderBy?: SystemFlagOrderByWithRelationInput | SystemFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemFlags.
     */
    cursor?: SystemFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemFlags.
     */
    distinct?: SystemFlagScalarFieldEnum | SystemFlagScalarFieldEnum[]
  }

  /**
   * SystemFlag findMany
   */
  export type SystemFlagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter, which SystemFlags to fetch.
     */
    where?: SystemFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemFlags to fetch.
     */
    orderBy?: SystemFlagOrderByWithRelationInput | SystemFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemFlags.
     */
    cursor?: SystemFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemFlags.
     */
    distinct?: SystemFlagScalarFieldEnum | SystemFlagScalarFieldEnum[]
  }

  /**
   * SystemFlag create
   */
  export type SystemFlagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * The data needed to create a SystemFlag.
     */
    data: XOR<SystemFlagCreateInput, SystemFlagUncheckedCreateInput>
  }

  /**
   * SystemFlag createMany
   */
  export type SystemFlagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemFlags.
     */
    data: SystemFlagCreateManyInput | SystemFlagCreateManyInput[]
  }

  /**
   * SystemFlag createManyAndReturn
   */
  export type SystemFlagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * The data used to create many SystemFlags.
     */
    data: SystemFlagCreateManyInput | SystemFlagCreateManyInput[]
  }

  /**
   * SystemFlag update
   */
  export type SystemFlagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * The data needed to update a SystemFlag.
     */
    data: XOR<SystemFlagUpdateInput, SystemFlagUncheckedUpdateInput>
    /**
     * Choose, which SystemFlag to update.
     */
    where: SystemFlagWhereUniqueInput
  }

  /**
   * SystemFlag updateMany
   */
  export type SystemFlagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemFlags.
     */
    data: XOR<SystemFlagUpdateManyMutationInput, SystemFlagUncheckedUpdateManyInput>
    /**
     * Filter which SystemFlags to update
     */
    where?: SystemFlagWhereInput
    /**
     * Limit how many SystemFlags to update.
     */
    limit?: number
  }

  /**
   * SystemFlag updateManyAndReturn
   */
  export type SystemFlagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * The data used to update SystemFlags.
     */
    data: XOR<SystemFlagUpdateManyMutationInput, SystemFlagUncheckedUpdateManyInput>
    /**
     * Filter which SystemFlags to update
     */
    where?: SystemFlagWhereInput
    /**
     * Limit how many SystemFlags to update.
     */
    limit?: number
  }

  /**
   * SystemFlag upsert
   */
  export type SystemFlagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * The filter to search for the SystemFlag to update in case it exists.
     */
    where: SystemFlagWhereUniqueInput
    /**
     * In case the SystemFlag found by the `where` argument doesn't exist, create a new SystemFlag with this data.
     */
    create: XOR<SystemFlagCreateInput, SystemFlagUncheckedCreateInput>
    /**
     * In case the SystemFlag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemFlagUpdateInput, SystemFlagUncheckedUpdateInput>
  }

  /**
   * SystemFlag delete
   */
  export type SystemFlagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
    /**
     * Filter which SystemFlag to delete.
     */
    where: SystemFlagWhereUniqueInput
  }

  /**
   * SystemFlag deleteMany
   */
  export type SystemFlagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemFlags to delete
     */
    where?: SystemFlagWhereInput
    /**
     * Limit how many SystemFlags to delete.
     */
    limit?: number
  }

  /**
   * SystemFlag without action
   */
  export type SystemFlagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemFlag
     */
    select?: SystemFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemFlag
     */
    omit?: SystemFlagOmit<ExtArgs> | null
  }


  /**
   * Model JobTracker
   */

  export type AggregateJobTracker = {
    _count: JobTrackerCountAggregateOutputType | null
    _avg: JobTrackerAvgAggregateOutputType | null
    _sum: JobTrackerSumAggregateOutputType | null
    _min: JobTrackerMinAggregateOutputType | null
    _max: JobTrackerMaxAggregateOutputType | null
  }

  export type JobTrackerAvgAggregateOutputType = {
    LotId: number | null
    BinId: number | null
  }

  export type JobTrackerSumAggregateOutputType = {
    LotId: number | null
    BinId: number | null
  }

  export type JobTrackerMinAggregateOutputType = {
    JobId: string | null
    LotId: number | null
    BinId: number | null
    ExecuteTime: Date | null
    status: $Enums.StatusJob | null
  }

  export type JobTrackerMaxAggregateOutputType = {
    JobId: string | null
    LotId: number | null
    BinId: number | null
    ExecuteTime: Date | null
    status: $Enums.StatusJob | null
  }

  export type JobTrackerCountAggregateOutputType = {
    JobId: number
    LotId: number
    BinId: number
    ExecuteTime: number
    status: number
    _all: number
  }


  export type JobTrackerAvgAggregateInputType = {
    LotId?: true
    BinId?: true
  }

  export type JobTrackerSumAggregateInputType = {
    LotId?: true
    BinId?: true
  }

  export type JobTrackerMinAggregateInputType = {
    JobId?: true
    LotId?: true
    BinId?: true
    ExecuteTime?: true
    status?: true
  }

  export type JobTrackerMaxAggregateInputType = {
    JobId?: true
    LotId?: true
    BinId?: true
    ExecuteTime?: true
    status?: true
  }

  export type JobTrackerCountAggregateInputType = {
    JobId?: true
    LotId?: true
    BinId?: true
    ExecuteTime?: true
    status?: true
    _all?: true
  }

  export type JobTrackerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobTracker to aggregate.
     */
    where?: JobTrackerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobTrackers to fetch.
     */
    orderBy?: JobTrackerOrderByWithRelationInput | JobTrackerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobTrackerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobTrackers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobTrackers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobTrackers
    **/
    _count?: true | JobTrackerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JobTrackerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JobTrackerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobTrackerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobTrackerMaxAggregateInputType
  }

  export type GetJobTrackerAggregateType<T extends JobTrackerAggregateArgs> = {
        [P in keyof T & keyof AggregateJobTracker]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobTracker[P]>
      : GetScalarType<T[P], AggregateJobTracker[P]>
  }




  export type JobTrackerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobTrackerWhereInput
    orderBy?: JobTrackerOrderByWithAggregationInput | JobTrackerOrderByWithAggregationInput[]
    by: JobTrackerScalarFieldEnum[] | JobTrackerScalarFieldEnum
    having?: JobTrackerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobTrackerCountAggregateInputType | true
    _avg?: JobTrackerAvgAggregateInputType
    _sum?: JobTrackerSumAggregateInputType
    _min?: JobTrackerMinAggregateInputType
    _max?: JobTrackerMaxAggregateInputType
  }

  export type JobTrackerGroupByOutputType = {
    JobId: string
    LotId: number
    BinId: number
    ExecuteTime: Date
    status: $Enums.StatusJob
    _count: JobTrackerCountAggregateOutputType | null
    _avg: JobTrackerAvgAggregateOutputType | null
    _sum: JobTrackerSumAggregateOutputType | null
    _min: JobTrackerMinAggregateOutputType | null
    _max: JobTrackerMaxAggregateOutputType | null
  }

  type GetJobTrackerGroupByPayload<T extends JobTrackerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobTrackerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobTrackerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobTrackerGroupByOutputType[P]>
            : GetScalarType<T[P], JobTrackerGroupByOutputType[P]>
        }
      >
    >


  export type JobTrackerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    LotId?: boolean
    BinId?: boolean
    ExecuteTime?: boolean
    status?: boolean
  }, ExtArgs["result"]["jobTracker"]>

  export type JobTrackerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    LotId?: boolean
    BinId?: boolean
    ExecuteTime?: boolean
    status?: boolean
  }, ExtArgs["result"]["jobTracker"]>

  export type JobTrackerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    LotId?: boolean
    BinId?: boolean
    ExecuteTime?: boolean
    status?: boolean
  }, ExtArgs["result"]["jobTracker"]>

  export type JobTrackerSelectScalar = {
    JobId?: boolean
    LotId?: boolean
    BinId?: boolean
    ExecuteTime?: boolean
    status?: boolean
  }

  export type JobTrackerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"JobId" | "LotId" | "BinId" | "ExecuteTime" | "status", ExtArgs["result"]["jobTracker"]>

  export type $JobTrackerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobTracker"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      JobId: string
      LotId: number
      BinId: number
      ExecuteTime: Date
      status: $Enums.StatusJob
    }, ExtArgs["result"]["jobTracker"]>
    composites: {}
  }

  type JobTrackerGetPayload<S extends boolean | null | undefined | JobTrackerDefaultArgs> = $Result.GetResult<Prisma.$JobTrackerPayload, S>

  type JobTrackerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JobTrackerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JobTrackerCountAggregateInputType | true
    }

  export interface JobTrackerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobTracker'], meta: { name: 'JobTracker' } }
    /**
     * Find zero or one JobTracker that matches the filter.
     * @param {JobTrackerFindUniqueArgs} args - Arguments to find a JobTracker
     * @example
     * // Get one JobTracker
     * const jobTracker = await prisma.jobTracker.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobTrackerFindUniqueArgs>(args: SelectSubset<T, JobTrackerFindUniqueArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one JobTracker that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JobTrackerFindUniqueOrThrowArgs} args - Arguments to find a JobTracker
     * @example
     * // Get one JobTracker
     * const jobTracker = await prisma.jobTracker.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobTrackerFindUniqueOrThrowArgs>(args: SelectSubset<T, JobTrackerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JobTracker that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerFindFirstArgs} args - Arguments to find a JobTracker
     * @example
     * // Get one JobTracker
     * const jobTracker = await prisma.jobTracker.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobTrackerFindFirstArgs>(args?: SelectSubset<T, JobTrackerFindFirstArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JobTracker that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerFindFirstOrThrowArgs} args - Arguments to find a JobTracker
     * @example
     * // Get one JobTracker
     * const jobTracker = await prisma.jobTracker.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobTrackerFindFirstOrThrowArgs>(args?: SelectSubset<T, JobTrackerFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more JobTrackers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobTrackers
     * const jobTrackers = await prisma.jobTracker.findMany()
     * 
     * // Get first 10 JobTrackers
     * const jobTrackers = await prisma.jobTracker.findMany({ take: 10 })
     * 
     * // Only select the `JobId`
     * const jobTrackerWithJobIdOnly = await prisma.jobTracker.findMany({ select: { JobId: true } })
     * 
     */
    findMany<T extends JobTrackerFindManyArgs>(args?: SelectSubset<T, JobTrackerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a JobTracker.
     * @param {JobTrackerCreateArgs} args - Arguments to create a JobTracker.
     * @example
     * // Create one JobTracker
     * const JobTracker = await prisma.jobTracker.create({
     *   data: {
     *     // ... data to create a JobTracker
     *   }
     * })
     * 
     */
    create<T extends JobTrackerCreateArgs>(args: SelectSubset<T, JobTrackerCreateArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many JobTrackers.
     * @param {JobTrackerCreateManyArgs} args - Arguments to create many JobTrackers.
     * @example
     * // Create many JobTrackers
     * const jobTracker = await prisma.jobTracker.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobTrackerCreateManyArgs>(args?: SelectSubset<T, JobTrackerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobTrackers and returns the data saved in the database.
     * @param {JobTrackerCreateManyAndReturnArgs} args - Arguments to create many JobTrackers.
     * @example
     * // Create many JobTrackers
     * const jobTracker = await prisma.jobTracker.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobTrackers and only return the `JobId`
     * const jobTrackerWithJobIdOnly = await prisma.jobTracker.createManyAndReturn({
     *   select: { JobId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobTrackerCreateManyAndReturnArgs>(args?: SelectSubset<T, JobTrackerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a JobTracker.
     * @param {JobTrackerDeleteArgs} args - Arguments to delete one JobTracker.
     * @example
     * // Delete one JobTracker
     * const JobTracker = await prisma.jobTracker.delete({
     *   where: {
     *     // ... filter to delete one JobTracker
     *   }
     * })
     * 
     */
    delete<T extends JobTrackerDeleteArgs>(args: SelectSubset<T, JobTrackerDeleteArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one JobTracker.
     * @param {JobTrackerUpdateArgs} args - Arguments to update one JobTracker.
     * @example
     * // Update one JobTracker
     * const jobTracker = await prisma.jobTracker.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobTrackerUpdateArgs>(args: SelectSubset<T, JobTrackerUpdateArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more JobTrackers.
     * @param {JobTrackerDeleteManyArgs} args - Arguments to filter JobTrackers to delete.
     * @example
     * // Delete a few JobTrackers
     * const { count } = await prisma.jobTracker.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobTrackerDeleteManyArgs>(args?: SelectSubset<T, JobTrackerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobTrackers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobTrackers
     * const jobTracker = await prisma.jobTracker.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobTrackerUpdateManyArgs>(args: SelectSubset<T, JobTrackerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobTrackers and returns the data updated in the database.
     * @param {JobTrackerUpdateManyAndReturnArgs} args - Arguments to update many JobTrackers.
     * @example
     * // Update many JobTrackers
     * const jobTracker = await prisma.jobTracker.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more JobTrackers and only return the `JobId`
     * const jobTrackerWithJobIdOnly = await prisma.jobTracker.updateManyAndReturn({
     *   select: { JobId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JobTrackerUpdateManyAndReturnArgs>(args: SelectSubset<T, JobTrackerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one JobTracker.
     * @param {JobTrackerUpsertArgs} args - Arguments to update or create a JobTracker.
     * @example
     * // Update or create a JobTracker
     * const jobTracker = await prisma.jobTracker.upsert({
     *   create: {
     *     // ... data to create a JobTracker
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobTracker we want to update
     *   }
     * })
     */
    upsert<T extends JobTrackerUpsertArgs>(args: SelectSubset<T, JobTrackerUpsertArgs<ExtArgs>>): Prisma__JobTrackerClient<$Result.GetResult<Prisma.$JobTrackerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of JobTrackers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerCountArgs} args - Arguments to filter JobTrackers to count.
     * @example
     * // Count the number of JobTrackers
     * const count = await prisma.jobTracker.count({
     *   where: {
     *     // ... the filter for the JobTrackers we want to count
     *   }
     * })
    **/
    count<T extends JobTrackerCountArgs>(
      args?: Subset<T, JobTrackerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobTrackerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobTracker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobTrackerAggregateArgs>(args: Subset<T, JobTrackerAggregateArgs>): Prisma.PrismaPromise<GetJobTrackerAggregateType<T>>

    /**
     * Group by JobTracker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobTrackerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobTrackerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobTrackerGroupByArgs['orderBy'] }
        : { orderBy?: JobTrackerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobTrackerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobTrackerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobTracker model
   */
  readonly fields: JobTrackerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobTracker.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobTrackerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JobTracker model
   */
  interface JobTrackerFieldRefs {
    readonly JobId: FieldRef<"JobTracker", 'String'>
    readonly LotId: FieldRef<"JobTracker", 'Int'>
    readonly BinId: FieldRef<"JobTracker", 'Int'>
    readonly ExecuteTime: FieldRef<"JobTracker", 'DateTime'>
    readonly status: FieldRef<"JobTracker", 'StatusJob'>
  }
    

  // Custom InputTypes
  /**
   * JobTracker findUnique
   */
  export type JobTrackerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter, which JobTracker to fetch.
     */
    where: JobTrackerWhereUniqueInput
  }

  /**
   * JobTracker findUniqueOrThrow
   */
  export type JobTrackerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter, which JobTracker to fetch.
     */
    where: JobTrackerWhereUniqueInput
  }

  /**
   * JobTracker findFirst
   */
  export type JobTrackerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter, which JobTracker to fetch.
     */
    where?: JobTrackerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobTrackers to fetch.
     */
    orderBy?: JobTrackerOrderByWithRelationInput | JobTrackerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobTrackers.
     */
    cursor?: JobTrackerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobTrackers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobTrackers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobTrackers.
     */
    distinct?: JobTrackerScalarFieldEnum | JobTrackerScalarFieldEnum[]
  }

  /**
   * JobTracker findFirstOrThrow
   */
  export type JobTrackerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter, which JobTracker to fetch.
     */
    where?: JobTrackerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobTrackers to fetch.
     */
    orderBy?: JobTrackerOrderByWithRelationInput | JobTrackerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobTrackers.
     */
    cursor?: JobTrackerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobTrackers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobTrackers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobTrackers.
     */
    distinct?: JobTrackerScalarFieldEnum | JobTrackerScalarFieldEnum[]
  }

  /**
   * JobTracker findMany
   */
  export type JobTrackerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter, which JobTrackers to fetch.
     */
    where?: JobTrackerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobTrackers to fetch.
     */
    orderBy?: JobTrackerOrderByWithRelationInput | JobTrackerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobTrackers.
     */
    cursor?: JobTrackerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobTrackers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobTrackers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobTrackers.
     */
    distinct?: JobTrackerScalarFieldEnum | JobTrackerScalarFieldEnum[]
  }

  /**
   * JobTracker create
   */
  export type JobTrackerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * The data needed to create a JobTracker.
     */
    data: XOR<JobTrackerCreateInput, JobTrackerUncheckedCreateInput>
  }

  /**
   * JobTracker createMany
   */
  export type JobTrackerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobTrackers.
     */
    data: JobTrackerCreateManyInput | JobTrackerCreateManyInput[]
  }

  /**
   * JobTracker createManyAndReturn
   */
  export type JobTrackerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * The data used to create many JobTrackers.
     */
    data: JobTrackerCreateManyInput | JobTrackerCreateManyInput[]
  }

  /**
   * JobTracker update
   */
  export type JobTrackerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * The data needed to update a JobTracker.
     */
    data: XOR<JobTrackerUpdateInput, JobTrackerUncheckedUpdateInput>
    /**
     * Choose, which JobTracker to update.
     */
    where: JobTrackerWhereUniqueInput
  }

  /**
   * JobTracker updateMany
   */
  export type JobTrackerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobTrackers.
     */
    data: XOR<JobTrackerUpdateManyMutationInput, JobTrackerUncheckedUpdateManyInput>
    /**
     * Filter which JobTrackers to update
     */
    where?: JobTrackerWhereInput
    /**
     * Limit how many JobTrackers to update.
     */
    limit?: number
  }

  /**
   * JobTracker updateManyAndReturn
   */
  export type JobTrackerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * The data used to update JobTrackers.
     */
    data: XOR<JobTrackerUpdateManyMutationInput, JobTrackerUncheckedUpdateManyInput>
    /**
     * Filter which JobTrackers to update
     */
    where?: JobTrackerWhereInput
    /**
     * Limit how many JobTrackers to update.
     */
    limit?: number
  }

  /**
   * JobTracker upsert
   */
  export type JobTrackerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * The filter to search for the JobTracker to update in case it exists.
     */
    where: JobTrackerWhereUniqueInput
    /**
     * In case the JobTracker found by the `where` argument doesn't exist, create a new JobTracker with this data.
     */
    create: XOR<JobTrackerCreateInput, JobTrackerUncheckedCreateInput>
    /**
     * In case the JobTracker was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobTrackerUpdateInput, JobTrackerUncheckedUpdateInput>
  }

  /**
   * JobTracker delete
   */
  export type JobTrackerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
    /**
     * Filter which JobTracker to delete.
     */
    where: JobTrackerWhereUniqueInput
  }

  /**
   * JobTracker deleteMany
   */
  export type JobTrackerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobTrackers to delete
     */
    where?: JobTrackerWhereInput
    /**
     * Limit how many JobTrackers to delete.
     */
    limit?: number
  }

  /**
   * JobTracker without action
   */
  export type JobTrackerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobTracker
     */
    select?: JobTrackerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobTracker
     */
    omit?: JobTrackerOmit<ExtArgs> | null
  }


  /**
   * Model MustExecutedJob
   */

  export type AggregateMustExecutedJob = {
    _count: MustExecutedJobCountAggregateOutputType | null
    _avg: MustExecutedJobAvgAggregateOutputType | null
    _sum: MustExecutedJobSumAggregateOutputType | null
    _min: MustExecutedJobMinAggregateOutputType | null
    _max: MustExecutedJobMaxAggregateOutputType | null
  }

  export type MustExecutedJobAvgAggregateOutputType = {
    JobId: number | null
    LotId: number | null
    BinId: number | null
  }

  export type MustExecutedJobSumAggregateOutputType = {
    JobId: number | null
    LotId: number | null
    BinId: number | null
  }

  export type MustExecutedJobMinAggregateOutputType = {
    JobId: number | null
    ExcutedTime: Date | null
    LotId: number | null
    BinId: number | null
  }

  export type MustExecutedJobMaxAggregateOutputType = {
    JobId: number | null
    ExcutedTime: Date | null
    LotId: number | null
    BinId: number | null
  }

  export type MustExecutedJobCountAggregateOutputType = {
    JobId: number
    ExcutedTime: number
    LotId: number
    BinId: number
    _all: number
  }


  export type MustExecutedJobAvgAggregateInputType = {
    JobId?: true
    LotId?: true
    BinId?: true
  }

  export type MustExecutedJobSumAggregateInputType = {
    JobId?: true
    LotId?: true
    BinId?: true
  }

  export type MustExecutedJobMinAggregateInputType = {
    JobId?: true
    ExcutedTime?: true
    LotId?: true
    BinId?: true
  }

  export type MustExecutedJobMaxAggregateInputType = {
    JobId?: true
    ExcutedTime?: true
    LotId?: true
    BinId?: true
  }

  export type MustExecutedJobCountAggregateInputType = {
    JobId?: true
    ExcutedTime?: true
    LotId?: true
    BinId?: true
    _all?: true
  }

  export type MustExecutedJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MustExecutedJob to aggregate.
     */
    where?: MustExecutedJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MustExecutedJobs to fetch.
     */
    orderBy?: MustExecutedJobOrderByWithRelationInput | MustExecutedJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MustExecutedJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MustExecutedJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MustExecutedJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MustExecutedJobs
    **/
    _count?: true | MustExecutedJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MustExecutedJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MustExecutedJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MustExecutedJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MustExecutedJobMaxAggregateInputType
  }

  export type GetMustExecutedJobAggregateType<T extends MustExecutedJobAggregateArgs> = {
        [P in keyof T & keyof AggregateMustExecutedJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMustExecutedJob[P]>
      : GetScalarType<T[P], AggregateMustExecutedJob[P]>
  }




  export type MustExecutedJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MustExecutedJobWhereInput
    orderBy?: MustExecutedJobOrderByWithAggregationInput | MustExecutedJobOrderByWithAggregationInput[]
    by: MustExecutedJobScalarFieldEnum[] | MustExecutedJobScalarFieldEnum
    having?: MustExecutedJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MustExecutedJobCountAggregateInputType | true
    _avg?: MustExecutedJobAvgAggregateInputType
    _sum?: MustExecutedJobSumAggregateInputType
    _min?: MustExecutedJobMinAggregateInputType
    _max?: MustExecutedJobMaxAggregateInputType
  }

  export type MustExecutedJobGroupByOutputType = {
    JobId: number
    ExcutedTime: Date
    LotId: number
    BinId: number
    _count: MustExecutedJobCountAggregateOutputType | null
    _avg: MustExecutedJobAvgAggregateOutputType | null
    _sum: MustExecutedJobSumAggregateOutputType | null
    _min: MustExecutedJobMinAggregateOutputType | null
    _max: MustExecutedJobMaxAggregateOutputType | null
  }

  type GetMustExecutedJobGroupByPayload<T extends MustExecutedJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MustExecutedJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MustExecutedJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MustExecutedJobGroupByOutputType[P]>
            : GetScalarType<T[P], MustExecutedJobGroupByOutputType[P]>
        }
      >
    >


  export type MustExecutedJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    ExcutedTime?: boolean
    LotId?: boolean
    BinId?: boolean
  }, ExtArgs["result"]["mustExecutedJob"]>

  export type MustExecutedJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    ExcutedTime?: boolean
    LotId?: boolean
    BinId?: boolean
  }, ExtArgs["result"]["mustExecutedJob"]>

  export type MustExecutedJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    JobId?: boolean
    ExcutedTime?: boolean
    LotId?: boolean
    BinId?: boolean
  }, ExtArgs["result"]["mustExecutedJob"]>

  export type MustExecutedJobSelectScalar = {
    JobId?: boolean
    ExcutedTime?: boolean
    LotId?: boolean
    BinId?: boolean
  }

  export type MustExecutedJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"JobId" | "ExcutedTime" | "LotId" | "BinId", ExtArgs["result"]["mustExecutedJob"]>

  export type $MustExecutedJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MustExecutedJob"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      JobId: number
      ExcutedTime: Date
      LotId: number
      BinId: number
    }, ExtArgs["result"]["mustExecutedJob"]>
    composites: {}
  }

  type MustExecutedJobGetPayload<S extends boolean | null | undefined | MustExecutedJobDefaultArgs> = $Result.GetResult<Prisma.$MustExecutedJobPayload, S>

  type MustExecutedJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MustExecutedJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MustExecutedJobCountAggregateInputType | true
    }

  export interface MustExecutedJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MustExecutedJob'], meta: { name: 'MustExecutedJob' } }
    /**
     * Find zero or one MustExecutedJob that matches the filter.
     * @param {MustExecutedJobFindUniqueArgs} args - Arguments to find a MustExecutedJob
     * @example
     * // Get one MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MustExecutedJobFindUniqueArgs>(args: SelectSubset<T, MustExecutedJobFindUniqueArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MustExecutedJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MustExecutedJobFindUniqueOrThrowArgs} args - Arguments to find a MustExecutedJob
     * @example
     * // Get one MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MustExecutedJobFindUniqueOrThrowArgs>(args: SelectSubset<T, MustExecutedJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MustExecutedJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobFindFirstArgs} args - Arguments to find a MustExecutedJob
     * @example
     * // Get one MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MustExecutedJobFindFirstArgs>(args?: SelectSubset<T, MustExecutedJobFindFirstArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MustExecutedJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobFindFirstOrThrowArgs} args - Arguments to find a MustExecutedJob
     * @example
     * // Get one MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MustExecutedJobFindFirstOrThrowArgs>(args?: SelectSubset<T, MustExecutedJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MustExecutedJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MustExecutedJobs
     * const mustExecutedJobs = await prisma.mustExecutedJob.findMany()
     * 
     * // Get first 10 MustExecutedJobs
     * const mustExecutedJobs = await prisma.mustExecutedJob.findMany({ take: 10 })
     * 
     * // Only select the `JobId`
     * const mustExecutedJobWithJobIdOnly = await prisma.mustExecutedJob.findMany({ select: { JobId: true } })
     * 
     */
    findMany<T extends MustExecutedJobFindManyArgs>(args?: SelectSubset<T, MustExecutedJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MustExecutedJob.
     * @param {MustExecutedJobCreateArgs} args - Arguments to create a MustExecutedJob.
     * @example
     * // Create one MustExecutedJob
     * const MustExecutedJob = await prisma.mustExecutedJob.create({
     *   data: {
     *     // ... data to create a MustExecutedJob
     *   }
     * })
     * 
     */
    create<T extends MustExecutedJobCreateArgs>(args: SelectSubset<T, MustExecutedJobCreateArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MustExecutedJobs.
     * @param {MustExecutedJobCreateManyArgs} args - Arguments to create many MustExecutedJobs.
     * @example
     * // Create many MustExecutedJobs
     * const mustExecutedJob = await prisma.mustExecutedJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MustExecutedJobCreateManyArgs>(args?: SelectSubset<T, MustExecutedJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MustExecutedJobs and returns the data saved in the database.
     * @param {MustExecutedJobCreateManyAndReturnArgs} args - Arguments to create many MustExecutedJobs.
     * @example
     * // Create many MustExecutedJobs
     * const mustExecutedJob = await prisma.mustExecutedJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MustExecutedJobs and only return the `JobId`
     * const mustExecutedJobWithJobIdOnly = await prisma.mustExecutedJob.createManyAndReturn({
     *   select: { JobId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MustExecutedJobCreateManyAndReturnArgs>(args?: SelectSubset<T, MustExecutedJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MustExecutedJob.
     * @param {MustExecutedJobDeleteArgs} args - Arguments to delete one MustExecutedJob.
     * @example
     * // Delete one MustExecutedJob
     * const MustExecutedJob = await prisma.mustExecutedJob.delete({
     *   where: {
     *     // ... filter to delete one MustExecutedJob
     *   }
     * })
     * 
     */
    delete<T extends MustExecutedJobDeleteArgs>(args: SelectSubset<T, MustExecutedJobDeleteArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MustExecutedJob.
     * @param {MustExecutedJobUpdateArgs} args - Arguments to update one MustExecutedJob.
     * @example
     * // Update one MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MustExecutedJobUpdateArgs>(args: SelectSubset<T, MustExecutedJobUpdateArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MustExecutedJobs.
     * @param {MustExecutedJobDeleteManyArgs} args - Arguments to filter MustExecutedJobs to delete.
     * @example
     * // Delete a few MustExecutedJobs
     * const { count } = await prisma.mustExecutedJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MustExecutedJobDeleteManyArgs>(args?: SelectSubset<T, MustExecutedJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MustExecutedJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MustExecutedJobs
     * const mustExecutedJob = await prisma.mustExecutedJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MustExecutedJobUpdateManyArgs>(args: SelectSubset<T, MustExecutedJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MustExecutedJobs and returns the data updated in the database.
     * @param {MustExecutedJobUpdateManyAndReturnArgs} args - Arguments to update many MustExecutedJobs.
     * @example
     * // Update many MustExecutedJobs
     * const mustExecutedJob = await prisma.mustExecutedJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MustExecutedJobs and only return the `JobId`
     * const mustExecutedJobWithJobIdOnly = await prisma.mustExecutedJob.updateManyAndReturn({
     *   select: { JobId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MustExecutedJobUpdateManyAndReturnArgs>(args: SelectSubset<T, MustExecutedJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MustExecutedJob.
     * @param {MustExecutedJobUpsertArgs} args - Arguments to update or create a MustExecutedJob.
     * @example
     * // Update or create a MustExecutedJob
     * const mustExecutedJob = await prisma.mustExecutedJob.upsert({
     *   create: {
     *     // ... data to create a MustExecutedJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MustExecutedJob we want to update
     *   }
     * })
     */
    upsert<T extends MustExecutedJobUpsertArgs>(args: SelectSubset<T, MustExecutedJobUpsertArgs<ExtArgs>>): Prisma__MustExecutedJobClient<$Result.GetResult<Prisma.$MustExecutedJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MustExecutedJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobCountArgs} args - Arguments to filter MustExecutedJobs to count.
     * @example
     * // Count the number of MustExecutedJobs
     * const count = await prisma.mustExecutedJob.count({
     *   where: {
     *     // ... the filter for the MustExecutedJobs we want to count
     *   }
     * })
    **/
    count<T extends MustExecutedJobCountArgs>(
      args?: Subset<T, MustExecutedJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MustExecutedJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MustExecutedJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MustExecutedJobAggregateArgs>(args: Subset<T, MustExecutedJobAggregateArgs>): Prisma.PrismaPromise<GetMustExecutedJobAggregateType<T>>

    /**
     * Group by MustExecutedJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MustExecutedJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MustExecutedJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MustExecutedJobGroupByArgs['orderBy'] }
        : { orderBy?: MustExecutedJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MustExecutedJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMustExecutedJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MustExecutedJob model
   */
  readonly fields: MustExecutedJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MustExecutedJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MustExecutedJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MustExecutedJob model
   */
  interface MustExecutedJobFieldRefs {
    readonly JobId: FieldRef<"MustExecutedJob", 'Int'>
    readonly ExcutedTime: FieldRef<"MustExecutedJob", 'DateTime'>
    readonly LotId: FieldRef<"MustExecutedJob", 'Int'>
    readonly BinId: FieldRef<"MustExecutedJob", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * MustExecutedJob findUnique
   */
  export type MustExecutedJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter, which MustExecutedJob to fetch.
     */
    where: MustExecutedJobWhereUniqueInput
  }

  /**
   * MustExecutedJob findUniqueOrThrow
   */
  export type MustExecutedJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter, which MustExecutedJob to fetch.
     */
    where: MustExecutedJobWhereUniqueInput
  }

  /**
   * MustExecutedJob findFirst
   */
  export type MustExecutedJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter, which MustExecutedJob to fetch.
     */
    where?: MustExecutedJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MustExecutedJobs to fetch.
     */
    orderBy?: MustExecutedJobOrderByWithRelationInput | MustExecutedJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MustExecutedJobs.
     */
    cursor?: MustExecutedJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MustExecutedJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MustExecutedJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MustExecutedJobs.
     */
    distinct?: MustExecutedJobScalarFieldEnum | MustExecutedJobScalarFieldEnum[]
  }

  /**
   * MustExecutedJob findFirstOrThrow
   */
  export type MustExecutedJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter, which MustExecutedJob to fetch.
     */
    where?: MustExecutedJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MustExecutedJobs to fetch.
     */
    orderBy?: MustExecutedJobOrderByWithRelationInput | MustExecutedJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MustExecutedJobs.
     */
    cursor?: MustExecutedJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MustExecutedJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MustExecutedJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MustExecutedJobs.
     */
    distinct?: MustExecutedJobScalarFieldEnum | MustExecutedJobScalarFieldEnum[]
  }

  /**
   * MustExecutedJob findMany
   */
  export type MustExecutedJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter, which MustExecutedJobs to fetch.
     */
    where?: MustExecutedJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MustExecutedJobs to fetch.
     */
    orderBy?: MustExecutedJobOrderByWithRelationInput | MustExecutedJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MustExecutedJobs.
     */
    cursor?: MustExecutedJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MustExecutedJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MustExecutedJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MustExecutedJobs.
     */
    distinct?: MustExecutedJobScalarFieldEnum | MustExecutedJobScalarFieldEnum[]
  }

  /**
   * MustExecutedJob create
   */
  export type MustExecutedJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * The data needed to create a MustExecutedJob.
     */
    data: XOR<MustExecutedJobCreateInput, MustExecutedJobUncheckedCreateInput>
  }

  /**
   * MustExecutedJob createMany
   */
  export type MustExecutedJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MustExecutedJobs.
     */
    data: MustExecutedJobCreateManyInput | MustExecutedJobCreateManyInput[]
  }

  /**
   * MustExecutedJob createManyAndReturn
   */
  export type MustExecutedJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * The data used to create many MustExecutedJobs.
     */
    data: MustExecutedJobCreateManyInput | MustExecutedJobCreateManyInput[]
  }

  /**
   * MustExecutedJob update
   */
  export type MustExecutedJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * The data needed to update a MustExecutedJob.
     */
    data: XOR<MustExecutedJobUpdateInput, MustExecutedJobUncheckedUpdateInput>
    /**
     * Choose, which MustExecutedJob to update.
     */
    where: MustExecutedJobWhereUniqueInput
  }

  /**
   * MustExecutedJob updateMany
   */
  export type MustExecutedJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MustExecutedJobs.
     */
    data: XOR<MustExecutedJobUpdateManyMutationInput, MustExecutedJobUncheckedUpdateManyInput>
    /**
     * Filter which MustExecutedJobs to update
     */
    where?: MustExecutedJobWhereInput
    /**
     * Limit how many MustExecutedJobs to update.
     */
    limit?: number
  }

  /**
   * MustExecutedJob updateManyAndReturn
   */
  export type MustExecutedJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * The data used to update MustExecutedJobs.
     */
    data: XOR<MustExecutedJobUpdateManyMutationInput, MustExecutedJobUncheckedUpdateManyInput>
    /**
     * Filter which MustExecutedJobs to update
     */
    where?: MustExecutedJobWhereInput
    /**
     * Limit how many MustExecutedJobs to update.
     */
    limit?: number
  }

  /**
   * MustExecutedJob upsert
   */
  export type MustExecutedJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * The filter to search for the MustExecutedJob to update in case it exists.
     */
    where: MustExecutedJobWhereUniqueInput
    /**
     * In case the MustExecutedJob found by the `where` argument doesn't exist, create a new MustExecutedJob with this data.
     */
    create: XOR<MustExecutedJobCreateInput, MustExecutedJobUncheckedCreateInput>
    /**
     * In case the MustExecutedJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MustExecutedJobUpdateInput, MustExecutedJobUncheckedUpdateInput>
  }

  /**
   * MustExecutedJob delete
   */
  export type MustExecutedJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
    /**
     * Filter which MustExecutedJob to delete.
     */
    where: MustExecutedJobWhereUniqueInput
  }

  /**
   * MustExecutedJob deleteMany
   */
  export type MustExecutedJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MustExecutedJobs to delete
     */
    where?: MustExecutedJobWhereInput
    /**
     * Limit how many MustExecutedJobs to delete.
     */
    limit?: number
  }

  /**
   * MustExecutedJob without action
   */
  export type MustExecutedJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MustExecutedJob
     */
    select?: MustExecutedJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MustExecutedJob
     */
    omit?: MustExecutedJobOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SystemFlagScalarFieldEnum: {
    key: 'key',
    value: 'value',
    type: 'type'
  };

  export type SystemFlagScalarFieldEnum = (typeof SystemFlagScalarFieldEnum)[keyof typeof SystemFlagScalarFieldEnum]


  export const JobTrackerScalarFieldEnum: {
    JobId: 'JobId',
    LotId: 'LotId',
    BinId: 'BinId',
    ExecuteTime: 'ExecuteTime',
    status: 'status'
  };

  export type JobTrackerScalarFieldEnum = (typeof JobTrackerScalarFieldEnum)[keyof typeof JobTrackerScalarFieldEnum]


  export const MustExecutedJobScalarFieldEnum: {
    JobId: 'JobId',
    ExcutedTime: 'ExcutedTime',
    LotId: 'LotId',
    BinId: 'BinId'
  };

  export type MustExecutedJobScalarFieldEnum = (typeof MustExecutedJobScalarFieldEnum)[keyof typeof MustExecutedJobScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'FlagType'
   */
  export type EnumFlagTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FlagType'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'StatusJob'
   */
  export type EnumStatusJobFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusJob'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type SystemFlagWhereInput = {
    AND?: SystemFlagWhereInput | SystemFlagWhereInput[]
    OR?: SystemFlagWhereInput[]
    NOT?: SystemFlagWhereInput | SystemFlagWhereInput[]
    key?: StringFilter<"SystemFlag"> | string
    value?: StringFilter<"SystemFlag"> | string
    type?: EnumFlagTypeFilter<"SystemFlag"> | $Enums.FlagType
  }

  export type SystemFlagOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
    type?: SortOrder
  }

  export type SystemFlagWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    value?: string
    AND?: SystemFlagWhereInput | SystemFlagWhereInput[]
    OR?: SystemFlagWhereInput[]
    NOT?: SystemFlagWhereInput | SystemFlagWhereInput[]
    type?: EnumFlagTypeFilter<"SystemFlag"> | $Enums.FlagType
  }, "key" | "value">

  export type SystemFlagOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    type?: SortOrder
    _count?: SystemFlagCountOrderByAggregateInput
    _max?: SystemFlagMaxOrderByAggregateInput
    _min?: SystemFlagMinOrderByAggregateInput
  }

  export type SystemFlagScalarWhereWithAggregatesInput = {
    AND?: SystemFlagScalarWhereWithAggregatesInput | SystemFlagScalarWhereWithAggregatesInput[]
    OR?: SystemFlagScalarWhereWithAggregatesInput[]
    NOT?: SystemFlagScalarWhereWithAggregatesInput | SystemFlagScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"SystemFlag"> | string
    value?: StringWithAggregatesFilter<"SystemFlag"> | string
    type?: EnumFlagTypeWithAggregatesFilter<"SystemFlag"> | $Enums.FlagType
  }

  export type JobTrackerWhereInput = {
    AND?: JobTrackerWhereInput | JobTrackerWhereInput[]
    OR?: JobTrackerWhereInput[]
    NOT?: JobTrackerWhereInput | JobTrackerWhereInput[]
    JobId?: StringFilter<"JobTracker"> | string
    LotId?: IntFilter<"JobTracker"> | number
    BinId?: IntFilter<"JobTracker"> | number
    ExecuteTime?: DateTimeFilter<"JobTracker"> | Date | string
    status?: EnumStatusJobFilter<"JobTracker"> | $Enums.StatusJob
  }

  export type JobTrackerOrderByWithRelationInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    ExecuteTime?: SortOrder
    status?: SortOrder
  }

  export type JobTrackerWhereUniqueInput = Prisma.AtLeast<{
    JobId?: string
    AND?: JobTrackerWhereInput | JobTrackerWhereInput[]
    OR?: JobTrackerWhereInput[]
    NOT?: JobTrackerWhereInput | JobTrackerWhereInput[]
    LotId?: IntFilter<"JobTracker"> | number
    BinId?: IntFilter<"JobTracker"> | number
    ExecuteTime?: DateTimeFilter<"JobTracker"> | Date | string
    status?: EnumStatusJobFilter<"JobTracker"> | $Enums.StatusJob
  }, "JobId">

  export type JobTrackerOrderByWithAggregationInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    ExecuteTime?: SortOrder
    status?: SortOrder
    _count?: JobTrackerCountOrderByAggregateInput
    _avg?: JobTrackerAvgOrderByAggregateInput
    _max?: JobTrackerMaxOrderByAggregateInput
    _min?: JobTrackerMinOrderByAggregateInput
    _sum?: JobTrackerSumOrderByAggregateInput
  }

  export type JobTrackerScalarWhereWithAggregatesInput = {
    AND?: JobTrackerScalarWhereWithAggregatesInput | JobTrackerScalarWhereWithAggregatesInput[]
    OR?: JobTrackerScalarWhereWithAggregatesInput[]
    NOT?: JobTrackerScalarWhereWithAggregatesInput | JobTrackerScalarWhereWithAggregatesInput[]
    JobId?: StringWithAggregatesFilter<"JobTracker"> | string
    LotId?: IntWithAggregatesFilter<"JobTracker"> | number
    BinId?: IntWithAggregatesFilter<"JobTracker"> | number
    ExecuteTime?: DateTimeWithAggregatesFilter<"JobTracker"> | Date | string
    status?: EnumStatusJobWithAggregatesFilter<"JobTracker"> | $Enums.StatusJob
  }

  export type MustExecutedJobWhereInput = {
    AND?: MustExecutedJobWhereInput | MustExecutedJobWhereInput[]
    OR?: MustExecutedJobWhereInput[]
    NOT?: MustExecutedJobWhereInput | MustExecutedJobWhereInput[]
    JobId?: IntFilter<"MustExecutedJob"> | number
    ExcutedTime?: DateTimeFilter<"MustExecutedJob"> | Date | string
    LotId?: IntFilter<"MustExecutedJob"> | number
    BinId?: IntFilter<"MustExecutedJob"> | number
  }

  export type MustExecutedJobOrderByWithRelationInput = {
    JobId?: SortOrder
    ExcutedTime?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type MustExecutedJobWhereUniqueInput = Prisma.AtLeast<{
    JobId?: number
    AND?: MustExecutedJobWhereInput | MustExecutedJobWhereInput[]
    OR?: MustExecutedJobWhereInput[]
    NOT?: MustExecutedJobWhereInput | MustExecutedJobWhereInput[]
    ExcutedTime?: DateTimeFilter<"MustExecutedJob"> | Date | string
    LotId?: IntFilter<"MustExecutedJob"> | number
    BinId?: IntFilter<"MustExecutedJob"> | number
  }, "JobId">

  export type MustExecutedJobOrderByWithAggregationInput = {
    JobId?: SortOrder
    ExcutedTime?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    _count?: MustExecutedJobCountOrderByAggregateInput
    _avg?: MustExecutedJobAvgOrderByAggregateInput
    _max?: MustExecutedJobMaxOrderByAggregateInput
    _min?: MustExecutedJobMinOrderByAggregateInput
    _sum?: MustExecutedJobSumOrderByAggregateInput
  }

  export type MustExecutedJobScalarWhereWithAggregatesInput = {
    AND?: MustExecutedJobScalarWhereWithAggregatesInput | MustExecutedJobScalarWhereWithAggregatesInput[]
    OR?: MustExecutedJobScalarWhereWithAggregatesInput[]
    NOT?: MustExecutedJobScalarWhereWithAggregatesInput | MustExecutedJobScalarWhereWithAggregatesInput[]
    JobId?: IntWithAggregatesFilter<"MustExecutedJob"> | number
    ExcutedTime?: DateTimeWithAggregatesFilter<"MustExecutedJob"> | Date | string
    LotId?: IntWithAggregatesFilter<"MustExecutedJob"> | number
    BinId?: IntWithAggregatesFilter<"MustExecutedJob"> | number
  }

  export type SystemFlagCreateInput = {
    key: string
    value: string
    type: $Enums.FlagType
  }

  export type SystemFlagUncheckedCreateInput = {
    key: string
    value: string
    type: $Enums.FlagType
  }

  export type SystemFlagUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    type?: EnumFlagTypeFieldUpdateOperationsInput | $Enums.FlagType
  }

  export type SystemFlagUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    type?: EnumFlagTypeFieldUpdateOperationsInput | $Enums.FlagType
  }

  export type SystemFlagCreateManyInput = {
    key: string
    value: string
    type: $Enums.FlagType
  }

  export type SystemFlagUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    type?: EnumFlagTypeFieldUpdateOperationsInput | $Enums.FlagType
  }

  export type SystemFlagUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    type?: EnumFlagTypeFieldUpdateOperationsInput | $Enums.FlagType
  }

  export type JobTrackerCreateInput = {
    JobId: string
    LotId: number
    BinId: number
    ExecuteTime: Date | string
    status?: $Enums.StatusJob
  }

  export type JobTrackerUncheckedCreateInput = {
    JobId: string
    LotId: number
    BinId: number
    ExecuteTime: Date | string
    status?: $Enums.StatusJob
  }

  export type JobTrackerUpdateInput = {
    JobId?: StringFieldUpdateOperationsInput | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
    ExecuteTime?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusJobFieldUpdateOperationsInput | $Enums.StatusJob
  }

  export type JobTrackerUncheckedUpdateInput = {
    JobId?: StringFieldUpdateOperationsInput | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
    ExecuteTime?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusJobFieldUpdateOperationsInput | $Enums.StatusJob
  }

  export type JobTrackerCreateManyInput = {
    JobId: string
    LotId: number
    BinId: number
    ExecuteTime: Date | string
    status?: $Enums.StatusJob
  }

  export type JobTrackerUpdateManyMutationInput = {
    JobId?: StringFieldUpdateOperationsInput | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
    ExecuteTime?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusJobFieldUpdateOperationsInput | $Enums.StatusJob
  }

  export type JobTrackerUncheckedUpdateManyInput = {
    JobId?: StringFieldUpdateOperationsInput | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
    ExecuteTime?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusJobFieldUpdateOperationsInput | $Enums.StatusJob
  }

  export type MustExecutedJobCreateInput = {
    JobId: number
    ExcutedTime: Date | string
    LotId: number
    BinId: number
  }

  export type MustExecutedJobUncheckedCreateInput = {
    JobId: number
    ExcutedTime: Date | string
    LotId: number
    BinId: number
  }

  export type MustExecutedJobUpdateInput = {
    JobId?: IntFieldUpdateOperationsInput | number
    ExcutedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
  }

  export type MustExecutedJobUncheckedUpdateInput = {
    JobId?: IntFieldUpdateOperationsInput | number
    ExcutedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
  }

  export type MustExecutedJobCreateManyInput = {
    JobId: number
    ExcutedTime: Date | string
    LotId: number
    BinId: number
  }

  export type MustExecutedJobUpdateManyMutationInput = {
    JobId?: IntFieldUpdateOperationsInput | number
    ExcutedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
  }

  export type MustExecutedJobUncheckedUpdateManyInput = {
    JobId?: IntFieldUpdateOperationsInput | number
    ExcutedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    LotId?: IntFieldUpdateOperationsInput | number
    BinId?: IntFieldUpdateOperationsInput | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumFlagTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FlagType | EnumFlagTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FlagType[]
    notIn?: $Enums.FlagType[]
    not?: NestedEnumFlagTypeFilter<$PrismaModel> | $Enums.FlagType
  }

  export type SystemFlagCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    type?: SortOrder
  }

  export type SystemFlagMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    type?: SortOrder
  }

  export type SystemFlagMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    type?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumFlagTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FlagType | EnumFlagTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FlagType[]
    notIn?: $Enums.FlagType[]
    not?: NestedEnumFlagTypeWithAggregatesFilter<$PrismaModel> | $Enums.FlagType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFlagTypeFilter<$PrismaModel>
    _max?: NestedEnumFlagTypeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumStatusJobFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJob | EnumStatusJobFieldRefInput<$PrismaModel>
    in?: $Enums.StatusJob[]
    notIn?: $Enums.StatusJob[]
    not?: NestedEnumStatusJobFilter<$PrismaModel> | $Enums.StatusJob
  }

  export type JobTrackerCountOrderByAggregateInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    ExecuteTime?: SortOrder
    status?: SortOrder
  }

  export type JobTrackerAvgOrderByAggregateInput = {
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type JobTrackerMaxOrderByAggregateInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    ExecuteTime?: SortOrder
    status?: SortOrder
  }

  export type JobTrackerMinOrderByAggregateInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
    ExecuteTime?: SortOrder
    status?: SortOrder
  }

  export type JobTrackerSumOrderByAggregateInput = {
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumStatusJobWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJob | EnumStatusJobFieldRefInput<$PrismaModel>
    in?: $Enums.StatusJob[]
    notIn?: $Enums.StatusJob[]
    not?: NestedEnumStatusJobWithAggregatesFilter<$PrismaModel> | $Enums.StatusJob
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusJobFilter<$PrismaModel>
    _max?: NestedEnumStatusJobFilter<$PrismaModel>
  }

  export type MustExecutedJobCountOrderByAggregateInput = {
    JobId?: SortOrder
    ExcutedTime?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type MustExecutedJobAvgOrderByAggregateInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type MustExecutedJobMaxOrderByAggregateInput = {
    JobId?: SortOrder
    ExcutedTime?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type MustExecutedJobMinOrderByAggregateInput = {
    JobId?: SortOrder
    ExcutedTime?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type MustExecutedJobSumOrderByAggregateInput = {
    JobId?: SortOrder
    LotId?: SortOrder
    BinId?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumFlagTypeFieldUpdateOperationsInput = {
    set?: $Enums.FlagType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumStatusJobFieldUpdateOperationsInput = {
    set?: $Enums.StatusJob
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumFlagTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FlagType | EnumFlagTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FlagType[]
    notIn?: $Enums.FlagType[]
    not?: NestedEnumFlagTypeFilter<$PrismaModel> | $Enums.FlagType
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumFlagTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FlagType | EnumFlagTypeFieldRefInput<$PrismaModel>
    in?: $Enums.FlagType[]
    notIn?: $Enums.FlagType[]
    not?: NestedEnumFlagTypeWithAggregatesFilter<$PrismaModel> | $Enums.FlagType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFlagTypeFilter<$PrismaModel>
    _max?: NestedEnumFlagTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumStatusJobFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJob | EnumStatusJobFieldRefInput<$PrismaModel>
    in?: $Enums.StatusJob[]
    notIn?: $Enums.StatusJob[]
    not?: NestedEnumStatusJobFilter<$PrismaModel> | $Enums.StatusJob
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumStatusJobWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJob | EnumStatusJobFieldRefInput<$PrismaModel>
    in?: $Enums.StatusJob[]
    notIn?: $Enums.StatusJob[]
    not?: NestedEnumStatusJobWithAggregatesFilter<$PrismaModel> | $Enums.StatusJob
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusJobFilter<$PrismaModel>
    _max?: NestedEnumStatusJobFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}