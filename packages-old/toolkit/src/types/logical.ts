export type If<Cond extends boolean, True, False> = Cond extends true ? True : False;

export type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : (B extends true ? true : false);
