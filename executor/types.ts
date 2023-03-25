export interface LynxCreateOp {
  method: "lynx_create";
  params: {
    eoa: string;
    v: number;
    r: string;
    s: string;
  };
}

export interface LynxCallOp {
  method: "lynx_call";
  params: {
    data: string;
    to?: string;
    value?: string;
  };
}

export type UserOp = LynxCallOp | LynxCreateOp;
