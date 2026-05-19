
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
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Official
 * 
 */
export type Official = $Result.DefaultSelection<Prisma.$OfficialPayload>
/**
 * Model Championship
 * 
 */
export type Championship = $Result.DefaultSelection<Prisma.$ChampionshipPayload>
/**
 * Model Stadium
 * 
 */
export type Stadium = $Result.DefaultSelection<Prisma.$StadiumPayload>
/**
 * Model Match
 * 
 */
export type Match = $Result.DefaultSelection<Prisma.$MatchPayload>
/**
 * Model MatchOfficial
 * 
 */
export type MatchOfficial = $Result.DefaultSelection<Prisma.$MatchOfficialPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const MatchStatus: {
  SCHEDULED: 'SCHEDULED',
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED'
};

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus]


export const OfficialRole: {
  DCO: 'DCO',
  ASSISTANT: 'ASSISTANT'
};

export type OfficialRole = (typeof OfficialRole)[keyof typeof OfficialRole]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type MatchStatus = $Enums.MatchStatus

export const MatchStatus: typeof $Enums.MatchStatus

export type OfficialRole = $Enums.OfficialRole

export const OfficialRole: typeof $Enums.OfficialRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
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
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
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
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.official`: Exposes CRUD operations for the **Official** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Officials
    * const officials = await prisma.official.findMany()
    * ```
    */
  get official(): Prisma.OfficialDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.championship`: Exposes CRUD operations for the **Championship** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Championships
    * const championships = await prisma.championship.findMany()
    * ```
    */
  get championship(): Prisma.ChampionshipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stadium`: Exposes CRUD operations for the **Stadium** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stadiums
    * const stadiums = await prisma.stadium.findMany()
    * ```
    */
  get stadium(): Prisma.StadiumDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.match`: Exposes CRUD operations for the **Match** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Matches
    * const matches = await prisma.match.findMany()
    * ```
    */
  get match(): Prisma.MatchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.matchOfficial`: Exposes CRUD operations for the **MatchOfficial** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MatchOfficials
    * const matchOfficials = await prisma.matchOfficial.findMany()
    * ```
    */
  get matchOfficial(): Prisma.MatchOfficialDelegate<ExtArgs, ClientOptions>;
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
    User: 'User',
    Official: 'Official',
    Championship: 'Championship',
    Stadium: 'Stadium',
    Match: 'Match',
    MatchOfficial: 'MatchOfficial'
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
      modelProps: "user" | "official" | "championship" | "stadium" | "match" | "matchOfficial"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Official: {
        payload: Prisma.$OfficialPayload<ExtArgs>
        fields: Prisma.OfficialFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OfficialFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OfficialFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          findFirst: {
            args: Prisma.OfficialFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OfficialFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          findMany: {
            args: Prisma.OfficialFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>[]
          }
          create: {
            args: Prisma.OfficialCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          createMany: {
            args: Prisma.OfficialCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OfficialCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>[]
          }
          delete: {
            args: Prisma.OfficialDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          update: {
            args: Prisma.OfficialUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          deleteMany: {
            args: Prisma.OfficialDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OfficialUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OfficialUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>[]
          }
          upsert: {
            args: Prisma.OfficialUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficialPayload>
          }
          aggregate: {
            args: Prisma.OfficialAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOfficial>
          }
          groupBy: {
            args: Prisma.OfficialGroupByArgs<ExtArgs>
            result: $Utils.Optional<OfficialGroupByOutputType>[]
          }
          count: {
            args: Prisma.OfficialCountArgs<ExtArgs>
            result: $Utils.Optional<OfficialCountAggregateOutputType> | number
          }
        }
      }
      Championship: {
        payload: Prisma.$ChampionshipPayload<ExtArgs>
        fields: Prisma.ChampionshipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChampionshipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChampionshipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          findFirst: {
            args: Prisma.ChampionshipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChampionshipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          findMany: {
            args: Prisma.ChampionshipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>[]
          }
          create: {
            args: Prisma.ChampionshipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          createMany: {
            args: Prisma.ChampionshipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChampionshipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>[]
          }
          delete: {
            args: Prisma.ChampionshipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          update: {
            args: Prisma.ChampionshipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          deleteMany: {
            args: Prisma.ChampionshipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChampionshipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChampionshipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>[]
          }
          upsert: {
            args: Prisma.ChampionshipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChampionshipPayload>
          }
          aggregate: {
            args: Prisma.ChampionshipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChampionship>
          }
          groupBy: {
            args: Prisma.ChampionshipGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChampionshipGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChampionshipCountArgs<ExtArgs>
            result: $Utils.Optional<ChampionshipCountAggregateOutputType> | number
          }
        }
      }
      Stadium: {
        payload: Prisma.$StadiumPayload<ExtArgs>
        fields: Prisma.StadiumFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StadiumFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StadiumFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          findFirst: {
            args: Prisma.StadiumFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StadiumFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          findMany: {
            args: Prisma.StadiumFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>[]
          }
          create: {
            args: Prisma.StadiumCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          createMany: {
            args: Prisma.StadiumCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StadiumCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>[]
          }
          delete: {
            args: Prisma.StadiumDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          update: {
            args: Prisma.StadiumUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          deleteMany: {
            args: Prisma.StadiumDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StadiumUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StadiumUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>[]
          }
          upsert: {
            args: Prisma.StadiumUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StadiumPayload>
          }
          aggregate: {
            args: Prisma.StadiumAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStadium>
          }
          groupBy: {
            args: Prisma.StadiumGroupByArgs<ExtArgs>
            result: $Utils.Optional<StadiumGroupByOutputType>[]
          }
          count: {
            args: Prisma.StadiumCountArgs<ExtArgs>
            result: $Utils.Optional<StadiumCountAggregateOutputType> | number
          }
        }
      }
      Match: {
        payload: Prisma.$MatchPayload<ExtArgs>
        fields: Prisma.MatchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MatchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MatchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          findFirst: {
            args: Prisma.MatchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MatchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          findMany: {
            args: Prisma.MatchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>[]
          }
          create: {
            args: Prisma.MatchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          createMany: {
            args: Prisma.MatchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MatchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>[]
          }
          delete: {
            args: Prisma.MatchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          update: {
            args: Prisma.MatchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          deleteMany: {
            args: Prisma.MatchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MatchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MatchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>[]
          }
          upsert: {
            args: Prisma.MatchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchPayload>
          }
          aggregate: {
            args: Prisma.MatchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMatch>
          }
          groupBy: {
            args: Prisma.MatchGroupByArgs<ExtArgs>
            result: $Utils.Optional<MatchGroupByOutputType>[]
          }
          count: {
            args: Prisma.MatchCountArgs<ExtArgs>
            result: $Utils.Optional<MatchCountAggregateOutputType> | number
          }
        }
      }
      MatchOfficial: {
        payload: Prisma.$MatchOfficialPayload<ExtArgs>
        fields: Prisma.MatchOfficialFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MatchOfficialFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MatchOfficialFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          findFirst: {
            args: Prisma.MatchOfficialFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MatchOfficialFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          findMany: {
            args: Prisma.MatchOfficialFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>[]
          }
          create: {
            args: Prisma.MatchOfficialCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          createMany: {
            args: Prisma.MatchOfficialCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MatchOfficialCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>[]
          }
          delete: {
            args: Prisma.MatchOfficialDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          update: {
            args: Prisma.MatchOfficialUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          deleteMany: {
            args: Prisma.MatchOfficialDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MatchOfficialUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MatchOfficialUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>[]
          }
          upsert: {
            args: Prisma.MatchOfficialUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchOfficialPayload>
          }
          aggregate: {
            args: Prisma.MatchOfficialAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMatchOfficial>
          }
          groupBy: {
            args: Prisma.MatchOfficialGroupByArgs<ExtArgs>
            result: $Utils.Optional<MatchOfficialGroupByOutputType>[]
          }
          count: {
            args: Prisma.MatchOfficialCountArgs<ExtArgs>
            result: $Utils.Optional<MatchOfficialCountAggregateOutputType> | number
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
    user?: UserOmit
    official?: OfficialOmit
    championship?: ChampionshipOmit
    stadium?: StadiumOmit
    match?: MatchOmit
    matchOfficial?: MatchOfficialOmit
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
   * Count Type OfficialCountOutputType
   */

  export type OfficialCountOutputType = {
    scales: number
  }

  export type OfficialCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    scales?: boolean | OfficialCountOutputTypeCountScalesArgs
  }

  // Custom InputTypes
  /**
   * OfficialCountOutputType without action
   */
  export type OfficialCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OfficialCountOutputType
     */
    select?: OfficialCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OfficialCountOutputType without action
   */
  export type OfficialCountOutputTypeCountScalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchOfficialWhereInput
  }


  /**
   * Count Type ChampionshipCountOutputType
   */

  export type ChampionshipCountOutputType = {
    matches: number
  }

  export type ChampionshipCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | ChampionshipCountOutputTypeCountMatchesArgs
  }

  // Custom InputTypes
  /**
   * ChampionshipCountOutputType without action
   */
  export type ChampionshipCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChampionshipCountOutputType
     */
    select?: ChampionshipCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChampionshipCountOutputType without action
   */
  export type ChampionshipCountOutputTypeCountMatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchWhereInput
  }


  /**
   * Count Type StadiumCountOutputType
   */

  export type StadiumCountOutputType = {
    matches: number
  }

  export type StadiumCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | StadiumCountOutputTypeCountMatchesArgs
  }

  // Custom InputTypes
  /**
   * StadiumCountOutputType without action
   */
  export type StadiumCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StadiumCountOutputType
     */
    select?: StadiumCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StadiumCountOutputType without action
   */
  export type StadiumCountOutputTypeCountMatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchWhereInput
  }


  /**
   * Count Type MatchCountOutputType
   */

  export type MatchCountOutputType = {
    officials: number
  }

  export type MatchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    officials?: boolean | MatchCountOutputTypeCountOfficialsArgs
  }

  // Custom InputTypes
  /**
   * MatchCountOutputType without action
   */
  export type MatchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchCountOutputType
     */
    select?: MatchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MatchCountOutputType without action
   */
  export type MatchCountOutputTypeCountOfficialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchOfficialWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    role: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    official?: boolean | User$officialArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    official?: boolean | User$officialArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      official: Prisma.$OfficialPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      role: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    official<T extends User$officialArgs<ExtArgs> = {}>(args?: Subset<T, User$officialArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.official
   */
  export type User$officialArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    where?: OfficialWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Official
   */

  export type AggregateOfficial = {
    _count: OfficialCountAggregateOutputType | null
    _min: OfficialMinAggregateOutputType | null
    _max: OfficialMaxAggregateOutputType | null
  }

  export type OfficialMinAggregateOutputType = {
    id: string | null
    userId: string | null
    phone: string | null
    pixKey: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfficialMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    phone: string | null
    pixKey: string | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OfficialCountAggregateOutputType = {
    id: number
    userId: number
    phone: number
    pixKey: number
    active: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OfficialMinAggregateInputType = {
    id?: true
    userId?: true
    phone?: true
    pixKey?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfficialMaxAggregateInputType = {
    id?: true
    userId?: true
    phone?: true
    pixKey?: true
    active?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OfficialCountAggregateInputType = {
    id?: true
    userId?: true
    phone?: true
    pixKey?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OfficialAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Official to aggregate.
     */
    where?: OfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Officials to fetch.
     */
    orderBy?: OfficialOrderByWithRelationInput | OfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Officials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Officials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Officials
    **/
    _count?: true | OfficialCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OfficialMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OfficialMaxAggregateInputType
  }

  export type GetOfficialAggregateType<T extends OfficialAggregateArgs> = {
        [P in keyof T & keyof AggregateOfficial]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOfficial[P]>
      : GetScalarType<T[P], AggregateOfficial[P]>
  }




  export type OfficialGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfficialWhereInput
    orderBy?: OfficialOrderByWithAggregationInput | OfficialOrderByWithAggregationInput[]
    by: OfficialScalarFieldEnum[] | OfficialScalarFieldEnum
    having?: OfficialScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OfficialCountAggregateInputType | true
    _min?: OfficialMinAggregateInputType
    _max?: OfficialMaxAggregateInputType
  }

  export type OfficialGroupByOutputType = {
    id: string
    userId: string
    phone: string | null
    pixKey: string | null
    active: boolean
    createdAt: Date
    updatedAt: Date
    _count: OfficialCountAggregateOutputType | null
    _min: OfficialMinAggregateOutputType | null
    _max: OfficialMaxAggregateOutputType | null
  }

  type GetOfficialGroupByPayload<T extends OfficialGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OfficialGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OfficialGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OfficialGroupByOutputType[P]>
            : GetScalarType<T[P], OfficialGroupByOutputType[P]>
        }
      >
    >


  export type OfficialSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phone?: boolean
    pixKey?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    scales?: boolean | Official$scalesArgs<ExtArgs>
    _count?: boolean | OfficialCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["official"]>

  export type OfficialSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phone?: boolean
    pixKey?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["official"]>

  export type OfficialSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phone?: boolean
    pixKey?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["official"]>

  export type OfficialSelectScalar = {
    id?: boolean
    userId?: boolean
    phone?: boolean
    pixKey?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OfficialOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "phone" | "pixKey" | "active" | "createdAt" | "updatedAt", ExtArgs["result"]["official"]>
  export type OfficialInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    scales?: boolean | Official$scalesArgs<ExtArgs>
    _count?: boolean | OfficialCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OfficialIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OfficialIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OfficialPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Official"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      scales: Prisma.$MatchOfficialPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      phone: string | null
      pixKey: string | null
      active: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["official"]>
    composites: {}
  }

  type OfficialGetPayload<S extends boolean | null | undefined | OfficialDefaultArgs> = $Result.GetResult<Prisma.$OfficialPayload, S>

  type OfficialCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OfficialFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OfficialCountAggregateInputType | true
    }

  export interface OfficialDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Official'], meta: { name: 'Official' } }
    /**
     * Find zero or one Official that matches the filter.
     * @param {OfficialFindUniqueArgs} args - Arguments to find a Official
     * @example
     * // Get one Official
     * const official = await prisma.official.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OfficialFindUniqueArgs>(args: SelectSubset<T, OfficialFindUniqueArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Official that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OfficialFindUniqueOrThrowArgs} args - Arguments to find a Official
     * @example
     * // Get one Official
     * const official = await prisma.official.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OfficialFindUniqueOrThrowArgs>(args: SelectSubset<T, OfficialFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Official that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialFindFirstArgs} args - Arguments to find a Official
     * @example
     * // Get one Official
     * const official = await prisma.official.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OfficialFindFirstArgs>(args?: SelectSubset<T, OfficialFindFirstArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Official that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialFindFirstOrThrowArgs} args - Arguments to find a Official
     * @example
     * // Get one Official
     * const official = await prisma.official.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OfficialFindFirstOrThrowArgs>(args?: SelectSubset<T, OfficialFindFirstOrThrowArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Officials that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Officials
     * const officials = await prisma.official.findMany()
     * 
     * // Get first 10 Officials
     * const officials = await prisma.official.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const officialWithIdOnly = await prisma.official.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OfficialFindManyArgs>(args?: SelectSubset<T, OfficialFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Official.
     * @param {OfficialCreateArgs} args - Arguments to create a Official.
     * @example
     * // Create one Official
     * const Official = await prisma.official.create({
     *   data: {
     *     // ... data to create a Official
     *   }
     * })
     * 
     */
    create<T extends OfficialCreateArgs>(args: SelectSubset<T, OfficialCreateArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Officials.
     * @param {OfficialCreateManyArgs} args - Arguments to create many Officials.
     * @example
     * // Create many Officials
     * const official = await prisma.official.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OfficialCreateManyArgs>(args?: SelectSubset<T, OfficialCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Officials and returns the data saved in the database.
     * @param {OfficialCreateManyAndReturnArgs} args - Arguments to create many Officials.
     * @example
     * // Create many Officials
     * const official = await prisma.official.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Officials and only return the `id`
     * const officialWithIdOnly = await prisma.official.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OfficialCreateManyAndReturnArgs>(args?: SelectSubset<T, OfficialCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Official.
     * @param {OfficialDeleteArgs} args - Arguments to delete one Official.
     * @example
     * // Delete one Official
     * const Official = await prisma.official.delete({
     *   where: {
     *     // ... filter to delete one Official
     *   }
     * })
     * 
     */
    delete<T extends OfficialDeleteArgs>(args: SelectSubset<T, OfficialDeleteArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Official.
     * @param {OfficialUpdateArgs} args - Arguments to update one Official.
     * @example
     * // Update one Official
     * const official = await prisma.official.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OfficialUpdateArgs>(args: SelectSubset<T, OfficialUpdateArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Officials.
     * @param {OfficialDeleteManyArgs} args - Arguments to filter Officials to delete.
     * @example
     * // Delete a few Officials
     * const { count } = await prisma.official.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OfficialDeleteManyArgs>(args?: SelectSubset<T, OfficialDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Officials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Officials
     * const official = await prisma.official.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OfficialUpdateManyArgs>(args: SelectSubset<T, OfficialUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Officials and returns the data updated in the database.
     * @param {OfficialUpdateManyAndReturnArgs} args - Arguments to update many Officials.
     * @example
     * // Update many Officials
     * const official = await prisma.official.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Officials and only return the `id`
     * const officialWithIdOnly = await prisma.official.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends OfficialUpdateManyAndReturnArgs>(args: SelectSubset<T, OfficialUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Official.
     * @param {OfficialUpsertArgs} args - Arguments to update or create a Official.
     * @example
     * // Update or create a Official
     * const official = await prisma.official.upsert({
     *   create: {
     *     // ... data to create a Official
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Official we want to update
     *   }
     * })
     */
    upsert<T extends OfficialUpsertArgs>(args: SelectSubset<T, OfficialUpsertArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Officials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialCountArgs} args - Arguments to filter Officials to count.
     * @example
     * // Count the number of Officials
     * const count = await prisma.official.count({
     *   where: {
     *     // ... the filter for the Officials we want to count
     *   }
     * })
    **/
    count<T extends OfficialCountArgs>(
      args?: Subset<T, OfficialCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OfficialCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Official.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OfficialAggregateArgs>(args: Subset<T, OfficialAggregateArgs>): Prisma.PrismaPromise<GetOfficialAggregateType<T>>

    /**
     * Group by Official.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficialGroupByArgs} args - Group by arguments.
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
      T extends OfficialGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OfficialGroupByArgs['orderBy'] }
        : { orderBy?: OfficialGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OfficialGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOfficialGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Official model
   */
  readonly fields: OfficialFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Official.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OfficialClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    scales<T extends Official$scalesArgs<ExtArgs> = {}>(args?: Subset<T, Official$scalesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Official model
   */
  interface OfficialFieldRefs {
    readonly id: FieldRef<"Official", 'String'>
    readonly userId: FieldRef<"Official", 'String'>
    readonly phone: FieldRef<"Official", 'String'>
    readonly pixKey: FieldRef<"Official", 'String'>
    readonly active: FieldRef<"Official", 'Boolean'>
    readonly createdAt: FieldRef<"Official", 'DateTime'>
    readonly updatedAt: FieldRef<"Official", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Official findUnique
   */
  export type OfficialFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter, which Official to fetch.
     */
    where: OfficialWhereUniqueInput
  }

  /**
   * Official findUniqueOrThrow
   */
  export type OfficialFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter, which Official to fetch.
     */
    where: OfficialWhereUniqueInput
  }

  /**
   * Official findFirst
   */
  export type OfficialFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter, which Official to fetch.
     */
    where?: OfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Officials to fetch.
     */
    orderBy?: OfficialOrderByWithRelationInput | OfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Officials.
     */
    cursor?: OfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Officials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Officials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Officials.
     */
    distinct?: OfficialScalarFieldEnum | OfficialScalarFieldEnum[]
  }

  /**
   * Official findFirstOrThrow
   */
  export type OfficialFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter, which Official to fetch.
     */
    where?: OfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Officials to fetch.
     */
    orderBy?: OfficialOrderByWithRelationInput | OfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Officials.
     */
    cursor?: OfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Officials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Officials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Officials.
     */
    distinct?: OfficialScalarFieldEnum | OfficialScalarFieldEnum[]
  }

  /**
   * Official findMany
   */
  export type OfficialFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter, which Officials to fetch.
     */
    where?: OfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Officials to fetch.
     */
    orderBy?: OfficialOrderByWithRelationInput | OfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Officials.
     */
    cursor?: OfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Officials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Officials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Officials.
     */
    distinct?: OfficialScalarFieldEnum | OfficialScalarFieldEnum[]
  }

  /**
   * Official create
   */
  export type OfficialCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * The data needed to create a Official.
     */
    data: XOR<OfficialCreateInput, OfficialUncheckedCreateInput>
  }

  /**
   * Official createMany
   */
  export type OfficialCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Officials.
     */
    data: OfficialCreateManyInput | OfficialCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Official createManyAndReturn
   */
  export type OfficialCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * The data used to create many Officials.
     */
    data: OfficialCreateManyInput | OfficialCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Official update
   */
  export type OfficialUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * The data needed to update a Official.
     */
    data: XOR<OfficialUpdateInput, OfficialUncheckedUpdateInput>
    /**
     * Choose, which Official to update.
     */
    where: OfficialWhereUniqueInput
  }

  /**
   * Official updateMany
   */
  export type OfficialUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Officials.
     */
    data: XOR<OfficialUpdateManyMutationInput, OfficialUncheckedUpdateManyInput>
    /**
     * Filter which Officials to update
     */
    where?: OfficialWhereInput
    /**
     * Limit how many Officials to update.
     */
    limit?: number
  }

  /**
   * Official updateManyAndReturn
   */
  export type OfficialUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * The data used to update Officials.
     */
    data: XOR<OfficialUpdateManyMutationInput, OfficialUncheckedUpdateManyInput>
    /**
     * Filter which Officials to update
     */
    where?: OfficialWhereInput
    /**
     * Limit how many Officials to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Official upsert
   */
  export type OfficialUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * The filter to search for the Official to update in case it exists.
     */
    where: OfficialWhereUniqueInput
    /**
     * In case the Official found by the `where` argument doesn't exist, create a new Official with this data.
     */
    create: XOR<OfficialCreateInput, OfficialUncheckedCreateInput>
    /**
     * In case the Official was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OfficialUpdateInput, OfficialUncheckedUpdateInput>
  }

  /**
   * Official delete
   */
  export type OfficialDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
    /**
     * Filter which Official to delete.
     */
    where: OfficialWhereUniqueInput
  }

  /**
   * Official deleteMany
   */
  export type OfficialDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Officials to delete
     */
    where?: OfficialWhereInput
    /**
     * Limit how many Officials to delete.
     */
    limit?: number
  }

  /**
   * Official.scales
   */
  export type Official$scalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    where?: MatchOfficialWhereInput
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    cursor?: MatchOfficialWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchOfficialScalarFieldEnum | MatchOfficialScalarFieldEnum[]
  }

  /**
   * Official without action
   */
  export type OfficialDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Official
     */
    select?: OfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Official
     */
    omit?: OfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficialInclude<ExtArgs> | null
  }


  /**
   * Model Championship
   */

  export type AggregateChampionship = {
    _count: ChampionshipCountAggregateOutputType | null
    _min: ChampionshipMinAggregateOutputType | null
    _max: ChampionshipMaxAggregateOutputType | null
  }

  export type ChampionshipMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChampionshipMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChampionshipCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChampionshipMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChampionshipMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChampionshipCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChampionshipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Championship to aggregate.
     */
    where?: ChampionshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Championships to fetch.
     */
    orderBy?: ChampionshipOrderByWithRelationInput | ChampionshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChampionshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Championships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Championships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Championships
    **/
    _count?: true | ChampionshipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChampionshipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChampionshipMaxAggregateInputType
  }

  export type GetChampionshipAggregateType<T extends ChampionshipAggregateArgs> = {
        [P in keyof T & keyof AggregateChampionship]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChampionship[P]>
      : GetScalarType<T[P], AggregateChampionship[P]>
  }




  export type ChampionshipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChampionshipWhereInput
    orderBy?: ChampionshipOrderByWithAggregationInput | ChampionshipOrderByWithAggregationInput[]
    by: ChampionshipScalarFieldEnum[] | ChampionshipScalarFieldEnum
    having?: ChampionshipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChampionshipCountAggregateInputType | true
    _min?: ChampionshipMinAggregateInputType
    _max?: ChampionshipMaxAggregateInputType
  }

  export type ChampionshipGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: ChampionshipCountAggregateOutputType | null
    _min: ChampionshipMinAggregateOutputType | null
    _max: ChampionshipMaxAggregateOutputType | null
  }

  type GetChampionshipGroupByPayload<T extends ChampionshipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChampionshipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChampionshipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChampionshipGroupByOutputType[P]>
            : GetScalarType<T[P], ChampionshipGroupByOutputType[P]>
        }
      >
    >


  export type ChampionshipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    matches?: boolean | Championship$matchesArgs<ExtArgs>
    _count?: boolean | ChampionshipCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["championship"]>

  export type ChampionshipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["championship"]>

  export type ChampionshipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["championship"]>

  export type ChampionshipSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChampionshipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["championship"]>
  export type ChampionshipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | Championship$matchesArgs<ExtArgs>
    _count?: boolean | ChampionshipCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ChampionshipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ChampionshipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ChampionshipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Championship"
    objects: {
      matches: Prisma.$MatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["championship"]>
    composites: {}
  }

  type ChampionshipGetPayload<S extends boolean | null | undefined | ChampionshipDefaultArgs> = $Result.GetResult<Prisma.$ChampionshipPayload, S>

  type ChampionshipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChampionshipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChampionshipCountAggregateInputType | true
    }

  export interface ChampionshipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Championship'], meta: { name: 'Championship' } }
    /**
     * Find zero or one Championship that matches the filter.
     * @param {ChampionshipFindUniqueArgs} args - Arguments to find a Championship
     * @example
     * // Get one Championship
     * const championship = await prisma.championship.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChampionshipFindUniqueArgs>(args: SelectSubset<T, ChampionshipFindUniqueArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Championship that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChampionshipFindUniqueOrThrowArgs} args - Arguments to find a Championship
     * @example
     * // Get one Championship
     * const championship = await prisma.championship.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChampionshipFindUniqueOrThrowArgs>(args: SelectSubset<T, ChampionshipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Championship that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipFindFirstArgs} args - Arguments to find a Championship
     * @example
     * // Get one Championship
     * const championship = await prisma.championship.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChampionshipFindFirstArgs>(args?: SelectSubset<T, ChampionshipFindFirstArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Championship that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipFindFirstOrThrowArgs} args - Arguments to find a Championship
     * @example
     * // Get one Championship
     * const championship = await prisma.championship.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChampionshipFindFirstOrThrowArgs>(args?: SelectSubset<T, ChampionshipFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Championships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Championships
     * const championships = await prisma.championship.findMany()
     * 
     * // Get first 10 Championships
     * const championships = await prisma.championship.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const championshipWithIdOnly = await prisma.championship.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChampionshipFindManyArgs>(args?: SelectSubset<T, ChampionshipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Championship.
     * @param {ChampionshipCreateArgs} args - Arguments to create a Championship.
     * @example
     * // Create one Championship
     * const Championship = await prisma.championship.create({
     *   data: {
     *     // ... data to create a Championship
     *   }
     * })
     * 
     */
    create<T extends ChampionshipCreateArgs>(args: SelectSubset<T, ChampionshipCreateArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Championships.
     * @param {ChampionshipCreateManyArgs} args - Arguments to create many Championships.
     * @example
     * // Create many Championships
     * const championship = await prisma.championship.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChampionshipCreateManyArgs>(args?: SelectSubset<T, ChampionshipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Championships and returns the data saved in the database.
     * @param {ChampionshipCreateManyAndReturnArgs} args - Arguments to create many Championships.
     * @example
     * // Create many Championships
     * const championship = await prisma.championship.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Championships and only return the `id`
     * const championshipWithIdOnly = await prisma.championship.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChampionshipCreateManyAndReturnArgs>(args?: SelectSubset<T, ChampionshipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Championship.
     * @param {ChampionshipDeleteArgs} args - Arguments to delete one Championship.
     * @example
     * // Delete one Championship
     * const Championship = await prisma.championship.delete({
     *   where: {
     *     // ... filter to delete one Championship
     *   }
     * })
     * 
     */
    delete<T extends ChampionshipDeleteArgs>(args: SelectSubset<T, ChampionshipDeleteArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Championship.
     * @param {ChampionshipUpdateArgs} args - Arguments to update one Championship.
     * @example
     * // Update one Championship
     * const championship = await prisma.championship.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChampionshipUpdateArgs>(args: SelectSubset<T, ChampionshipUpdateArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Championships.
     * @param {ChampionshipDeleteManyArgs} args - Arguments to filter Championships to delete.
     * @example
     * // Delete a few Championships
     * const { count } = await prisma.championship.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChampionshipDeleteManyArgs>(args?: SelectSubset<T, ChampionshipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Championships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Championships
     * const championship = await prisma.championship.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChampionshipUpdateManyArgs>(args: SelectSubset<T, ChampionshipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Championships and returns the data updated in the database.
     * @param {ChampionshipUpdateManyAndReturnArgs} args - Arguments to update many Championships.
     * @example
     * // Update many Championships
     * const championship = await prisma.championship.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Championships and only return the `id`
     * const championshipWithIdOnly = await prisma.championship.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends ChampionshipUpdateManyAndReturnArgs>(args: SelectSubset<T, ChampionshipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Championship.
     * @param {ChampionshipUpsertArgs} args - Arguments to update or create a Championship.
     * @example
     * // Update or create a Championship
     * const championship = await prisma.championship.upsert({
     *   create: {
     *     // ... data to create a Championship
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Championship we want to update
     *   }
     * })
     */
    upsert<T extends ChampionshipUpsertArgs>(args: SelectSubset<T, ChampionshipUpsertArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Championships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipCountArgs} args - Arguments to filter Championships to count.
     * @example
     * // Count the number of Championships
     * const count = await prisma.championship.count({
     *   where: {
     *     // ... the filter for the Championships we want to count
     *   }
     * })
    **/
    count<T extends ChampionshipCountArgs>(
      args?: Subset<T, ChampionshipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChampionshipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Championship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ChampionshipAggregateArgs>(args: Subset<T, ChampionshipAggregateArgs>): Prisma.PrismaPromise<GetChampionshipAggregateType<T>>

    /**
     * Group by Championship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChampionshipGroupByArgs} args - Group by arguments.
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
      T extends ChampionshipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChampionshipGroupByArgs['orderBy'] }
        : { orderBy?: ChampionshipGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ChampionshipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChampionshipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Championship model
   */
  readonly fields: ChampionshipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Championship.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChampionshipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    matches<T extends Championship$matchesArgs<ExtArgs> = {}>(args?: Subset<T, Championship$matchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Championship model
   */
  interface ChampionshipFieldRefs {
    readonly id: FieldRef<"Championship", 'String'>
    readonly name: FieldRef<"Championship", 'String'>
    readonly createdAt: FieldRef<"Championship", 'DateTime'>
    readonly updatedAt: FieldRef<"Championship", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Championship findUnique
   */
  export type ChampionshipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter, which Championship to fetch.
     */
    where: ChampionshipWhereUniqueInput
  }

  /**
   * Championship findUniqueOrThrow
   */
  export type ChampionshipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter, which Championship to fetch.
     */
    where: ChampionshipWhereUniqueInput
  }

  /**
   * Championship findFirst
   */
  export type ChampionshipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter, which Championship to fetch.
     */
    where?: ChampionshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Championships to fetch.
     */
    orderBy?: ChampionshipOrderByWithRelationInput | ChampionshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Championships.
     */
    cursor?: ChampionshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Championships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Championships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Championships.
     */
    distinct?: ChampionshipScalarFieldEnum | ChampionshipScalarFieldEnum[]
  }

  /**
   * Championship findFirstOrThrow
   */
  export type ChampionshipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter, which Championship to fetch.
     */
    where?: ChampionshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Championships to fetch.
     */
    orderBy?: ChampionshipOrderByWithRelationInput | ChampionshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Championships.
     */
    cursor?: ChampionshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Championships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Championships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Championships.
     */
    distinct?: ChampionshipScalarFieldEnum | ChampionshipScalarFieldEnum[]
  }

  /**
   * Championship findMany
   */
  export type ChampionshipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter, which Championships to fetch.
     */
    where?: ChampionshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Championships to fetch.
     */
    orderBy?: ChampionshipOrderByWithRelationInput | ChampionshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Championships.
     */
    cursor?: ChampionshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Championships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Championships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Championships.
     */
    distinct?: ChampionshipScalarFieldEnum | ChampionshipScalarFieldEnum[]
  }

  /**
   * Championship create
   */
  export type ChampionshipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * The data needed to create a Championship.
     */
    data: XOR<ChampionshipCreateInput, ChampionshipUncheckedCreateInput>
  }

  /**
   * Championship createMany
   */
  export type ChampionshipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Championships.
     */
    data: ChampionshipCreateManyInput | ChampionshipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Championship createManyAndReturn
   */
  export type ChampionshipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * The data used to create many Championships.
     */
    data: ChampionshipCreateManyInput | ChampionshipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Championship update
   */
  export type ChampionshipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * The data needed to update a Championship.
     */
    data: XOR<ChampionshipUpdateInput, ChampionshipUncheckedUpdateInput>
    /**
     * Choose, which Championship to update.
     */
    where: ChampionshipWhereUniqueInput
  }

  /**
   * Championship updateMany
   */
  export type ChampionshipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Championships.
     */
    data: XOR<ChampionshipUpdateManyMutationInput, ChampionshipUncheckedUpdateManyInput>
    /**
     * Filter which Championships to update
     */
    where?: ChampionshipWhereInput
    /**
     * Limit how many Championships to update.
     */
    limit?: number
  }

  /**
   * Championship updateManyAndReturn
   */
  export type ChampionshipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * The data used to update Championships.
     */
    data: XOR<ChampionshipUpdateManyMutationInput, ChampionshipUncheckedUpdateManyInput>
    /**
     * Filter which Championships to update
     */
    where?: ChampionshipWhereInput
    /**
     * Limit how many Championships to update.
     */
    limit?: number
  }

  /**
   * Championship upsert
   */
  export type ChampionshipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * The filter to search for the Championship to update in case it exists.
     */
    where: ChampionshipWhereUniqueInput
    /**
     * In case the Championship found by the `where` argument doesn't exist, create a new Championship with this data.
     */
    create: XOR<ChampionshipCreateInput, ChampionshipUncheckedCreateInput>
    /**
     * In case the Championship was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChampionshipUpdateInput, ChampionshipUncheckedUpdateInput>
  }

  /**
   * Championship delete
   */
  export type ChampionshipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
    /**
     * Filter which Championship to delete.
     */
    where: ChampionshipWhereUniqueInput
  }

  /**
   * Championship deleteMany
   */
  export type ChampionshipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Championships to delete
     */
    where?: ChampionshipWhereInput
    /**
     * Limit how many Championships to delete.
     */
    limit?: number
  }

  /**
   * Championship.matches
   */
  export type Championship$matchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    where?: MatchWhereInput
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    cursor?: MatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchScalarFieldEnum | MatchScalarFieldEnum[]
  }

  /**
   * Championship without action
   */
  export type ChampionshipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Championship
     */
    select?: ChampionshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Championship
     */
    omit?: ChampionshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChampionshipInclude<ExtArgs> | null
  }


  /**
   * Model Stadium
   */

  export type AggregateStadium = {
    _count: StadiumCountAggregateOutputType | null
    _min: StadiumMinAggregateOutputType | null
    _max: StadiumMaxAggregateOutputType | null
  }

  export type StadiumMinAggregateOutputType = {
    id: string | null
    name: string | null
    city: string | null
    state: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StadiumMaxAggregateOutputType = {
    id: string | null
    name: string | null
    city: string | null
    state: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StadiumCountAggregateOutputType = {
    id: number
    name: number
    city: number
    state: number
    address: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StadiumMinAggregateInputType = {
    id?: true
    name?: true
    city?: true
    state?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StadiumMaxAggregateInputType = {
    id?: true
    name?: true
    city?: true
    state?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StadiumCountAggregateInputType = {
    id?: true
    name?: true
    city?: true
    state?: true
    address?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StadiumAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stadium to aggregate.
     */
    where?: StadiumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stadiums to fetch.
     */
    orderBy?: StadiumOrderByWithRelationInput | StadiumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StadiumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stadiums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stadiums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stadiums
    **/
    _count?: true | StadiumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StadiumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StadiumMaxAggregateInputType
  }

  export type GetStadiumAggregateType<T extends StadiumAggregateArgs> = {
        [P in keyof T & keyof AggregateStadium]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStadium[P]>
      : GetScalarType<T[P], AggregateStadium[P]>
  }




  export type StadiumGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StadiumWhereInput
    orderBy?: StadiumOrderByWithAggregationInput | StadiumOrderByWithAggregationInput[]
    by: StadiumScalarFieldEnum[] | StadiumScalarFieldEnum
    having?: StadiumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StadiumCountAggregateInputType | true
    _min?: StadiumMinAggregateInputType
    _max?: StadiumMaxAggregateInputType
  }

  export type StadiumGroupByOutputType = {
    id: string
    name: string
    city: string
    state: string
    address: string | null
    createdAt: Date
    updatedAt: Date
    _count: StadiumCountAggregateOutputType | null
    _min: StadiumMinAggregateOutputType | null
    _max: StadiumMaxAggregateOutputType | null
  }

  type GetStadiumGroupByPayload<T extends StadiumGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StadiumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StadiumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StadiumGroupByOutputType[P]>
            : GetScalarType<T[P], StadiumGroupByOutputType[P]>
        }
      >
    >


  export type StadiumSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    city?: boolean
    state?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    matches?: boolean | Stadium$matchesArgs<ExtArgs>
    _count?: boolean | StadiumCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stadium"]>

  export type StadiumSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    city?: boolean
    state?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stadium"]>

  export type StadiumSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    city?: boolean
    state?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stadium"]>

  export type StadiumSelectScalar = {
    id?: boolean
    name?: boolean
    city?: boolean
    state?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StadiumOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "city" | "state" | "address" | "createdAt" | "updatedAt", ExtArgs["result"]["stadium"]>
  export type StadiumInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    matches?: boolean | Stadium$matchesArgs<ExtArgs>
    _count?: boolean | StadiumCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StadiumIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type StadiumIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $StadiumPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Stadium"
    objects: {
      matches: Prisma.$MatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      city: string
      state: string
      address: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stadium"]>
    composites: {}
  }

  type StadiumGetPayload<S extends boolean | null | undefined | StadiumDefaultArgs> = $Result.GetResult<Prisma.$StadiumPayload, S>

  type StadiumCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StadiumFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StadiumCountAggregateInputType | true
    }

  export interface StadiumDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Stadium'], meta: { name: 'Stadium' } }
    /**
     * Find zero or one Stadium that matches the filter.
     * @param {StadiumFindUniqueArgs} args - Arguments to find a Stadium
     * @example
     * // Get one Stadium
     * const stadium = await prisma.stadium.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StadiumFindUniqueArgs>(args: SelectSubset<T, StadiumFindUniqueArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Stadium that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StadiumFindUniqueOrThrowArgs} args - Arguments to find a Stadium
     * @example
     * // Get one Stadium
     * const stadium = await prisma.stadium.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StadiumFindUniqueOrThrowArgs>(args: SelectSubset<T, StadiumFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stadium that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumFindFirstArgs} args - Arguments to find a Stadium
     * @example
     * // Get one Stadium
     * const stadium = await prisma.stadium.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StadiumFindFirstArgs>(args?: SelectSubset<T, StadiumFindFirstArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stadium that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumFindFirstOrThrowArgs} args - Arguments to find a Stadium
     * @example
     * // Get one Stadium
     * const stadium = await prisma.stadium.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StadiumFindFirstOrThrowArgs>(args?: SelectSubset<T, StadiumFindFirstOrThrowArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Stadiums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stadiums
     * const stadiums = await prisma.stadium.findMany()
     * 
     * // Get first 10 Stadiums
     * const stadiums = await prisma.stadium.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stadiumWithIdOnly = await prisma.stadium.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StadiumFindManyArgs>(args?: SelectSubset<T, StadiumFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Stadium.
     * @param {StadiumCreateArgs} args - Arguments to create a Stadium.
     * @example
     * // Create one Stadium
     * const Stadium = await prisma.stadium.create({
     *   data: {
     *     // ... data to create a Stadium
     *   }
     * })
     * 
     */
    create<T extends StadiumCreateArgs>(args: SelectSubset<T, StadiumCreateArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Stadiums.
     * @param {StadiumCreateManyArgs} args - Arguments to create many Stadiums.
     * @example
     * // Create many Stadiums
     * const stadium = await prisma.stadium.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StadiumCreateManyArgs>(args?: SelectSubset<T, StadiumCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stadiums and returns the data saved in the database.
     * @param {StadiumCreateManyAndReturnArgs} args - Arguments to create many Stadiums.
     * @example
     * // Create many Stadiums
     * const stadium = await prisma.stadium.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stadiums and only return the `id`
     * const stadiumWithIdOnly = await prisma.stadium.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StadiumCreateManyAndReturnArgs>(args?: SelectSubset<T, StadiumCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Stadium.
     * @param {StadiumDeleteArgs} args - Arguments to delete one Stadium.
     * @example
     * // Delete one Stadium
     * const Stadium = await prisma.stadium.delete({
     *   where: {
     *     // ... filter to delete one Stadium
     *   }
     * })
     * 
     */
    delete<T extends StadiumDeleteArgs>(args: SelectSubset<T, StadiumDeleteArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Stadium.
     * @param {StadiumUpdateArgs} args - Arguments to update one Stadium.
     * @example
     * // Update one Stadium
     * const stadium = await prisma.stadium.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StadiumUpdateArgs>(args: SelectSubset<T, StadiumUpdateArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Stadiums.
     * @param {StadiumDeleteManyArgs} args - Arguments to filter Stadiums to delete.
     * @example
     * // Delete a few Stadiums
     * const { count } = await prisma.stadium.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StadiumDeleteManyArgs>(args?: SelectSubset<T, StadiumDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stadiums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stadiums
     * const stadium = await prisma.stadium.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StadiumUpdateManyArgs>(args: SelectSubset<T, StadiumUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stadiums and returns the data updated in the database.
     * @param {StadiumUpdateManyAndReturnArgs} args - Arguments to update many Stadiums.
     * @example
     * // Update many Stadiums
     * const stadium = await prisma.stadium.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Stadiums and only return the `id`
     * const stadiumWithIdOnly = await prisma.stadium.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends StadiumUpdateManyAndReturnArgs>(args: SelectSubset<T, StadiumUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Stadium.
     * @param {StadiumUpsertArgs} args - Arguments to update or create a Stadium.
     * @example
     * // Update or create a Stadium
     * const stadium = await prisma.stadium.upsert({
     *   create: {
     *     // ... data to create a Stadium
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stadium we want to update
     *   }
     * })
     */
    upsert<T extends StadiumUpsertArgs>(args: SelectSubset<T, StadiumUpsertArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Stadiums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumCountArgs} args - Arguments to filter Stadiums to count.
     * @example
     * // Count the number of Stadiums
     * const count = await prisma.stadium.count({
     *   where: {
     *     // ... the filter for the Stadiums we want to count
     *   }
     * })
    **/
    count<T extends StadiumCountArgs>(
      args?: Subset<T, StadiumCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StadiumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stadium.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StadiumAggregateArgs>(args: Subset<T, StadiumAggregateArgs>): Prisma.PrismaPromise<GetStadiumAggregateType<T>>

    /**
     * Group by Stadium.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StadiumGroupByArgs} args - Group by arguments.
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
      T extends StadiumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StadiumGroupByArgs['orderBy'] }
        : { orderBy?: StadiumGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StadiumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStadiumGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Stadium model
   */
  readonly fields: StadiumFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Stadium.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StadiumClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    matches<T extends Stadium$matchesArgs<ExtArgs> = {}>(args?: Subset<T, Stadium$matchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Stadium model
   */
  interface StadiumFieldRefs {
    readonly id: FieldRef<"Stadium", 'String'>
    readonly name: FieldRef<"Stadium", 'String'>
    readonly city: FieldRef<"Stadium", 'String'>
    readonly state: FieldRef<"Stadium", 'String'>
    readonly address: FieldRef<"Stadium", 'String'>
    readonly createdAt: FieldRef<"Stadium", 'DateTime'>
    readonly updatedAt: FieldRef<"Stadium", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Stadium findUnique
   */
  export type StadiumFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter, which Stadium to fetch.
     */
    where: StadiumWhereUniqueInput
  }

  /**
   * Stadium findUniqueOrThrow
   */
  export type StadiumFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter, which Stadium to fetch.
     */
    where: StadiumWhereUniqueInput
  }

  /**
   * Stadium findFirst
   */
  export type StadiumFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter, which Stadium to fetch.
     */
    where?: StadiumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stadiums to fetch.
     */
    orderBy?: StadiumOrderByWithRelationInput | StadiumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stadiums.
     */
    cursor?: StadiumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stadiums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stadiums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stadiums.
     */
    distinct?: StadiumScalarFieldEnum | StadiumScalarFieldEnum[]
  }

  /**
   * Stadium findFirstOrThrow
   */
  export type StadiumFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter, which Stadium to fetch.
     */
    where?: StadiumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stadiums to fetch.
     */
    orderBy?: StadiumOrderByWithRelationInput | StadiumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stadiums.
     */
    cursor?: StadiumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stadiums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stadiums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stadiums.
     */
    distinct?: StadiumScalarFieldEnum | StadiumScalarFieldEnum[]
  }

  /**
   * Stadium findMany
   */
  export type StadiumFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter, which Stadiums to fetch.
     */
    where?: StadiumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stadiums to fetch.
     */
    orderBy?: StadiumOrderByWithRelationInput | StadiumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stadiums.
     */
    cursor?: StadiumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stadiums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stadiums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stadiums.
     */
    distinct?: StadiumScalarFieldEnum | StadiumScalarFieldEnum[]
  }

  /**
   * Stadium create
   */
  export type StadiumCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * The data needed to create a Stadium.
     */
    data: XOR<StadiumCreateInput, StadiumUncheckedCreateInput>
  }

  /**
   * Stadium createMany
   */
  export type StadiumCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stadiums.
     */
    data: StadiumCreateManyInput | StadiumCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stadium createManyAndReturn
   */
  export type StadiumCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * The data used to create many Stadiums.
     */
    data: StadiumCreateManyInput | StadiumCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stadium update
   */
  export type StadiumUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * The data needed to update a Stadium.
     */
    data: XOR<StadiumUpdateInput, StadiumUncheckedUpdateInput>
    /**
     * Choose, which Stadium to update.
     */
    where: StadiumWhereUniqueInput
  }

  /**
   * Stadium updateMany
   */
  export type StadiumUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stadiums.
     */
    data: XOR<StadiumUpdateManyMutationInput, StadiumUncheckedUpdateManyInput>
    /**
     * Filter which Stadiums to update
     */
    where?: StadiumWhereInput
    /**
     * Limit how many Stadiums to update.
     */
    limit?: number
  }

  /**
   * Stadium updateManyAndReturn
   */
  export type StadiumUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * The data used to update Stadiums.
     */
    data: XOR<StadiumUpdateManyMutationInput, StadiumUncheckedUpdateManyInput>
    /**
     * Filter which Stadiums to update
     */
    where?: StadiumWhereInput
    /**
     * Limit how many Stadiums to update.
     */
    limit?: number
  }

  /**
   * Stadium upsert
   */
  export type StadiumUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * The filter to search for the Stadium to update in case it exists.
     */
    where: StadiumWhereUniqueInput
    /**
     * In case the Stadium found by the `where` argument doesn't exist, create a new Stadium with this data.
     */
    create: XOR<StadiumCreateInput, StadiumUncheckedCreateInput>
    /**
     * In case the Stadium was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StadiumUpdateInput, StadiumUncheckedUpdateInput>
  }

  /**
   * Stadium delete
   */
  export type StadiumDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
    /**
     * Filter which Stadium to delete.
     */
    where: StadiumWhereUniqueInput
  }

  /**
   * Stadium deleteMany
   */
  export type StadiumDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stadiums to delete
     */
    where?: StadiumWhereInput
    /**
     * Limit how many Stadiums to delete.
     */
    limit?: number
  }

  /**
   * Stadium.matches
   */
  export type Stadium$matchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    where?: MatchWhereInput
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    cursor?: MatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchScalarFieldEnum | MatchScalarFieldEnum[]
  }

  /**
   * Stadium without action
   */
  export type StadiumDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stadium
     */
    select?: StadiumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stadium
     */
    omit?: StadiumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StadiumInclude<ExtArgs> | null
  }


  /**
   * Model Match
   */

  export type AggregateMatch = {
    _count: MatchCountAggregateOutputType | null
    _min: MatchMinAggregateOutputType | null
    _max: MatchMaxAggregateOutputType | null
  }

  export type MatchMinAggregateOutputType = {
    id: string | null
    championshipId: string | null
    stadiumId: string | null
    homeTeam: string | null
    awayTeam: string | null
    matchDate: Date | null
    status: $Enums.MatchStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MatchMaxAggregateOutputType = {
    id: string | null
    championshipId: string | null
    stadiumId: string | null
    homeTeam: string | null
    awayTeam: string | null
    matchDate: Date | null
    status: $Enums.MatchStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MatchCountAggregateOutputType = {
    id: number
    championshipId: number
    stadiumId: number
    homeTeam: number
    awayTeam: number
    matchDate: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MatchMinAggregateInputType = {
    id?: true
    championshipId?: true
    stadiumId?: true
    homeTeam?: true
    awayTeam?: true
    matchDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MatchMaxAggregateInputType = {
    id?: true
    championshipId?: true
    stadiumId?: true
    homeTeam?: true
    awayTeam?: true
    matchDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MatchCountAggregateInputType = {
    id?: true
    championshipId?: true
    stadiumId?: true
    homeTeam?: true
    awayTeam?: true
    matchDate?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MatchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Match to aggregate.
     */
    where?: MatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Matches to fetch.
     */
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Matches
    **/
    _count?: true | MatchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MatchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MatchMaxAggregateInputType
  }

  export type GetMatchAggregateType<T extends MatchAggregateArgs> = {
        [P in keyof T & keyof AggregateMatch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMatch[P]>
      : GetScalarType<T[P], AggregateMatch[P]>
  }




  export type MatchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchWhereInput
    orderBy?: MatchOrderByWithAggregationInput | MatchOrderByWithAggregationInput[]
    by: MatchScalarFieldEnum[] | MatchScalarFieldEnum
    having?: MatchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MatchCountAggregateInputType | true
    _min?: MatchMinAggregateInputType
    _max?: MatchMaxAggregateInputType
  }

  export type MatchGroupByOutputType = {
    id: string
    championshipId: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date
    status: $Enums.MatchStatus
    createdAt: Date
    updatedAt: Date
    _count: MatchCountAggregateOutputType | null
    _min: MatchMinAggregateOutputType | null
    _max: MatchMaxAggregateOutputType | null
  }

  type GetMatchGroupByPayload<T extends MatchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MatchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MatchGroupByOutputType[P]>
            : GetScalarType<T[P], MatchGroupByOutputType[P]>
        }
      >
    >


  export type MatchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    championshipId?: boolean
    stadiumId?: boolean
    homeTeam?: boolean
    awayTeam?: boolean
    matchDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
    officials?: boolean | Match$officialsArgs<ExtArgs>
    _count?: boolean | MatchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["match"]>

  export type MatchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    championshipId?: boolean
    stadiumId?: boolean
    homeTeam?: boolean
    awayTeam?: boolean
    matchDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["match"]>

  export type MatchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    championshipId?: boolean
    stadiumId?: boolean
    homeTeam?: boolean
    awayTeam?: boolean
    matchDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["match"]>

  export type MatchSelectScalar = {
    id?: boolean
    championshipId?: boolean
    stadiumId?: boolean
    homeTeam?: boolean
    awayTeam?: boolean
    matchDate?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MatchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "championshipId" | "stadiumId" | "homeTeam" | "awayTeam" | "matchDate" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["match"]>
  export type MatchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
    officials?: boolean | Match$officialsArgs<ExtArgs>
    _count?: boolean | MatchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MatchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
  }
  export type MatchIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    championship?: boolean | ChampionshipDefaultArgs<ExtArgs>
    stadium?: boolean | StadiumDefaultArgs<ExtArgs>
  }

  export type $MatchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Match"
    objects: {
      championship: Prisma.$ChampionshipPayload<ExtArgs>
      stadium: Prisma.$StadiumPayload<ExtArgs>
      officials: Prisma.$MatchOfficialPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      championshipId: string
      stadiumId: string
      homeTeam: string
      awayTeam: string
      matchDate: Date
      status: $Enums.MatchStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["match"]>
    composites: {}
  }

  type MatchGetPayload<S extends boolean | null | undefined | MatchDefaultArgs> = $Result.GetResult<Prisma.$MatchPayload, S>

  type MatchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MatchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MatchCountAggregateInputType | true
    }

  export interface MatchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Match'], meta: { name: 'Match' } }
    /**
     * Find zero or one Match that matches the filter.
     * @param {MatchFindUniqueArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatchFindUniqueArgs>(args: SelectSubset<T, MatchFindUniqueArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Match that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatchFindUniqueOrThrowArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatchFindUniqueOrThrowArgs>(args: SelectSubset<T, MatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Match that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindFirstArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatchFindFirstArgs>(args?: SelectSubset<T, MatchFindFirstArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Match that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindFirstOrThrowArgs} args - Arguments to find a Match
     * @example
     * // Get one Match
     * const match = await prisma.match.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatchFindFirstOrThrowArgs>(args?: SelectSubset<T, MatchFindFirstOrThrowArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Matches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Matches
     * const matches = await prisma.match.findMany()
     * 
     * // Get first 10 Matches
     * const matches = await prisma.match.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const matchWithIdOnly = await prisma.match.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MatchFindManyArgs>(args?: SelectSubset<T, MatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Match.
     * @param {MatchCreateArgs} args - Arguments to create a Match.
     * @example
     * // Create one Match
     * const Match = await prisma.match.create({
     *   data: {
     *     // ... data to create a Match
     *   }
     * })
     * 
     */
    create<T extends MatchCreateArgs>(args: SelectSubset<T, MatchCreateArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Matches.
     * @param {MatchCreateManyArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const match = await prisma.match.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MatchCreateManyArgs>(args?: SelectSubset<T, MatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Matches and returns the data saved in the database.
     * @param {MatchCreateManyAndReturnArgs} args - Arguments to create many Matches.
     * @example
     * // Create many Matches
     * const match = await prisma.match.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Matches and only return the `id`
     * const matchWithIdOnly = await prisma.match.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MatchCreateManyAndReturnArgs>(args?: SelectSubset<T, MatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Match.
     * @param {MatchDeleteArgs} args - Arguments to delete one Match.
     * @example
     * // Delete one Match
     * const Match = await prisma.match.delete({
     *   where: {
     *     // ... filter to delete one Match
     *   }
     * })
     * 
     */
    delete<T extends MatchDeleteArgs>(args: SelectSubset<T, MatchDeleteArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Match.
     * @param {MatchUpdateArgs} args - Arguments to update one Match.
     * @example
     * // Update one Match
     * const match = await prisma.match.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MatchUpdateArgs>(args: SelectSubset<T, MatchUpdateArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Matches.
     * @param {MatchDeleteManyArgs} args - Arguments to filter Matches to delete.
     * @example
     * // Delete a few Matches
     * const { count } = await prisma.match.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MatchDeleteManyArgs>(args?: SelectSubset<T, MatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Matches
     * const match = await prisma.match.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MatchUpdateManyArgs>(args: SelectSubset<T, MatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Matches and returns the data updated in the database.
     * @param {MatchUpdateManyAndReturnArgs} args - Arguments to update many Matches.
     * @example
     * // Update many Matches
     * const match = await prisma.match.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Matches and only return the `id`
     * const matchWithIdOnly = await prisma.match.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends MatchUpdateManyAndReturnArgs>(args: SelectSubset<T, MatchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Match.
     * @param {MatchUpsertArgs} args - Arguments to update or create a Match.
     * @example
     * // Update or create a Match
     * const match = await prisma.match.upsert({
     *   create: {
     *     // ... data to create a Match
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Match we want to update
     *   }
     * })
     */
    upsert<T extends MatchUpsertArgs>(args: SelectSubset<T, MatchUpsertArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Matches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchCountArgs} args - Arguments to filter Matches to count.
     * @example
     * // Count the number of Matches
     * const count = await prisma.match.count({
     *   where: {
     *     // ... the filter for the Matches we want to count
     *   }
     * })
    **/
    count<T extends MatchCountArgs>(
      args?: Subset<T, MatchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Match.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MatchAggregateArgs>(args: Subset<T, MatchAggregateArgs>): Prisma.PrismaPromise<GetMatchAggregateType<T>>

    /**
     * Group by Match.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchGroupByArgs} args - Group by arguments.
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
      T extends MatchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MatchGroupByArgs['orderBy'] }
        : { orderBy?: MatchGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Match model
   */
  readonly fields: MatchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Match.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MatchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    championship<T extends ChampionshipDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChampionshipDefaultArgs<ExtArgs>>): Prisma__ChampionshipClient<$Result.GetResult<Prisma.$ChampionshipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    stadium<T extends StadiumDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StadiumDefaultArgs<ExtArgs>>): Prisma__StadiumClient<$Result.GetResult<Prisma.$StadiumPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    officials<T extends Match$officialsArgs<ExtArgs> = {}>(args?: Subset<T, Match$officialsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Match model
   */
  interface MatchFieldRefs {
    readonly id: FieldRef<"Match", 'String'>
    readonly championshipId: FieldRef<"Match", 'String'>
    readonly stadiumId: FieldRef<"Match", 'String'>
    readonly homeTeam: FieldRef<"Match", 'String'>
    readonly awayTeam: FieldRef<"Match", 'String'>
    readonly matchDate: FieldRef<"Match", 'DateTime'>
    readonly status: FieldRef<"Match", 'MatchStatus'>
    readonly createdAt: FieldRef<"Match", 'DateTime'>
    readonly updatedAt: FieldRef<"Match", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Match findUnique
   */
  export type MatchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter, which Match to fetch.
     */
    where: MatchWhereUniqueInput
  }

  /**
   * Match findUniqueOrThrow
   */
  export type MatchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter, which Match to fetch.
     */
    where: MatchWhereUniqueInput
  }

  /**
   * Match findFirst
   */
  export type MatchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter, which Match to fetch.
     */
    where?: MatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Matches to fetch.
     */
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Matches.
     */
    cursor?: MatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Matches.
     */
    distinct?: MatchScalarFieldEnum | MatchScalarFieldEnum[]
  }

  /**
   * Match findFirstOrThrow
   */
  export type MatchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter, which Match to fetch.
     */
    where?: MatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Matches to fetch.
     */
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Matches.
     */
    cursor?: MatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Matches.
     */
    distinct?: MatchScalarFieldEnum | MatchScalarFieldEnum[]
  }

  /**
   * Match findMany
   */
  export type MatchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter, which Matches to fetch.
     */
    where?: MatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Matches to fetch.
     */
    orderBy?: MatchOrderByWithRelationInput | MatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Matches.
     */
    cursor?: MatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Matches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Matches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Matches.
     */
    distinct?: MatchScalarFieldEnum | MatchScalarFieldEnum[]
  }

  /**
   * Match create
   */
  export type MatchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * The data needed to create a Match.
     */
    data: XOR<MatchCreateInput, MatchUncheckedCreateInput>
  }

  /**
   * Match createMany
   */
  export type MatchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Matches.
     */
    data: MatchCreateManyInput | MatchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Match createManyAndReturn
   */
  export type MatchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * The data used to create many Matches.
     */
    data: MatchCreateManyInput | MatchCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Match update
   */
  export type MatchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * The data needed to update a Match.
     */
    data: XOR<MatchUpdateInput, MatchUncheckedUpdateInput>
    /**
     * Choose, which Match to update.
     */
    where: MatchWhereUniqueInput
  }

  /**
   * Match updateMany
   */
  export type MatchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Matches.
     */
    data: XOR<MatchUpdateManyMutationInput, MatchUncheckedUpdateManyInput>
    /**
     * Filter which Matches to update
     */
    where?: MatchWhereInput
    /**
     * Limit how many Matches to update.
     */
    limit?: number
  }

  /**
   * Match updateManyAndReturn
   */
  export type MatchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * The data used to update Matches.
     */
    data: XOR<MatchUpdateManyMutationInput, MatchUncheckedUpdateManyInput>
    /**
     * Filter which Matches to update
     */
    where?: MatchWhereInput
    /**
     * Limit how many Matches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Match upsert
   */
  export type MatchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * The filter to search for the Match to update in case it exists.
     */
    where: MatchWhereUniqueInput
    /**
     * In case the Match found by the `where` argument doesn't exist, create a new Match with this data.
     */
    create: XOR<MatchCreateInput, MatchUncheckedCreateInput>
    /**
     * In case the Match was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MatchUpdateInput, MatchUncheckedUpdateInput>
  }

  /**
   * Match delete
   */
  export type MatchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
    /**
     * Filter which Match to delete.
     */
    where: MatchWhereUniqueInput
  }

  /**
   * Match deleteMany
   */
  export type MatchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Matches to delete
     */
    where?: MatchWhereInput
    /**
     * Limit how many Matches to delete.
     */
    limit?: number
  }

  /**
   * Match.officials
   */
  export type Match$officialsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    where?: MatchOfficialWhereInput
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    cursor?: MatchOfficialWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MatchOfficialScalarFieldEnum | MatchOfficialScalarFieldEnum[]
  }

  /**
   * Match without action
   */
  export type MatchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Match
     */
    select?: MatchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Match
     */
    omit?: MatchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchInclude<ExtArgs> | null
  }


  /**
   * Model MatchOfficial
   */

  export type AggregateMatchOfficial = {
    _count: MatchOfficialCountAggregateOutputType | null
    _min: MatchOfficialMinAggregateOutputType | null
    _max: MatchOfficialMaxAggregateOutputType | null
  }

  export type MatchOfficialMinAggregateOutputType = {
    id: string | null
    matchId: string | null
    officialId: string | null
    role: $Enums.OfficialRole | null
    confirmed: boolean | null
    createdAt: Date | null
  }

  export type MatchOfficialMaxAggregateOutputType = {
    id: string | null
    matchId: string | null
    officialId: string | null
    role: $Enums.OfficialRole | null
    confirmed: boolean | null
    createdAt: Date | null
  }

  export type MatchOfficialCountAggregateOutputType = {
    id: number
    matchId: number
    officialId: number
    role: number
    confirmed: number
    createdAt: number
    _all: number
  }


  export type MatchOfficialMinAggregateInputType = {
    id?: true
    matchId?: true
    officialId?: true
    role?: true
    confirmed?: true
    createdAt?: true
  }

  export type MatchOfficialMaxAggregateInputType = {
    id?: true
    matchId?: true
    officialId?: true
    role?: true
    confirmed?: true
    createdAt?: true
  }

  export type MatchOfficialCountAggregateInputType = {
    id?: true
    matchId?: true
    officialId?: true
    role?: true
    confirmed?: true
    createdAt?: true
    _all?: true
  }

  export type MatchOfficialAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MatchOfficial to aggregate.
     */
    where?: MatchOfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchOfficials to fetch.
     */
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MatchOfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchOfficials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchOfficials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MatchOfficials
    **/
    _count?: true | MatchOfficialCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MatchOfficialMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MatchOfficialMaxAggregateInputType
  }

  export type GetMatchOfficialAggregateType<T extends MatchOfficialAggregateArgs> = {
        [P in keyof T & keyof AggregateMatchOfficial]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMatchOfficial[P]>
      : GetScalarType<T[P], AggregateMatchOfficial[P]>
  }




  export type MatchOfficialGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchOfficialWhereInput
    orderBy?: MatchOfficialOrderByWithAggregationInput | MatchOfficialOrderByWithAggregationInput[]
    by: MatchOfficialScalarFieldEnum[] | MatchOfficialScalarFieldEnum
    having?: MatchOfficialScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MatchOfficialCountAggregateInputType | true
    _min?: MatchOfficialMinAggregateInputType
    _max?: MatchOfficialMaxAggregateInputType
  }

  export type MatchOfficialGroupByOutputType = {
    id: string
    matchId: string
    officialId: string
    role: $Enums.OfficialRole
    confirmed: boolean | null
    createdAt: Date
    _count: MatchOfficialCountAggregateOutputType | null
    _min: MatchOfficialMinAggregateOutputType | null
    _max: MatchOfficialMaxAggregateOutputType | null
  }

  type GetMatchOfficialGroupByPayload<T extends MatchOfficialGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatchOfficialGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MatchOfficialGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MatchOfficialGroupByOutputType[P]>
            : GetScalarType<T[P], MatchOfficialGroupByOutputType[P]>
        }
      >
    >


  export type MatchOfficialSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchId?: boolean
    officialId?: boolean
    role?: boolean
    confirmed?: boolean
    createdAt?: boolean
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["matchOfficial"]>

  export type MatchOfficialSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchId?: boolean
    officialId?: boolean
    role?: boolean
    confirmed?: boolean
    createdAt?: boolean
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["matchOfficial"]>

  export type MatchOfficialSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchId?: boolean
    officialId?: boolean
    role?: boolean
    confirmed?: boolean
    createdAt?: boolean
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["matchOfficial"]>

  export type MatchOfficialSelectScalar = {
    id?: boolean
    matchId?: boolean
    officialId?: boolean
    role?: boolean
    confirmed?: boolean
    createdAt?: boolean
  }

  export type MatchOfficialOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "matchId" | "officialId" | "role" | "confirmed" | "createdAt", ExtArgs["result"]["matchOfficial"]>
  export type MatchOfficialInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }
  export type MatchOfficialIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }
  export type MatchOfficialIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    match?: boolean | MatchDefaultArgs<ExtArgs>
    official?: boolean | OfficialDefaultArgs<ExtArgs>
  }

  export type $MatchOfficialPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MatchOfficial"
    objects: {
      match: Prisma.$MatchPayload<ExtArgs>
      official: Prisma.$OfficialPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      matchId: string
      officialId: string
      role: $Enums.OfficialRole
      confirmed: boolean | null
      createdAt: Date
    }, ExtArgs["result"]["matchOfficial"]>
    composites: {}
  }

  type MatchOfficialGetPayload<S extends boolean | null | undefined | MatchOfficialDefaultArgs> = $Result.GetResult<Prisma.$MatchOfficialPayload, S>

  type MatchOfficialCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MatchOfficialFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MatchOfficialCountAggregateInputType | true
    }

  export interface MatchOfficialDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MatchOfficial'], meta: { name: 'MatchOfficial' } }
    /**
     * Find zero or one MatchOfficial that matches the filter.
     * @param {MatchOfficialFindUniqueArgs} args - Arguments to find a MatchOfficial
     * @example
     * // Get one MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatchOfficialFindUniqueArgs>(args: SelectSubset<T, MatchOfficialFindUniqueArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MatchOfficial that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatchOfficialFindUniqueOrThrowArgs} args - Arguments to find a MatchOfficial
     * @example
     * // Get one MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatchOfficialFindUniqueOrThrowArgs>(args: SelectSubset<T, MatchOfficialFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MatchOfficial that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialFindFirstArgs} args - Arguments to find a MatchOfficial
     * @example
     * // Get one MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatchOfficialFindFirstArgs>(args?: SelectSubset<T, MatchOfficialFindFirstArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MatchOfficial that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialFindFirstOrThrowArgs} args - Arguments to find a MatchOfficial
     * @example
     * // Get one MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatchOfficialFindFirstOrThrowArgs>(args?: SelectSubset<T, MatchOfficialFindFirstOrThrowArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MatchOfficials that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MatchOfficials
     * const matchOfficials = await prisma.matchOfficial.findMany()
     * 
     * // Get first 10 MatchOfficials
     * const matchOfficials = await prisma.matchOfficial.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const matchOfficialWithIdOnly = await prisma.matchOfficial.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MatchOfficialFindManyArgs>(args?: SelectSubset<T, MatchOfficialFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MatchOfficial.
     * @param {MatchOfficialCreateArgs} args - Arguments to create a MatchOfficial.
     * @example
     * // Create one MatchOfficial
     * const MatchOfficial = await prisma.matchOfficial.create({
     *   data: {
     *     // ... data to create a MatchOfficial
     *   }
     * })
     * 
     */
    create<T extends MatchOfficialCreateArgs>(args: SelectSubset<T, MatchOfficialCreateArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MatchOfficials.
     * @param {MatchOfficialCreateManyArgs} args - Arguments to create many MatchOfficials.
     * @example
     * // Create many MatchOfficials
     * const matchOfficial = await prisma.matchOfficial.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MatchOfficialCreateManyArgs>(args?: SelectSubset<T, MatchOfficialCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MatchOfficials and returns the data saved in the database.
     * @param {MatchOfficialCreateManyAndReturnArgs} args - Arguments to create many MatchOfficials.
     * @example
     * // Create many MatchOfficials
     * const matchOfficial = await prisma.matchOfficial.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MatchOfficials and only return the `id`
     * const matchOfficialWithIdOnly = await prisma.matchOfficial.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MatchOfficialCreateManyAndReturnArgs>(args?: SelectSubset<T, MatchOfficialCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MatchOfficial.
     * @param {MatchOfficialDeleteArgs} args - Arguments to delete one MatchOfficial.
     * @example
     * // Delete one MatchOfficial
     * const MatchOfficial = await prisma.matchOfficial.delete({
     *   where: {
     *     // ... filter to delete one MatchOfficial
     *   }
     * })
     * 
     */
    delete<T extends MatchOfficialDeleteArgs>(args: SelectSubset<T, MatchOfficialDeleteArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MatchOfficial.
     * @param {MatchOfficialUpdateArgs} args - Arguments to update one MatchOfficial.
     * @example
     * // Update one MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MatchOfficialUpdateArgs>(args: SelectSubset<T, MatchOfficialUpdateArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MatchOfficials.
     * @param {MatchOfficialDeleteManyArgs} args - Arguments to filter MatchOfficials to delete.
     * @example
     * // Delete a few MatchOfficials
     * const { count } = await prisma.matchOfficial.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MatchOfficialDeleteManyArgs>(args?: SelectSubset<T, MatchOfficialDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MatchOfficials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MatchOfficials
     * const matchOfficial = await prisma.matchOfficial.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MatchOfficialUpdateManyArgs>(args: SelectSubset<T, MatchOfficialUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MatchOfficials and returns the data updated in the database.
     * @param {MatchOfficialUpdateManyAndReturnArgs} args - Arguments to update many MatchOfficials.
     * @example
     * // Update many MatchOfficials
     * const matchOfficial = await prisma.matchOfficial.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MatchOfficials and only return the `id`
     * const matchOfficialWithIdOnly = await prisma.matchOfficial.updateManyAndReturn({
     *   select: { id: true },
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
    updateManyAndReturn<T extends MatchOfficialUpdateManyAndReturnArgs>(args: SelectSubset<T, MatchOfficialUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MatchOfficial.
     * @param {MatchOfficialUpsertArgs} args - Arguments to update or create a MatchOfficial.
     * @example
     * // Update or create a MatchOfficial
     * const matchOfficial = await prisma.matchOfficial.upsert({
     *   create: {
     *     // ... data to create a MatchOfficial
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MatchOfficial we want to update
     *   }
     * })
     */
    upsert<T extends MatchOfficialUpsertArgs>(args: SelectSubset<T, MatchOfficialUpsertArgs<ExtArgs>>): Prisma__MatchOfficialClient<$Result.GetResult<Prisma.$MatchOfficialPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MatchOfficials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialCountArgs} args - Arguments to filter MatchOfficials to count.
     * @example
     * // Count the number of MatchOfficials
     * const count = await prisma.matchOfficial.count({
     *   where: {
     *     // ... the filter for the MatchOfficials we want to count
     *   }
     * })
    **/
    count<T extends MatchOfficialCountArgs>(
      args?: Subset<T, MatchOfficialCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatchOfficialCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MatchOfficial.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MatchOfficialAggregateArgs>(args: Subset<T, MatchOfficialAggregateArgs>): Prisma.PrismaPromise<GetMatchOfficialAggregateType<T>>

    /**
     * Group by MatchOfficial.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchOfficialGroupByArgs} args - Group by arguments.
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
      T extends MatchOfficialGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MatchOfficialGroupByArgs['orderBy'] }
        : { orderBy?: MatchOfficialGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MatchOfficialGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatchOfficialGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MatchOfficial model
   */
  readonly fields: MatchOfficialFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MatchOfficial.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MatchOfficialClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    match<T extends MatchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MatchDefaultArgs<ExtArgs>>): Prisma__MatchClient<$Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    official<T extends OfficialDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OfficialDefaultArgs<ExtArgs>>): Prisma__OfficialClient<$Result.GetResult<Prisma.$OfficialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the MatchOfficial model
   */
  interface MatchOfficialFieldRefs {
    readonly id: FieldRef<"MatchOfficial", 'String'>
    readonly matchId: FieldRef<"MatchOfficial", 'String'>
    readonly officialId: FieldRef<"MatchOfficial", 'String'>
    readonly role: FieldRef<"MatchOfficial", 'OfficialRole'>
    readonly confirmed: FieldRef<"MatchOfficial", 'Boolean'>
    readonly createdAt: FieldRef<"MatchOfficial", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MatchOfficial findUnique
   */
  export type MatchOfficialFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter, which MatchOfficial to fetch.
     */
    where: MatchOfficialWhereUniqueInput
  }

  /**
   * MatchOfficial findUniqueOrThrow
   */
  export type MatchOfficialFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter, which MatchOfficial to fetch.
     */
    where: MatchOfficialWhereUniqueInput
  }

  /**
   * MatchOfficial findFirst
   */
  export type MatchOfficialFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter, which MatchOfficial to fetch.
     */
    where?: MatchOfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchOfficials to fetch.
     */
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MatchOfficials.
     */
    cursor?: MatchOfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchOfficials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchOfficials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MatchOfficials.
     */
    distinct?: MatchOfficialScalarFieldEnum | MatchOfficialScalarFieldEnum[]
  }

  /**
   * MatchOfficial findFirstOrThrow
   */
  export type MatchOfficialFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter, which MatchOfficial to fetch.
     */
    where?: MatchOfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchOfficials to fetch.
     */
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MatchOfficials.
     */
    cursor?: MatchOfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchOfficials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchOfficials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MatchOfficials.
     */
    distinct?: MatchOfficialScalarFieldEnum | MatchOfficialScalarFieldEnum[]
  }

  /**
   * MatchOfficial findMany
   */
  export type MatchOfficialFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter, which MatchOfficials to fetch.
     */
    where?: MatchOfficialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchOfficials to fetch.
     */
    orderBy?: MatchOfficialOrderByWithRelationInput | MatchOfficialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MatchOfficials.
     */
    cursor?: MatchOfficialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchOfficials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchOfficials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MatchOfficials.
     */
    distinct?: MatchOfficialScalarFieldEnum | MatchOfficialScalarFieldEnum[]
  }

  /**
   * MatchOfficial create
   */
  export type MatchOfficialCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * The data needed to create a MatchOfficial.
     */
    data: XOR<MatchOfficialCreateInput, MatchOfficialUncheckedCreateInput>
  }

  /**
   * MatchOfficial createMany
   */
  export type MatchOfficialCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MatchOfficials.
     */
    data: MatchOfficialCreateManyInput | MatchOfficialCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MatchOfficial createManyAndReturn
   */
  export type MatchOfficialCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * The data used to create many MatchOfficials.
     */
    data: MatchOfficialCreateManyInput | MatchOfficialCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MatchOfficial update
   */
  export type MatchOfficialUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * The data needed to update a MatchOfficial.
     */
    data: XOR<MatchOfficialUpdateInput, MatchOfficialUncheckedUpdateInput>
    /**
     * Choose, which MatchOfficial to update.
     */
    where: MatchOfficialWhereUniqueInput
  }

  /**
   * MatchOfficial updateMany
   */
  export type MatchOfficialUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MatchOfficials.
     */
    data: XOR<MatchOfficialUpdateManyMutationInput, MatchOfficialUncheckedUpdateManyInput>
    /**
     * Filter which MatchOfficials to update
     */
    where?: MatchOfficialWhereInput
    /**
     * Limit how many MatchOfficials to update.
     */
    limit?: number
  }

  /**
   * MatchOfficial updateManyAndReturn
   */
  export type MatchOfficialUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * The data used to update MatchOfficials.
     */
    data: XOR<MatchOfficialUpdateManyMutationInput, MatchOfficialUncheckedUpdateManyInput>
    /**
     * Filter which MatchOfficials to update
     */
    where?: MatchOfficialWhereInput
    /**
     * Limit how many MatchOfficials to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MatchOfficial upsert
   */
  export type MatchOfficialUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * The filter to search for the MatchOfficial to update in case it exists.
     */
    where: MatchOfficialWhereUniqueInput
    /**
     * In case the MatchOfficial found by the `where` argument doesn't exist, create a new MatchOfficial with this data.
     */
    create: XOR<MatchOfficialCreateInput, MatchOfficialUncheckedCreateInput>
    /**
     * In case the MatchOfficial was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MatchOfficialUpdateInput, MatchOfficialUncheckedUpdateInput>
  }

  /**
   * MatchOfficial delete
   */
  export type MatchOfficialDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
    /**
     * Filter which MatchOfficial to delete.
     */
    where: MatchOfficialWhereUniqueInput
  }

  /**
   * MatchOfficial deleteMany
   */
  export type MatchOfficialDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MatchOfficials to delete
     */
    where?: MatchOfficialWhereInput
    /**
     * Limit how many MatchOfficials to delete.
     */
    limit?: number
  }

  /**
   * MatchOfficial without action
   */
  export type MatchOfficialDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchOfficial
     */
    select?: MatchOfficialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MatchOfficial
     */
    omit?: MatchOfficialOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchOfficialInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OfficialScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    phone: 'phone',
    pixKey: 'pixKey',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OfficialScalarFieldEnum = (typeof OfficialScalarFieldEnum)[keyof typeof OfficialScalarFieldEnum]


  export const ChampionshipScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChampionshipScalarFieldEnum = (typeof ChampionshipScalarFieldEnum)[keyof typeof ChampionshipScalarFieldEnum]


  export const StadiumScalarFieldEnum: {
    id: 'id',
    name: 'name',
    city: 'city',
    state: 'state',
    address: 'address',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StadiumScalarFieldEnum = (typeof StadiumScalarFieldEnum)[keyof typeof StadiumScalarFieldEnum]


  export const MatchScalarFieldEnum: {
    id: 'id',
    championshipId: 'championshipId',
    stadiumId: 'stadiumId',
    homeTeam: 'homeTeam',
    awayTeam: 'awayTeam',
    matchDate: 'matchDate',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MatchScalarFieldEnum = (typeof MatchScalarFieldEnum)[keyof typeof MatchScalarFieldEnum]


  export const MatchOfficialScalarFieldEnum: {
    id: 'id',
    matchId: 'matchId',
    officialId: 'officialId',
    role: 'role',
    confirmed: 'confirmed',
    createdAt: 'createdAt'
  };

  export type MatchOfficialScalarFieldEnum = (typeof MatchOfficialScalarFieldEnum)[keyof typeof MatchOfficialScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'MatchStatus'
   */
  export type EnumMatchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchStatus'>
    


  /**
   * Reference to a field of type 'MatchStatus[]'
   */
  export type ListEnumMatchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MatchStatus[]'>
    


  /**
   * Reference to a field of type 'OfficialRole'
   */
  export type EnumOfficialRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OfficialRole'>
    


  /**
   * Reference to a field of type 'OfficialRole[]'
   */
  export type ListEnumOfficialRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OfficialRole[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    official?: XOR<OfficialNullableScalarRelationFilter, OfficialWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    official?: OfficialOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    official?: XOR<OfficialNullableScalarRelationFilter, OfficialWhereInput> | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type OfficialWhereInput = {
    AND?: OfficialWhereInput | OfficialWhereInput[]
    OR?: OfficialWhereInput[]
    NOT?: OfficialWhereInput | OfficialWhereInput[]
    id?: StringFilter<"Official"> | string
    userId?: StringFilter<"Official"> | string
    phone?: StringNullableFilter<"Official"> | string | null
    pixKey?: StringNullableFilter<"Official"> | string | null
    active?: BoolFilter<"Official"> | boolean
    createdAt?: DateTimeFilter<"Official"> | Date | string
    updatedAt?: DateTimeFilter<"Official"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    scales?: MatchOfficialListRelationFilter
  }

  export type OfficialOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    phone?: SortOrderInput | SortOrder
    pixKey?: SortOrderInput | SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    scales?: MatchOfficialOrderByRelationAggregateInput
  }

  export type OfficialWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: OfficialWhereInput | OfficialWhereInput[]
    OR?: OfficialWhereInput[]
    NOT?: OfficialWhereInput | OfficialWhereInput[]
    phone?: StringNullableFilter<"Official"> | string | null
    pixKey?: StringNullableFilter<"Official"> | string | null
    active?: BoolFilter<"Official"> | boolean
    createdAt?: DateTimeFilter<"Official"> | Date | string
    updatedAt?: DateTimeFilter<"Official"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    scales?: MatchOfficialListRelationFilter
  }, "id" | "userId">

  export type OfficialOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    phone?: SortOrderInput | SortOrder
    pixKey?: SortOrderInput | SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OfficialCountOrderByAggregateInput
    _max?: OfficialMaxOrderByAggregateInput
    _min?: OfficialMinOrderByAggregateInput
  }

  export type OfficialScalarWhereWithAggregatesInput = {
    AND?: OfficialScalarWhereWithAggregatesInput | OfficialScalarWhereWithAggregatesInput[]
    OR?: OfficialScalarWhereWithAggregatesInput[]
    NOT?: OfficialScalarWhereWithAggregatesInput | OfficialScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Official"> | string
    userId?: StringWithAggregatesFilter<"Official"> | string
    phone?: StringNullableWithAggregatesFilter<"Official"> | string | null
    pixKey?: StringNullableWithAggregatesFilter<"Official"> | string | null
    active?: BoolWithAggregatesFilter<"Official"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Official"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Official"> | Date | string
  }

  export type ChampionshipWhereInput = {
    AND?: ChampionshipWhereInput | ChampionshipWhereInput[]
    OR?: ChampionshipWhereInput[]
    NOT?: ChampionshipWhereInput | ChampionshipWhereInput[]
    id?: StringFilter<"Championship"> | string
    name?: StringFilter<"Championship"> | string
    createdAt?: DateTimeFilter<"Championship"> | Date | string
    updatedAt?: DateTimeFilter<"Championship"> | Date | string
    matches?: MatchListRelationFilter
  }

  export type ChampionshipOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    matches?: MatchOrderByRelationAggregateInput
  }

  export type ChampionshipWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChampionshipWhereInput | ChampionshipWhereInput[]
    OR?: ChampionshipWhereInput[]
    NOT?: ChampionshipWhereInput | ChampionshipWhereInput[]
    name?: StringFilter<"Championship"> | string
    createdAt?: DateTimeFilter<"Championship"> | Date | string
    updatedAt?: DateTimeFilter<"Championship"> | Date | string
    matches?: MatchListRelationFilter
  }, "id">

  export type ChampionshipOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChampionshipCountOrderByAggregateInput
    _max?: ChampionshipMaxOrderByAggregateInput
    _min?: ChampionshipMinOrderByAggregateInput
  }

  export type ChampionshipScalarWhereWithAggregatesInput = {
    AND?: ChampionshipScalarWhereWithAggregatesInput | ChampionshipScalarWhereWithAggregatesInput[]
    OR?: ChampionshipScalarWhereWithAggregatesInput[]
    NOT?: ChampionshipScalarWhereWithAggregatesInput | ChampionshipScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Championship"> | string
    name?: StringWithAggregatesFilter<"Championship"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Championship"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Championship"> | Date | string
  }

  export type StadiumWhereInput = {
    AND?: StadiumWhereInput | StadiumWhereInput[]
    OR?: StadiumWhereInput[]
    NOT?: StadiumWhereInput | StadiumWhereInput[]
    id?: StringFilter<"Stadium"> | string
    name?: StringFilter<"Stadium"> | string
    city?: StringFilter<"Stadium"> | string
    state?: StringFilter<"Stadium"> | string
    address?: StringNullableFilter<"Stadium"> | string | null
    createdAt?: DateTimeFilter<"Stadium"> | Date | string
    updatedAt?: DateTimeFilter<"Stadium"> | Date | string
    matches?: MatchListRelationFilter
  }

  export type StadiumOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    city?: SortOrder
    state?: SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    matches?: MatchOrderByRelationAggregateInput
  }

  export type StadiumWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StadiumWhereInput | StadiumWhereInput[]
    OR?: StadiumWhereInput[]
    NOT?: StadiumWhereInput | StadiumWhereInput[]
    name?: StringFilter<"Stadium"> | string
    city?: StringFilter<"Stadium"> | string
    state?: StringFilter<"Stadium"> | string
    address?: StringNullableFilter<"Stadium"> | string | null
    createdAt?: DateTimeFilter<"Stadium"> | Date | string
    updatedAt?: DateTimeFilter<"Stadium"> | Date | string
    matches?: MatchListRelationFilter
  }, "id">

  export type StadiumOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    city?: SortOrder
    state?: SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StadiumCountOrderByAggregateInput
    _max?: StadiumMaxOrderByAggregateInput
    _min?: StadiumMinOrderByAggregateInput
  }

  export type StadiumScalarWhereWithAggregatesInput = {
    AND?: StadiumScalarWhereWithAggregatesInput | StadiumScalarWhereWithAggregatesInput[]
    OR?: StadiumScalarWhereWithAggregatesInput[]
    NOT?: StadiumScalarWhereWithAggregatesInput | StadiumScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Stadium"> | string
    name?: StringWithAggregatesFilter<"Stadium"> | string
    city?: StringWithAggregatesFilter<"Stadium"> | string
    state?: StringWithAggregatesFilter<"Stadium"> | string
    address?: StringNullableWithAggregatesFilter<"Stadium"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Stadium"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Stadium"> | Date | string
  }

  export type MatchWhereInput = {
    AND?: MatchWhereInput | MatchWhereInput[]
    OR?: MatchWhereInput[]
    NOT?: MatchWhereInput | MatchWhereInput[]
    id?: StringFilter<"Match"> | string
    championshipId?: StringFilter<"Match"> | string
    stadiumId?: StringFilter<"Match"> | string
    homeTeam?: StringFilter<"Match"> | string
    awayTeam?: StringFilter<"Match"> | string
    matchDate?: DateTimeFilter<"Match"> | Date | string
    status?: EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus
    createdAt?: DateTimeFilter<"Match"> | Date | string
    updatedAt?: DateTimeFilter<"Match"> | Date | string
    championship?: XOR<ChampionshipScalarRelationFilter, ChampionshipWhereInput>
    stadium?: XOR<StadiumScalarRelationFilter, StadiumWhereInput>
    officials?: MatchOfficialListRelationFilter
  }

  export type MatchOrderByWithRelationInput = {
    id?: SortOrder
    championshipId?: SortOrder
    stadiumId?: SortOrder
    homeTeam?: SortOrder
    awayTeam?: SortOrder
    matchDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    championship?: ChampionshipOrderByWithRelationInput
    stadium?: StadiumOrderByWithRelationInput
    officials?: MatchOfficialOrderByRelationAggregateInput
  }

  export type MatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MatchWhereInput | MatchWhereInput[]
    OR?: MatchWhereInput[]
    NOT?: MatchWhereInput | MatchWhereInput[]
    championshipId?: StringFilter<"Match"> | string
    stadiumId?: StringFilter<"Match"> | string
    homeTeam?: StringFilter<"Match"> | string
    awayTeam?: StringFilter<"Match"> | string
    matchDate?: DateTimeFilter<"Match"> | Date | string
    status?: EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus
    createdAt?: DateTimeFilter<"Match"> | Date | string
    updatedAt?: DateTimeFilter<"Match"> | Date | string
    championship?: XOR<ChampionshipScalarRelationFilter, ChampionshipWhereInput>
    stadium?: XOR<StadiumScalarRelationFilter, StadiumWhereInput>
    officials?: MatchOfficialListRelationFilter
  }, "id">

  export type MatchOrderByWithAggregationInput = {
    id?: SortOrder
    championshipId?: SortOrder
    stadiumId?: SortOrder
    homeTeam?: SortOrder
    awayTeam?: SortOrder
    matchDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MatchCountOrderByAggregateInput
    _max?: MatchMaxOrderByAggregateInput
    _min?: MatchMinOrderByAggregateInput
  }

  export type MatchScalarWhereWithAggregatesInput = {
    AND?: MatchScalarWhereWithAggregatesInput | MatchScalarWhereWithAggregatesInput[]
    OR?: MatchScalarWhereWithAggregatesInput[]
    NOT?: MatchScalarWhereWithAggregatesInput | MatchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Match"> | string
    championshipId?: StringWithAggregatesFilter<"Match"> | string
    stadiumId?: StringWithAggregatesFilter<"Match"> | string
    homeTeam?: StringWithAggregatesFilter<"Match"> | string
    awayTeam?: StringWithAggregatesFilter<"Match"> | string
    matchDate?: DateTimeWithAggregatesFilter<"Match"> | Date | string
    status?: EnumMatchStatusWithAggregatesFilter<"Match"> | $Enums.MatchStatus
    createdAt?: DateTimeWithAggregatesFilter<"Match"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Match"> | Date | string
  }

  export type MatchOfficialWhereInput = {
    AND?: MatchOfficialWhereInput | MatchOfficialWhereInput[]
    OR?: MatchOfficialWhereInput[]
    NOT?: MatchOfficialWhereInput | MatchOfficialWhereInput[]
    id?: StringFilter<"MatchOfficial"> | string
    matchId?: StringFilter<"MatchOfficial"> | string
    officialId?: StringFilter<"MatchOfficial"> | string
    role?: EnumOfficialRoleFilter<"MatchOfficial"> | $Enums.OfficialRole
    confirmed?: BoolNullableFilter<"MatchOfficial"> | boolean | null
    createdAt?: DateTimeFilter<"MatchOfficial"> | Date | string
    match?: XOR<MatchScalarRelationFilter, MatchWhereInput>
    official?: XOR<OfficialScalarRelationFilter, OfficialWhereInput>
  }

  export type MatchOfficialOrderByWithRelationInput = {
    id?: SortOrder
    matchId?: SortOrder
    officialId?: SortOrder
    role?: SortOrder
    confirmed?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    match?: MatchOrderByWithRelationInput
    official?: OfficialOrderByWithRelationInput
  }

  export type MatchOfficialWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MatchOfficialWhereInput | MatchOfficialWhereInput[]
    OR?: MatchOfficialWhereInput[]
    NOT?: MatchOfficialWhereInput | MatchOfficialWhereInput[]
    matchId?: StringFilter<"MatchOfficial"> | string
    officialId?: StringFilter<"MatchOfficial"> | string
    role?: EnumOfficialRoleFilter<"MatchOfficial"> | $Enums.OfficialRole
    confirmed?: BoolNullableFilter<"MatchOfficial"> | boolean | null
    createdAt?: DateTimeFilter<"MatchOfficial"> | Date | string
    match?: XOR<MatchScalarRelationFilter, MatchWhereInput>
    official?: XOR<OfficialScalarRelationFilter, OfficialWhereInput>
  }, "id">

  export type MatchOfficialOrderByWithAggregationInput = {
    id?: SortOrder
    matchId?: SortOrder
    officialId?: SortOrder
    role?: SortOrder
    confirmed?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MatchOfficialCountOrderByAggregateInput
    _max?: MatchOfficialMaxOrderByAggregateInput
    _min?: MatchOfficialMinOrderByAggregateInput
  }

  export type MatchOfficialScalarWhereWithAggregatesInput = {
    AND?: MatchOfficialScalarWhereWithAggregatesInput | MatchOfficialScalarWhereWithAggregatesInput[]
    OR?: MatchOfficialScalarWhereWithAggregatesInput[]
    NOT?: MatchOfficialScalarWhereWithAggregatesInput | MatchOfficialScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MatchOfficial"> | string
    matchId?: StringWithAggregatesFilter<"MatchOfficial"> | string
    officialId?: StringWithAggregatesFilter<"MatchOfficial"> | string
    role?: EnumOfficialRoleWithAggregatesFilter<"MatchOfficial"> | $Enums.OfficialRole
    confirmed?: BoolNullableWithAggregatesFilter<"MatchOfficial"> | boolean | null
    createdAt?: DateTimeWithAggregatesFilter<"MatchOfficial"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    official?: OfficialCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    official?: OfficialUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    official?: OfficialUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    official?: OfficialUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfficialCreateInput = {
    id?: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOfficialInput
    scales?: MatchOfficialCreateNestedManyWithoutOfficialInput
  }

  export type OfficialUncheckedCreateInput = {
    id?: string
    userId: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    scales?: MatchOfficialUncheckedCreateNestedManyWithoutOfficialInput
  }

  export type OfficialUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOfficialNestedInput
    scales?: MatchOfficialUpdateManyWithoutOfficialNestedInput
  }

  export type OfficialUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scales?: MatchOfficialUncheckedUpdateManyWithoutOfficialNestedInput
  }

  export type OfficialCreateManyInput = {
    id?: string
    userId: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfficialUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfficialUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChampionshipCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    matches?: MatchCreateNestedManyWithoutChampionshipInput
  }

  export type ChampionshipUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    matches?: MatchUncheckedCreateNestedManyWithoutChampionshipInput
  }

  export type ChampionshipUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: MatchUpdateManyWithoutChampionshipNestedInput
  }

  export type ChampionshipUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: MatchUncheckedUpdateManyWithoutChampionshipNestedInput
  }

  export type ChampionshipCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChampionshipUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChampionshipUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StadiumCreateInput = {
    id?: string
    name: string
    city: string
    state: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    matches?: MatchCreateNestedManyWithoutStadiumInput
  }

  export type StadiumUncheckedCreateInput = {
    id?: string
    name: string
    city: string
    state: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    matches?: MatchUncheckedCreateNestedManyWithoutStadiumInput
  }

  export type StadiumUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: MatchUpdateManyWithoutStadiumNestedInput
  }

  export type StadiumUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    matches?: MatchUncheckedUpdateManyWithoutStadiumNestedInput
  }

  export type StadiumCreateManyInput = {
    id?: string
    name: string
    city: string
    state: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StadiumUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StadiumUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchCreateInput = {
    id?: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    championship: ChampionshipCreateNestedOneWithoutMatchesInput
    stadium: StadiumCreateNestedOneWithoutMatchesInput
    officials?: MatchOfficialCreateNestedManyWithoutMatchInput
  }

  export type MatchUncheckedCreateInput = {
    id?: string
    championshipId: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    officials?: MatchOfficialUncheckedCreateNestedManyWithoutMatchInput
  }

  export type MatchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    championship?: ChampionshipUpdateOneRequiredWithoutMatchesNestedInput
    stadium?: StadiumUpdateOneRequiredWithoutMatchesNestedInput
    officials?: MatchOfficialUpdateManyWithoutMatchNestedInput
  }

  export type MatchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    championshipId?: StringFieldUpdateOperationsInput | string
    stadiumId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    officials?: MatchOfficialUncheckedUpdateManyWithoutMatchNestedInput
  }

  export type MatchCreateManyInput = {
    id?: string
    championshipId: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MatchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    championshipId?: StringFieldUpdateOperationsInput | string
    stadiumId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialCreateInput = {
    id?: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
    match: MatchCreateNestedOneWithoutOfficialsInput
    official: OfficialCreateNestedOneWithoutScalesInput
  }

  export type MatchOfficialUncheckedCreateInput = {
    id?: string
    matchId: string
    officialId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    match?: MatchUpdateOneRequiredWithoutOfficialsNestedInput
    official?: OfficialUpdateOneRequiredWithoutScalesNestedInput
  }

  export type MatchOfficialUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchId?: StringFieldUpdateOperationsInput | string
    officialId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialCreateManyInput = {
    id?: string
    matchId: string
    officialId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchId?: StringFieldUpdateOperationsInput | string
    officialId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type OfficialNullableScalarRelationFilter = {
    is?: OfficialWhereInput | null
    isNot?: OfficialWhereInput | null
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type MatchOfficialListRelationFilter = {
    every?: MatchOfficialWhereInput
    some?: MatchOfficialWhereInput
    none?: MatchOfficialWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MatchOfficialOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OfficialCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phone?: SortOrder
    pixKey?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfficialMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phone?: SortOrder
    pixKey?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OfficialMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phone?: SortOrder
    pixKey?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type MatchListRelationFilter = {
    every?: MatchWhereInput
    some?: MatchWhereInput
    none?: MatchWhereInput
  }

  export type MatchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChampionshipCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChampionshipMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChampionshipMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StadiumCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    city?: SortOrder
    state?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StadiumMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    city?: SortOrder
    state?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StadiumMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    city?: SortOrder
    state?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMatchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | EnumMatchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMatchStatusFilter<$PrismaModel> | $Enums.MatchStatus
  }

  export type ChampionshipScalarRelationFilter = {
    is?: ChampionshipWhereInput
    isNot?: ChampionshipWhereInput
  }

  export type StadiumScalarRelationFilter = {
    is?: StadiumWhereInput
    isNot?: StadiumWhereInput
  }

  export type MatchCountOrderByAggregateInput = {
    id?: SortOrder
    championshipId?: SortOrder
    stadiumId?: SortOrder
    homeTeam?: SortOrder
    awayTeam?: SortOrder
    matchDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MatchMaxOrderByAggregateInput = {
    id?: SortOrder
    championshipId?: SortOrder
    stadiumId?: SortOrder
    homeTeam?: SortOrder
    awayTeam?: SortOrder
    matchDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MatchMinOrderByAggregateInput = {
    id?: SortOrder
    championshipId?: SortOrder
    stadiumId?: SortOrder
    homeTeam?: SortOrder
    awayTeam?: SortOrder
    matchDate?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMatchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | EnumMatchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel> | $Enums.MatchStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMatchStatusFilter<$PrismaModel>
    _max?: NestedEnumMatchStatusFilter<$PrismaModel>
  }

  export type EnumOfficialRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.OfficialRole | EnumOfficialRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOfficialRoleFilter<$PrismaModel> | $Enums.OfficialRole
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type MatchScalarRelationFilter = {
    is?: MatchWhereInput
    isNot?: MatchWhereInput
  }

  export type OfficialScalarRelationFilter = {
    is?: OfficialWhereInput
    isNot?: OfficialWhereInput
  }

  export type MatchOfficialCountOrderByAggregateInput = {
    id?: SortOrder
    matchId?: SortOrder
    officialId?: SortOrder
    role?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
  }

  export type MatchOfficialMaxOrderByAggregateInput = {
    id?: SortOrder
    matchId?: SortOrder
    officialId?: SortOrder
    role?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
  }

  export type MatchOfficialMinOrderByAggregateInput = {
    id?: SortOrder
    matchId?: SortOrder
    officialId?: SortOrder
    role?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumOfficialRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OfficialRole | EnumOfficialRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOfficialRoleWithAggregatesFilter<$PrismaModel> | $Enums.OfficialRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOfficialRoleFilter<$PrismaModel>
    _max?: NestedEnumOfficialRoleFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type OfficialCreateNestedOneWithoutUserInput = {
    create?: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutUserInput
    connect?: OfficialWhereUniqueInput
  }

  export type OfficialUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutUserInput
    connect?: OfficialWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OfficialUpdateOneWithoutUserNestedInput = {
    create?: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutUserInput
    upsert?: OfficialUpsertWithoutUserInput
    disconnect?: OfficialWhereInput | boolean
    delete?: OfficialWhereInput | boolean
    connect?: OfficialWhereUniqueInput
    update?: XOR<XOR<OfficialUpdateToOneWithWhereWithoutUserInput, OfficialUpdateWithoutUserInput>, OfficialUncheckedUpdateWithoutUserInput>
  }

  export type OfficialUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutUserInput
    upsert?: OfficialUpsertWithoutUserInput
    disconnect?: OfficialWhereInput | boolean
    delete?: OfficialWhereInput | boolean
    connect?: OfficialWhereUniqueInput
    update?: XOR<XOR<OfficialUpdateToOneWithWhereWithoutUserInput, OfficialUpdateWithoutUserInput>, OfficialUncheckedUpdateWithoutUserInput>
  }

  export type UserCreateNestedOneWithoutOfficialInput = {
    create?: XOR<UserCreateWithoutOfficialInput, UserUncheckedCreateWithoutOfficialInput>
    connectOrCreate?: UserCreateOrConnectWithoutOfficialInput
    connect?: UserWhereUniqueInput
  }

  export type MatchOfficialCreateNestedManyWithoutOfficialInput = {
    create?: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput> | MatchOfficialCreateWithoutOfficialInput[] | MatchOfficialUncheckedCreateWithoutOfficialInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutOfficialInput | MatchOfficialCreateOrConnectWithoutOfficialInput[]
    createMany?: MatchOfficialCreateManyOfficialInputEnvelope
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
  }

  export type MatchOfficialUncheckedCreateNestedManyWithoutOfficialInput = {
    create?: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput> | MatchOfficialCreateWithoutOfficialInput[] | MatchOfficialUncheckedCreateWithoutOfficialInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutOfficialInput | MatchOfficialCreateOrConnectWithoutOfficialInput[]
    createMany?: MatchOfficialCreateManyOfficialInputEnvelope
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutOfficialNestedInput = {
    create?: XOR<UserCreateWithoutOfficialInput, UserUncheckedCreateWithoutOfficialInput>
    connectOrCreate?: UserCreateOrConnectWithoutOfficialInput
    upsert?: UserUpsertWithoutOfficialInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOfficialInput, UserUpdateWithoutOfficialInput>, UserUncheckedUpdateWithoutOfficialInput>
  }

  export type MatchOfficialUpdateManyWithoutOfficialNestedInput = {
    create?: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput> | MatchOfficialCreateWithoutOfficialInput[] | MatchOfficialUncheckedCreateWithoutOfficialInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutOfficialInput | MatchOfficialCreateOrConnectWithoutOfficialInput[]
    upsert?: MatchOfficialUpsertWithWhereUniqueWithoutOfficialInput | MatchOfficialUpsertWithWhereUniqueWithoutOfficialInput[]
    createMany?: MatchOfficialCreateManyOfficialInputEnvelope
    set?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    disconnect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    delete?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    update?: MatchOfficialUpdateWithWhereUniqueWithoutOfficialInput | MatchOfficialUpdateWithWhereUniqueWithoutOfficialInput[]
    updateMany?: MatchOfficialUpdateManyWithWhereWithoutOfficialInput | MatchOfficialUpdateManyWithWhereWithoutOfficialInput[]
    deleteMany?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
  }

  export type MatchOfficialUncheckedUpdateManyWithoutOfficialNestedInput = {
    create?: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput> | MatchOfficialCreateWithoutOfficialInput[] | MatchOfficialUncheckedCreateWithoutOfficialInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutOfficialInput | MatchOfficialCreateOrConnectWithoutOfficialInput[]
    upsert?: MatchOfficialUpsertWithWhereUniqueWithoutOfficialInput | MatchOfficialUpsertWithWhereUniqueWithoutOfficialInput[]
    createMany?: MatchOfficialCreateManyOfficialInputEnvelope
    set?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    disconnect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    delete?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    update?: MatchOfficialUpdateWithWhereUniqueWithoutOfficialInput | MatchOfficialUpdateWithWhereUniqueWithoutOfficialInput[]
    updateMany?: MatchOfficialUpdateManyWithWhereWithoutOfficialInput | MatchOfficialUpdateManyWithWhereWithoutOfficialInput[]
    deleteMany?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
  }

  export type MatchCreateNestedManyWithoutChampionshipInput = {
    create?: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput> | MatchCreateWithoutChampionshipInput[] | MatchUncheckedCreateWithoutChampionshipInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutChampionshipInput | MatchCreateOrConnectWithoutChampionshipInput[]
    createMany?: MatchCreateManyChampionshipInputEnvelope
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
  }

  export type MatchUncheckedCreateNestedManyWithoutChampionshipInput = {
    create?: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput> | MatchCreateWithoutChampionshipInput[] | MatchUncheckedCreateWithoutChampionshipInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutChampionshipInput | MatchCreateOrConnectWithoutChampionshipInput[]
    createMany?: MatchCreateManyChampionshipInputEnvelope
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
  }

  export type MatchUpdateManyWithoutChampionshipNestedInput = {
    create?: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput> | MatchCreateWithoutChampionshipInput[] | MatchUncheckedCreateWithoutChampionshipInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutChampionshipInput | MatchCreateOrConnectWithoutChampionshipInput[]
    upsert?: MatchUpsertWithWhereUniqueWithoutChampionshipInput | MatchUpsertWithWhereUniqueWithoutChampionshipInput[]
    createMany?: MatchCreateManyChampionshipInputEnvelope
    set?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    disconnect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    delete?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    update?: MatchUpdateWithWhereUniqueWithoutChampionshipInput | MatchUpdateWithWhereUniqueWithoutChampionshipInput[]
    updateMany?: MatchUpdateManyWithWhereWithoutChampionshipInput | MatchUpdateManyWithWhereWithoutChampionshipInput[]
    deleteMany?: MatchScalarWhereInput | MatchScalarWhereInput[]
  }

  export type MatchUncheckedUpdateManyWithoutChampionshipNestedInput = {
    create?: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput> | MatchCreateWithoutChampionshipInput[] | MatchUncheckedCreateWithoutChampionshipInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutChampionshipInput | MatchCreateOrConnectWithoutChampionshipInput[]
    upsert?: MatchUpsertWithWhereUniqueWithoutChampionshipInput | MatchUpsertWithWhereUniqueWithoutChampionshipInput[]
    createMany?: MatchCreateManyChampionshipInputEnvelope
    set?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    disconnect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    delete?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    update?: MatchUpdateWithWhereUniqueWithoutChampionshipInput | MatchUpdateWithWhereUniqueWithoutChampionshipInput[]
    updateMany?: MatchUpdateManyWithWhereWithoutChampionshipInput | MatchUpdateManyWithWhereWithoutChampionshipInput[]
    deleteMany?: MatchScalarWhereInput | MatchScalarWhereInput[]
  }

  export type MatchCreateNestedManyWithoutStadiumInput = {
    create?: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput> | MatchCreateWithoutStadiumInput[] | MatchUncheckedCreateWithoutStadiumInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutStadiumInput | MatchCreateOrConnectWithoutStadiumInput[]
    createMany?: MatchCreateManyStadiumInputEnvelope
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
  }

  export type MatchUncheckedCreateNestedManyWithoutStadiumInput = {
    create?: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput> | MatchCreateWithoutStadiumInput[] | MatchUncheckedCreateWithoutStadiumInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutStadiumInput | MatchCreateOrConnectWithoutStadiumInput[]
    createMany?: MatchCreateManyStadiumInputEnvelope
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
  }

  export type MatchUpdateManyWithoutStadiumNestedInput = {
    create?: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput> | MatchCreateWithoutStadiumInput[] | MatchUncheckedCreateWithoutStadiumInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutStadiumInput | MatchCreateOrConnectWithoutStadiumInput[]
    upsert?: MatchUpsertWithWhereUniqueWithoutStadiumInput | MatchUpsertWithWhereUniqueWithoutStadiumInput[]
    createMany?: MatchCreateManyStadiumInputEnvelope
    set?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    disconnect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    delete?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    update?: MatchUpdateWithWhereUniqueWithoutStadiumInput | MatchUpdateWithWhereUniqueWithoutStadiumInput[]
    updateMany?: MatchUpdateManyWithWhereWithoutStadiumInput | MatchUpdateManyWithWhereWithoutStadiumInput[]
    deleteMany?: MatchScalarWhereInput | MatchScalarWhereInput[]
  }

  export type MatchUncheckedUpdateManyWithoutStadiumNestedInput = {
    create?: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput> | MatchCreateWithoutStadiumInput[] | MatchUncheckedCreateWithoutStadiumInput[]
    connectOrCreate?: MatchCreateOrConnectWithoutStadiumInput | MatchCreateOrConnectWithoutStadiumInput[]
    upsert?: MatchUpsertWithWhereUniqueWithoutStadiumInput | MatchUpsertWithWhereUniqueWithoutStadiumInput[]
    createMany?: MatchCreateManyStadiumInputEnvelope
    set?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    disconnect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    delete?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    connect?: MatchWhereUniqueInput | MatchWhereUniqueInput[]
    update?: MatchUpdateWithWhereUniqueWithoutStadiumInput | MatchUpdateWithWhereUniqueWithoutStadiumInput[]
    updateMany?: MatchUpdateManyWithWhereWithoutStadiumInput | MatchUpdateManyWithWhereWithoutStadiumInput[]
    deleteMany?: MatchScalarWhereInput | MatchScalarWhereInput[]
  }

  export type ChampionshipCreateNestedOneWithoutMatchesInput = {
    create?: XOR<ChampionshipCreateWithoutMatchesInput, ChampionshipUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: ChampionshipCreateOrConnectWithoutMatchesInput
    connect?: ChampionshipWhereUniqueInput
  }

  export type StadiumCreateNestedOneWithoutMatchesInput = {
    create?: XOR<StadiumCreateWithoutMatchesInput, StadiumUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: StadiumCreateOrConnectWithoutMatchesInput
    connect?: StadiumWhereUniqueInput
  }

  export type MatchOfficialCreateNestedManyWithoutMatchInput = {
    create?: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput> | MatchOfficialCreateWithoutMatchInput[] | MatchOfficialUncheckedCreateWithoutMatchInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutMatchInput | MatchOfficialCreateOrConnectWithoutMatchInput[]
    createMany?: MatchOfficialCreateManyMatchInputEnvelope
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
  }

  export type MatchOfficialUncheckedCreateNestedManyWithoutMatchInput = {
    create?: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput> | MatchOfficialCreateWithoutMatchInput[] | MatchOfficialUncheckedCreateWithoutMatchInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutMatchInput | MatchOfficialCreateOrConnectWithoutMatchInput[]
    createMany?: MatchOfficialCreateManyMatchInputEnvelope
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
  }

  export type EnumMatchStatusFieldUpdateOperationsInput = {
    set?: $Enums.MatchStatus
  }

  export type ChampionshipUpdateOneRequiredWithoutMatchesNestedInput = {
    create?: XOR<ChampionshipCreateWithoutMatchesInput, ChampionshipUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: ChampionshipCreateOrConnectWithoutMatchesInput
    upsert?: ChampionshipUpsertWithoutMatchesInput
    connect?: ChampionshipWhereUniqueInput
    update?: XOR<XOR<ChampionshipUpdateToOneWithWhereWithoutMatchesInput, ChampionshipUpdateWithoutMatchesInput>, ChampionshipUncheckedUpdateWithoutMatchesInput>
  }

  export type StadiumUpdateOneRequiredWithoutMatchesNestedInput = {
    create?: XOR<StadiumCreateWithoutMatchesInput, StadiumUncheckedCreateWithoutMatchesInput>
    connectOrCreate?: StadiumCreateOrConnectWithoutMatchesInput
    upsert?: StadiumUpsertWithoutMatchesInput
    connect?: StadiumWhereUniqueInput
    update?: XOR<XOR<StadiumUpdateToOneWithWhereWithoutMatchesInput, StadiumUpdateWithoutMatchesInput>, StadiumUncheckedUpdateWithoutMatchesInput>
  }

  export type MatchOfficialUpdateManyWithoutMatchNestedInput = {
    create?: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput> | MatchOfficialCreateWithoutMatchInput[] | MatchOfficialUncheckedCreateWithoutMatchInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutMatchInput | MatchOfficialCreateOrConnectWithoutMatchInput[]
    upsert?: MatchOfficialUpsertWithWhereUniqueWithoutMatchInput | MatchOfficialUpsertWithWhereUniqueWithoutMatchInput[]
    createMany?: MatchOfficialCreateManyMatchInputEnvelope
    set?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    disconnect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    delete?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    update?: MatchOfficialUpdateWithWhereUniqueWithoutMatchInput | MatchOfficialUpdateWithWhereUniqueWithoutMatchInput[]
    updateMany?: MatchOfficialUpdateManyWithWhereWithoutMatchInput | MatchOfficialUpdateManyWithWhereWithoutMatchInput[]
    deleteMany?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
  }

  export type MatchOfficialUncheckedUpdateManyWithoutMatchNestedInput = {
    create?: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput> | MatchOfficialCreateWithoutMatchInput[] | MatchOfficialUncheckedCreateWithoutMatchInput[]
    connectOrCreate?: MatchOfficialCreateOrConnectWithoutMatchInput | MatchOfficialCreateOrConnectWithoutMatchInput[]
    upsert?: MatchOfficialUpsertWithWhereUniqueWithoutMatchInput | MatchOfficialUpsertWithWhereUniqueWithoutMatchInput[]
    createMany?: MatchOfficialCreateManyMatchInputEnvelope
    set?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    disconnect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    delete?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    connect?: MatchOfficialWhereUniqueInput | MatchOfficialWhereUniqueInput[]
    update?: MatchOfficialUpdateWithWhereUniqueWithoutMatchInput | MatchOfficialUpdateWithWhereUniqueWithoutMatchInput[]
    updateMany?: MatchOfficialUpdateManyWithWhereWithoutMatchInput | MatchOfficialUpdateManyWithWhereWithoutMatchInput[]
    deleteMany?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
  }

  export type MatchCreateNestedOneWithoutOfficialsInput = {
    create?: XOR<MatchCreateWithoutOfficialsInput, MatchUncheckedCreateWithoutOfficialsInput>
    connectOrCreate?: MatchCreateOrConnectWithoutOfficialsInput
    connect?: MatchWhereUniqueInput
  }

  export type OfficialCreateNestedOneWithoutScalesInput = {
    create?: XOR<OfficialCreateWithoutScalesInput, OfficialUncheckedCreateWithoutScalesInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutScalesInput
    connect?: OfficialWhereUniqueInput
  }

  export type EnumOfficialRoleFieldUpdateOperationsInput = {
    set?: $Enums.OfficialRole
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type MatchUpdateOneRequiredWithoutOfficialsNestedInput = {
    create?: XOR<MatchCreateWithoutOfficialsInput, MatchUncheckedCreateWithoutOfficialsInput>
    connectOrCreate?: MatchCreateOrConnectWithoutOfficialsInput
    upsert?: MatchUpsertWithoutOfficialsInput
    connect?: MatchWhereUniqueInput
    update?: XOR<XOR<MatchUpdateToOneWithWhereWithoutOfficialsInput, MatchUpdateWithoutOfficialsInput>, MatchUncheckedUpdateWithoutOfficialsInput>
  }

  export type OfficialUpdateOneRequiredWithoutScalesNestedInput = {
    create?: XOR<OfficialCreateWithoutScalesInput, OfficialUncheckedCreateWithoutScalesInput>
    connectOrCreate?: OfficialCreateOrConnectWithoutScalesInput
    upsert?: OfficialUpsertWithoutScalesInput
    connect?: OfficialWhereUniqueInput
    update?: XOR<XOR<OfficialUpdateToOneWithWhereWithoutScalesInput, OfficialUpdateWithoutScalesInput>, OfficialUncheckedUpdateWithoutScalesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
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
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumMatchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | EnumMatchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMatchStatusFilter<$PrismaModel> | $Enums.MatchStatus
  }

  export type NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatchStatus | EnumMatchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MatchStatus[] | ListEnumMatchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMatchStatusWithAggregatesFilter<$PrismaModel> | $Enums.MatchStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMatchStatusFilter<$PrismaModel>
    _max?: NestedEnumMatchStatusFilter<$PrismaModel>
  }

  export type NestedEnumOfficialRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.OfficialRole | EnumOfficialRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOfficialRoleFilter<$PrismaModel> | $Enums.OfficialRole
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedEnumOfficialRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OfficialRole | EnumOfficialRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OfficialRole[] | ListEnumOfficialRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOfficialRoleWithAggregatesFilter<$PrismaModel> | $Enums.OfficialRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOfficialRoleFilter<$PrismaModel>
    _max?: NestedEnumOfficialRoleFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type OfficialCreateWithoutUserInput = {
    id?: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    scales?: MatchOfficialCreateNestedManyWithoutOfficialInput
  }

  export type OfficialUncheckedCreateWithoutUserInput = {
    id?: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    scales?: MatchOfficialUncheckedCreateNestedManyWithoutOfficialInput
  }

  export type OfficialCreateOrConnectWithoutUserInput = {
    where: OfficialWhereUniqueInput
    create: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
  }

  export type OfficialUpsertWithoutUserInput = {
    update: XOR<OfficialUpdateWithoutUserInput, OfficialUncheckedUpdateWithoutUserInput>
    create: XOR<OfficialCreateWithoutUserInput, OfficialUncheckedCreateWithoutUserInput>
    where?: OfficialWhereInput
  }

  export type OfficialUpdateToOneWithWhereWithoutUserInput = {
    where?: OfficialWhereInput
    data: XOR<OfficialUpdateWithoutUserInput, OfficialUncheckedUpdateWithoutUserInput>
  }

  export type OfficialUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scales?: MatchOfficialUpdateManyWithoutOfficialNestedInput
  }

  export type OfficialUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scales?: MatchOfficialUncheckedUpdateManyWithoutOfficialNestedInput
  }

  export type UserCreateWithoutOfficialInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutOfficialInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutOfficialInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOfficialInput, UserUncheckedCreateWithoutOfficialInput>
  }

  export type MatchOfficialCreateWithoutOfficialInput = {
    id?: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
    match: MatchCreateNestedOneWithoutOfficialsInput
  }

  export type MatchOfficialUncheckedCreateWithoutOfficialInput = {
    id?: string
    matchId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialCreateOrConnectWithoutOfficialInput = {
    where: MatchOfficialWhereUniqueInput
    create: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput>
  }

  export type MatchOfficialCreateManyOfficialInputEnvelope = {
    data: MatchOfficialCreateManyOfficialInput | MatchOfficialCreateManyOfficialInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutOfficialInput = {
    update: XOR<UserUpdateWithoutOfficialInput, UserUncheckedUpdateWithoutOfficialInput>
    create: XOR<UserCreateWithoutOfficialInput, UserUncheckedCreateWithoutOfficialInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOfficialInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOfficialInput, UserUncheckedUpdateWithoutOfficialInput>
  }

  export type UserUpdateWithoutOfficialInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutOfficialInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialUpsertWithWhereUniqueWithoutOfficialInput = {
    where: MatchOfficialWhereUniqueInput
    update: XOR<MatchOfficialUpdateWithoutOfficialInput, MatchOfficialUncheckedUpdateWithoutOfficialInput>
    create: XOR<MatchOfficialCreateWithoutOfficialInput, MatchOfficialUncheckedCreateWithoutOfficialInput>
  }

  export type MatchOfficialUpdateWithWhereUniqueWithoutOfficialInput = {
    where: MatchOfficialWhereUniqueInput
    data: XOR<MatchOfficialUpdateWithoutOfficialInput, MatchOfficialUncheckedUpdateWithoutOfficialInput>
  }

  export type MatchOfficialUpdateManyWithWhereWithoutOfficialInput = {
    where: MatchOfficialScalarWhereInput
    data: XOR<MatchOfficialUpdateManyMutationInput, MatchOfficialUncheckedUpdateManyWithoutOfficialInput>
  }

  export type MatchOfficialScalarWhereInput = {
    AND?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
    OR?: MatchOfficialScalarWhereInput[]
    NOT?: MatchOfficialScalarWhereInput | MatchOfficialScalarWhereInput[]
    id?: StringFilter<"MatchOfficial"> | string
    matchId?: StringFilter<"MatchOfficial"> | string
    officialId?: StringFilter<"MatchOfficial"> | string
    role?: EnumOfficialRoleFilter<"MatchOfficial"> | $Enums.OfficialRole
    confirmed?: BoolNullableFilter<"MatchOfficial"> | boolean | null
    createdAt?: DateTimeFilter<"MatchOfficial"> | Date | string
  }

  export type MatchCreateWithoutChampionshipInput = {
    id?: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stadium: StadiumCreateNestedOneWithoutMatchesInput
    officials?: MatchOfficialCreateNestedManyWithoutMatchInput
  }

  export type MatchUncheckedCreateWithoutChampionshipInput = {
    id?: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    officials?: MatchOfficialUncheckedCreateNestedManyWithoutMatchInput
  }

  export type MatchCreateOrConnectWithoutChampionshipInput = {
    where: MatchWhereUniqueInput
    create: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput>
  }

  export type MatchCreateManyChampionshipInputEnvelope = {
    data: MatchCreateManyChampionshipInput | MatchCreateManyChampionshipInput[]
    skipDuplicates?: boolean
  }

  export type MatchUpsertWithWhereUniqueWithoutChampionshipInput = {
    where: MatchWhereUniqueInput
    update: XOR<MatchUpdateWithoutChampionshipInput, MatchUncheckedUpdateWithoutChampionshipInput>
    create: XOR<MatchCreateWithoutChampionshipInput, MatchUncheckedCreateWithoutChampionshipInput>
  }

  export type MatchUpdateWithWhereUniqueWithoutChampionshipInput = {
    where: MatchWhereUniqueInput
    data: XOR<MatchUpdateWithoutChampionshipInput, MatchUncheckedUpdateWithoutChampionshipInput>
  }

  export type MatchUpdateManyWithWhereWithoutChampionshipInput = {
    where: MatchScalarWhereInput
    data: XOR<MatchUpdateManyMutationInput, MatchUncheckedUpdateManyWithoutChampionshipInput>
  }

  export type MatchScalarWhereInput = {
    AND?: MatchScalarWhereInput | MatchScalarWhereInput[]
    OR?: MatchScalarWhereInput[]
    NOT?: MatchScalarWhereInput | MatchScalarWhereInput[]
    id?: StringFilter<"Match"> | string
    championshipId?: StringFilter<"Match"> | string
    stadiumId?: StringFilter<"Match"> | string
    homeTeam?: StringFilter<"Match"> | string
    awayTeam?: StringFilter<"Match"> | string
    matchDate?: DateTimeFilter<"Match"> | Date | string
    status?: EnumMatchStatusFilter<"Match"> | $Enums.MatchStatus
    createdAt?: DateTimeFilter<"Match"> | Date | string
    updatedAt?: DateTimeFilter<"Match"> | Date | string
  }

  export type MatchCreateWithoutStadiumInput = {
    id?: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    championship: ChampionshipCreateNestedOneWithoutMatchesInput
    officials?: MatchOfficialCreateNestedManyWithoutMatchInput
  }

  export type MatchUncheckedCreateWithoutStadiumInput = {
    id?: string
    championshipId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    officials?: MatchOfficialUncheckedCreateNestedManyWithoutMatchInput
  }

  export type MatchCreateOrConnectWithoutStadiumInput = {
    where: MatchWhereUniqueInput
    create: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput>
  }

  export type MatchCreateManyStadiumInputEnvelope = {
    data: MatchCreateManyStadiumInput | MatchCreateManyStadiumInput[]
    skipDuplicates?: boolean
  }

  export type MatchUpsertWithWhereUniqueWithoutStadiumInput = {
    where: MatchWhereUniqueInput
    update: XOR<MatchUpdateWithoutStadiumInput, MatchUncheckedUpdateWithoutStadiumInput>
    create: XOR<MatchCreateWithoutStadiumInput, MatchUncheckedCreateWithoutStadiumInput>
  }

  export type MatchUpdateWithWhereUniqueWithoutStadiumInput = {
    where: MatchWhereUniqueInput
    data: XOR<MatchUpdateWithoutStadiumInput, MatchUncheckedUpdateWithoutStadiumInput>
  }

  export type MatchUpdateManyWithWhereWithoutStadiumInput = {
    where: MatchScalarWhereInput
    data: XOR<MatchUpdateManyMutationInput, MatchUncheckedUpdateManyWithoutStadiumInput>
  }

  export type ChampionshipCreateWithoutMatchesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChampionshipUncheckedCreateWithoutMatchesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChampionshipCreateOrConnectWithoutMatchesInput = {
    where: ChampionshipWhereUniqueInput
    create: XOR<ChampionshipCreateWithoutMatchesInput, ChampionshipUncheckedCreateWithoutMatchesInput>
  }

  export type StadiumCreateWithoutMatchesInput = {
    id?: string
    name: string
    city: string
    state: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StadiumUncheckedCreateWithoutMatchesInput = {
    id?: string
    name: string
    city: string
    state: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StadiumCreateOrConnectWithoutMatchesInput = {
    where: StadiumWhereUniqueInput
    create: XOR<StadiumCreateWithoutMatchesInput, StadiumUncheckedCreateWithoutMatchesInput>
  }

  export type MatchOfficialCreateWithoutMatchInput = {
    id?: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
    official: OfficialCreateNestedOneWithoutScalesInput
  }

  export type MatchOfficialUncheckedCreateWithoutMatchInput = {
    id?: string
    officialId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialCreateOrConnectWithoutMatchInput = {
    where: MatchOfficialWhereUniqueInput
    create: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput>
  }

  export type MatchOfficialCreateManyMatchInputEnvelope = {
    data: MatchOfficialCreateManyMatchInput | MatchOfficialCreateManyMatchInput[]
    skipDuplicates?: boolean
  }

  export type ChampionshipUpsertWithoutMatchesInput = {
    update: XOR<ChampionshipUpdateWithoutMatchesInput, ChampionshipUncheckedUpdateWithoutMatchesInput>
    create: XOR<ChampionshipCreateWithoutMatchesInput, ChampionshipUncheckedCreateWithoutMatchesInput>
    where?: ChampionshipWhereInput
  }

  export type ChampionshipUpdateToOneWithWhereWithoutMatchesInput = {
    where?: ChampionshipWhereInput
    data: XOR<ChampionshipUpdateWithoutMatchesInput, ChampionshipUncheckedUpdateWithoutMatchesInput>
  }

  export type ChampionshipUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChampionshipUncheckedUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StadiumUpsertWithoutMatchesInput = {
    update: XOR<StadiumUpdateWithoutMatchesInput, StadiumUncheckedUpdateWithoutMatchesInput>
    create: XOR<StadiumCreateWithoutMatchesInput, StadiumUncheckedCreateWithoutMatchesInput>
    where?: StadiumWhereInput
  }

  export type StadiumUpdateToOneWithWhereWithoutMatchesInput = {
    where?: StadiumWhereInput
    data: XOR<StadiumUpdateWithoutMatchesInput, StadiumUncheckedUpdateWithoutMatchesInput>
  }

  export type StadiumUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StadiumUncheckedUpdateWithoutMatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialUpsertWithWhereUniqueWithoutMatchInput = {
    where: MatchOfficialWhereUniqueInput
    update: XOR<MatchOfficialUpdateWithoutMatchInput, MatchOfficialUncheckedUpdateWithoutMatchInput>
    create: XOR<MatchOfficialCreateWithoutMatchInput, MatchOfficialUncheckedCreateWithoutMatchInput>
  }

  export type MatchOfficialUpdateWithWhereUniqueWithoutMatchInput = {
    where: MatchOfficialWhereUniqueInput
    data: XOR<MatchOfficialUpdateWithoutMatchInput, MatchOfficialUncheckedUpdateWithoutMatchInput>
  }

  export type MatchOfficialUpdateManyWithWhereWithoutMatchInput = {
    where: MatchOfficialScalarWhereInput
    data: XOR<MatchOfficialUpdateManyMutationInput, MatchOfficialUncheckedUpdateManyWithoutMatchInput>
  }

  export type MatchCreateWithoutOfficialsInput = {
    id?: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    championship: ChampionshipCreateNestedOneWithoutMatchesInput
    stadium: StadiumCreateNestedOneWithoutMatchesInput
  }

  export type MatchUncheckedCreateWithoutOfficialsInput = {
    id?: string
    championshipId: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MatchCreateOrConnectWithoutOfficialsInput = {
    where: MatchWhereUniqueInput
    create: XOR<MatchCreateWithoutOfficialsInput, MatchUncheckedCreateWithoutOfficialsInput>
  }

  export type OfficialCreateWithoutScalesInput = {
    id?: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutOfficialInput
  }

  export type OfficialUncheckedCreateWithoutScalesInput = {
    id?: string
    userId: string
    phone?: string | null
    pixKey?: string | null
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OfficialCreateOrConnectWithoutScalesInput = {
    where: OfficialWhereUniqueInput
    create: XOR<OfficialCreateWithoutScalesInput, OfficialUncheckedCreateWithoutScalesInput>
  }

  export type MatchUpsertWithoutOfficialsInput = {
    update: XOR<MatchUpdateWithoutOfficialsInput, MatchUncheckedUpdateWithoutOfficialsInput>
    create: XOR<MatchCreateWithoutOfficialsInput, MatchUncheckedCreateWithoutOfficialsInput>
    where?: MatchWhereInput
  }

  export type MatchUpdateToOneWithWhereWithoutOfficialsInput = {
    where?: MatchWhereInput
    data: XOR<MatchUpdateWithoutOfficialsInput, MatchUncheckedUpdateWithoutOfficialsInput>
  }

  export type MatchUpdateWithoutOfficialsInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    championship?: ChampionshipUpdateOneRequiredWithoutMatchesNestedInput
    stadium?: StadiumUpdateOneRequiredWithoutMatchesNestedInput
  }

  export type MatchUncheckedUpdateWithoutOfficialsInput = {
    id?: StringFieldUpdateOperationsInput | string
    championshipId?: StringFieldUpdateOperationsInput | string
    stadiumId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OfficialUpsertWithoutScalesInput = {
    update: XOR<OfficialUpdateWithoutScalesInput, OfficialUncheckedUpdateWithoutScalesInput>
    create: XOR<OfficialCreateWithoutScalesInput, OfficialUncheckedCreateWithoutScalesInput>
    where?: OfficialWhereInput
  }

  export type OfficialUpdateToOneWithWhereWithoutScalesInput = {
    where?: OfficialWhereInput
    data: XOR<OfficialUpdateWithoutScalesInput, OfficialUncheckedUpdateWithoutScalesInput>
  }

  export type OfficialUpdateWithoutScalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOfficialNestedInput
  }

  export type OfficialUncheckedUpdateWithoutScalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    pixKey?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialCreateManyOfficialInput = {
    id?: string
    matchId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialUpdateWithoutOfficialInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    match?: MatchUpdateOneRequiredWithoutOfficialsNestedInput
  }

  export type MatchOfficialUncheckedUpdateWithoutOfficialInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialUncheckedUpdateManyWithoutOfficialInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchCreateManyChampionshipInput = {
    id?: string
    stadiumId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MatchUpdateWithoutChampionshipInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stadium?: StadiumUpdateOneRequiredWithoutMatchesNestedInput
    officials?: MatchOfficialUpdateManyWithoutMatchNestedInput
  }

  export type MatchUncheckedUpdateWithoutChampionshipInput = {
    id?: StringFieldUpdateOperationsInput | string
    stadiumId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    officials?: MatchOfficialUncheckedUpdateManyWithoutMatchNestedInput
  }

  export type MatchUncheckedUpdateManyWithoutChampionshipInput = {
    id?: StringFieldUpdateOperationsInput | string
    stadiumId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchCreateManyStadiumInput = {
    id?: string
    championshipId: string
    homeTeam: string
    awayTeam: string
    matchDate: Date | string
    status?: $Enums.MatchStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MatchUpdateWithoutStadiumInput = {
    id?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    championship?: ChampionshipUpdateOneRequiredWithoutMatchesNestedInput
    officials?: MatchOfficialUpdateManyWithoutMatchNestedInput
  }

  export type MatchUncheckedUpdateWithoutStadiumInput = {
    id?: StringFieldUpdateOperationsInput | string
    championshipId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    officials?: MatchOfficialUncheckedUpdateManyWithoutMatchNestedInput
  }

  export type MatchUncheckedUpdateManyWithoutStadiumInput = {
    id?: StringFieldUpdateOperationsInput | string
    championshipId?: StringFieldUpdateOperationsInput | string
    homeTeam?: StringFieldUpdateOperationsInput | string
    awayTeam?: StringFieldUpdateOperationsInput | string
    matchDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMatchStatusFieldUpdateOperationsInput | $Enums.MatchStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialCreateManyMatchInput = {
    id?: string
    officialId: string
    role: $Enums.OfficialRole
    confirmed?: boolean | null
    createdAt?: Date | string
  }

  export type MatchOfficialUpdateWithoutMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    official?: OfficialUpdateOneRequiredWithoutScalesNestedInput
  }

  export type MatchOfficialUncheckedUpdateWithoutMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    officialId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MatchOfficialUncheckedUpdateManyWithoutMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    officialId?: StringFieldUpdateOperationsInput | string
    role?: EnumOfficialRoleFieldUpdateOperationsInput | $Enums.OfficialRole
    confirmed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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