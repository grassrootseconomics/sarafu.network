export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };
